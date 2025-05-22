import whisper

model = whisper.load_model("base")  # or "small" / "medium" depending on speed vs quality tradeoff

def transcribe_audio(audio_path):
    result = model.transcribe(audio_path)
    return result['text']
