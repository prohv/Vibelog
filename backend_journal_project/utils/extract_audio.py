from moviepy.editor import VideoFileClip
import os

def extract_audio(video_path):
    audio_path = video_path.rsplit('.', 1)[0] + '.wav'  # same name as video, but .wav
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)
    return audio_path
