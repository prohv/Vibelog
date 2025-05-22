from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from faster_whisper import WhisperModel
from transformers import pipeline
from nltk.tokenize import sent_tokenize
import nltk
import shutil, os, re

# Download NLTK Punkt tokenizer for sentence splitting
nltk.download("punkt_tab")
nltk.download("punkt")

app = FastAPI()

# Load Whisper model
model = WhisperModel("large-v2", compute_type="int8", device="cpu")

# Load HuggingFace sentiment analysis pipeline
sentiment_pipeline = pipeline("sentiment-analysis")

# Serve static HTML files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def home():
    with open("static/index.html", "r") as f:
        return f.read()

def further_split(sentence):
    # Split on 'and', 'but', and commas, but keep the delimiters for context
    # This is a simple heuristic and can be improved further
    clauses = re.split(r'\s*(?:and|but|,)\s*', sentence)
    return [clause.strip() for clause in clauses if clause.strip()]

def classify_events_and_mood(transcript: str):
    sentences = sent_tokenize(transcript)
    all_clauses = []
    for sentence in sentences:
        all_clauses.extend(further_split(sentence))

    classified_events = []
    positive_count = 0
    negative_count = 0
    neutral_count = 0

    for clause in all_clauses:
        result = sentiment_pipeline(clause)[0]
        label = result["label"]
        score = result["score"]

        # Consider low confidence predictions as neutral
        if score < 0.7:
            label = "NEUTRAL"
            neutral_count += 1
        elif label == "POSITIVE":
            positive_count += 1
        elif label == "NEGATIVE":
            negative_count += 1

        classified_events.append({
            "sentence": clause,
            "label": label,
            "confidence": round(score, 2)
        })

    # Mood summary logic
    if positive_count > negative_count and positive_count > neutral_count:
        mood = "Positive"
        message = "Kudos for keeping your day happy! Keep spreading that positive energy!"
    elif negative_count > positive_count and negative_count > neutral_count:
        mood = "Negative"
        message = "Tomorrow is a new day with new opportunities. Be kind to yourself and focus on the positive things ahead."
    else:
        mood = "Neutral"
        message = "You've maintained a balanced day. Try to cherish the positive moments and learn from the challenging ones."

    return {
        "classified_events": classified_events,
        "summary": {
            "positive": positive_count,
            "negative": negative_count,
            "neutral": neutral_count,
            "overall_mood": mood,
            "motivational_message": message
        }
    }

@app.post("/upload-audio")
async def upload_audio(audio: UploadFile = File(...)):
    temp_path = f"temp_{audio.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    # Transcription (use translation if needed)
    segments, _ = model.transcribe(temp_path, task="translate")
    transcript = " ".join([seg.text for seg in segments])
    os.remove(temp_path)

    # Tonal analysis
    sentiment_result = classify_events_and_mood(transcript)

    return {
        "translated_text": transcript,
        "sentiment_analysis": sentiment_result
    }
