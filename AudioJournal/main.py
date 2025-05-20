import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from faster_whisper import WhisperModel
import shutil, os

app = FastAPI()
model = WhisperModel("large-v2", compute_type="int8", device="cpu")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def home():
    with open("static/index.html", "r") as f:
        return f.read()

@app.post("/upload-audio")
async def upload_audio(audio: UploadFile = File(...)):
    temp_path = f"temp_{audio.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    segments, _ = model.transcribe(temp_path, task="translate")
    transcript = " ".join([seg.text for seg in segments])
    os.remove(temp_path)

    return {"translated_text": transcript}