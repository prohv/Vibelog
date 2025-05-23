# Vibelog
CSI Internal-Hack Project by Team-4
<br>
Direct Link : https://vibelog-sigma.vercel.app/









# 🎯 Journal Insight Backend - FastAPI Based Video Summarizer

This is the backend for the **Journal Insight** project – a FastAPI-powered service that:
- Downloads a video from a URL
- Extracts audio using FFmpeg
- Transcribes speech using OpenAI’s Whisper model
- Detects dominant emotion in the video
- Generates a summary and insights from the transcription

---

## ⚙️ Setup Instructions

> 💡 **Note:** It's **strongly recommended** to create a virtual environment to isolate dependencies.
>
> ### Create one using:
> **CMD (Windows):**
> ```
> python -m venv venv
> venv\Scripts\activate
> ```
>  
> **Terminal (Mac/Linux):**
> ```
> python3 -m venv venv
> source venv/bin/activate
> ```

---

### ✅ Prerequisites

1. **Python 3.10.9**  
   Download from [here](https://www.python.org/downloads/release/python-3109/).  
   Make sure it's added to your PATH and used as the default version (you can verify using `python --version`).

2. **FFmpeg (Required for audio extraction for windows)**  
   - Download: [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
   - Click on Windows → download the ffmpeg-release-essentials.zip
   - Extract the ZIP file to a location of your choice (e.g., C:\ffmpeg)
   - Inside the extracted folder, find the bin directory (e.g., C:\ffmpeg\bin)
   - Copy the full path to the bin folder
   **Add FFmpeg to PATH**
   - Press Windows Key and search for “Environment Variables”
   - Click “Edit the system environment variables”
   - In the System Properties window, click “Environment Variables…”
   - Under System variables, scroll and select the Path variable, then click Edit
   - Click New, paste the path to the bin directory (e.g., C:\ffmpeg\bin)
   - Click OK on all windows to apply changes


---

## 🚀 Getting Started

bash
# 1. Clone the repo

# 2. (If not done already) Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

# 3. Install all dependencies
pip install -r requirements.txt

# 4. Run the FastAPI server
uvicorn app:app --reload
