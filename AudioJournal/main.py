from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from faster_whisper import WhisperModel
from transformers import pipeline
from nltk.tokenize import sent_tokenize
import nltk
import shutil, os

# Download NLTK Punkt tokenizer for sentence splitting
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


def classify_events_and_mood(transcript: str):
    sentences = sent_tokenize(transcript)

    classified_events = []
    positive_count = 0
    negative_count = 0

    for sentence in sentences:
        result = sentiment_pipeline(sentence)[0]
        label = result["label"]
        score = result["score"]

        if label == "POSITIVE":
            positive_count += 1
        elif label == "NEGATIVE":
            negative_count += 1

        classified_events.append({
            "sentence": sentence,
            "label": label,
            "confidence": round(score, 2)
        })

    # Mood summary logic
    if positive_count > negative_count:
        mood = "Positive"
    elif negative_count > positive_count:
        mood = "Negative"
    else:
        mood = "Mixed"

    return {
        "classified_events": classified_events,
        "summary": {
            "positive": positive_count,
            "negative": negative_count,
            "overall_mood": mood
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
