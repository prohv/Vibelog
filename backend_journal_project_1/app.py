from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import datetime
import requests
from werkzeug.utils import secure_filename
from utils.extract_audio import extract_audio
from utils.transcribe import transcribe_audio
from utils.generate_text import generate_summary_and_insights
from utils.detect_emotion import get_dominant_emotion  # ← NEW IMPORT

app = FastAPI()

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class VideoURL(BaseModel):
    video_url: str

@app.post("/analyze")
async def analyze_video(data: VideoURL):
    video_url = data.video_url

    if not video_url:
        raise HTTPException(status_code=400, detail="Video URL is required")

    try:
        # Get filename from URL (or generate one)
        filename = secure_filename(video_url.split('/')[-1])
        if not filename.endswith('.mp4'):
            filename += '.mp4'

        video_path = os.path.join(UPLOAD_FOLDER, filename)

        # Step 1: Download video from URL
        with requests.get(video_url, stream=True) as r:
            r.raise_for_status()
            with open(video_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

        # Step 2: Extract audio
        audio_path = extract_audio(video_path)

        # Step 2.5: Emotion Detection from video
        dominant_emotion = get_dominant_emotion(video_path)

        # Step 3: Transcribe audio
        transcript = transcribe_audio(audio_path)

        # Step 4: Generate summary and insights
        summary, insights = generate_summary_and_insights(transcript)

        # Clean up temp files
        os.remove(video_path)
        os.remove(audio_path)

        # Step 5: Return result to frontend
        return {
            'summary': summary,
            'insights': insights,
            'dominant_emotion': dominant_emotion,
            'date': datetime.date.today().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn app:app --reload
