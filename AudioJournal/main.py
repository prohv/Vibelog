from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import spacy
import torch
import os

app = FastAPI()

# Add CORS middleware here
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Load models
whisper_model = WhisperModel("large-v3", device="cpu")  # Use "cuda" if GPU
nlp = spacy.load("en_core_web_sm")

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
sentiment_model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")

# Keywords
POSITIVE_EVENTS = {"achieved", "completed", "passed", "won", "improved", "exercise", "jog", "ran", "meditated"}
NEGATIVE_EVENTS = {"failed", "forgot", "missed", "struggled", "argument", "sick", "exhausted"}

def smart_split(text: str) -> list:
    doc = nlp(text)
    clauses = []
    current_clause = []
    for sent in doc.sents:
        for token in sent:
            if token.dep_ in ("cc", "mark") or token.text.lower() in {"but", "although", "however"}:
                if current_clause:
                    clauses.append(" ".join(current_clause).strip())
                    current_clause = []
            current_clause.append(token.text)
        if current_clause:
            clauses.append(" ".join(current_clause).strip())
            current_clause = []
    return [c for c in clauses if 10 < len(c) < 500]

def analyze_sentiment(text: str) -> tuple:
    text_lower = text.lower()
    if any(kw in text_lower for kw in POSITIVE_EVENTS):
        return "POSITIVE", 0.99
    if any(kw in text_lower for kw in NEGATIVE_EVENTS):
        return "NEGATIVE", 0.99
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = sentiment_model(**inputs)
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    confidence, prediction = torch.max(probs, dim=1)
    return ("POSITIVE" if prediction.item() == 1 else "NEGATIVE", confidence.item())

def process_audio(path: str):
    segments, _ = whisper_model.transcribe(path)
    transcript = " ".join(segment.text for segment in segments)
    clauses = smart_split(transcript)
    analysis = []
    counts = {"POSITIVE": 0, "NEGATIVE": 0}
    for clause in clauses:
        sentiment, confidence = analyze_sentiment(clause)
        analysis.append({
            "sentence": clause,
            "label": sentiment,
            "confidence": f"{confidence*100:.0f}%"
        })
        counts[sentiment] += 1
    overall_mood = "POSITIVE" if counts["POSITIVE"] > counts["NEGATIVE"] else "NEGATIVE"
    motivational_message = (
        "Great job! Keep up the positive vibes!" if overall_mood == "POSITIVE"
        else "It's okay to have tough days. Tomorrow is a new start!"
    )
    return {
        "translated_text": transcript,
        "sentiment_analysis": {
            "classified_events": analysis,
            "summary": {
                "positive": counts["POSITIVE"],
                "negative": counts["NEGATIVE"],
                "neutral": 0,  # You can add neutral logic if needed
                "overall_mood": overall_mood,
                "motivational_message": motivational_message
            }
        }
    }

# Upload audio from file
@app.post("/upload-audio")
async def analyze_audio(audio: UploadFile = File(...)):
    import os
    temp_path = f"temp_{audio.filename}"
    with open(temp_path, "wb") as f:
        f.write(await audio.read())
    result = process_audio(temp_path)
    os.remove(temp_path)
    return result

# Real-time mic input as blob (.webm/.wav)
@app.post("/mic-audio")
async def mic_audio(file: UploadFile = File(...)):
    import subprocess
    import uuid
    temp_path = f"mic_{uuid.uuid4()}.webm"
    wav_path = temp_path.replace('.webm', '.wav')
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    ffmpeg_cmd = ["ffmpeg", "-y", "-i", temp_path, "-ar", "16000", "-ac", "1", wav_path]
    try:
        try:
            result = subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
        except FileNotFoundError:
            ffmpeg_cmd[0] = r"C:\\ffmpeg\\bin\\ffmpeg.exe"
            result = subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
        result = process_audio(wav_path)
    except Exception as e:
        os.remove(temp_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)
        # Print ffmpeg error output for debugging
        error_msg = str(e)
        if hasattr(e, 'stderr'):
            error_msg = e.stderr.decode()
        return {"error": f"Audio conversion failed: {error_msg}"}
    os.remove(temp_path)
    os.remove(wav_path)
    return result

@app.get("/", response_class=HTMLResponse)
async def home():
    with open("static/index.html", "r") as f:
        return HTMLResponse(f.read())
