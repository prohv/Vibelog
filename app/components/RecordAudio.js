import React, { useRef, useState, useEffect } from "react";

export default function RecordAudio({ onResult }) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [animationId, setAnimationId] = useState(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunks = useRef([]);
  const streamRef = useRef(null);
  const recorderRef = useRef(null); // <-- Add this at the top

  useEffect(() => {
    return () => {
      if (audioContext) audioContext.close();
      if (animationId) cancelAnimationFrame(animationId);
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, [audioContext, animationId]);

  // Draw waveform using analyser
  const drawWaveform = () => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteTimeDomainData(dataArray);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#7c3aed';
    ctx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    setAnimationId(requestAnimationFrame(drawWaveform));
  };

  // Start recording
  const startRecording = async () => {
    setError(null);
    setAudioURL(null);
    setRecording(true);
    setPaused(false);
    setTimer(0);
    audioChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Always use audio/webm for compatibility (as before)
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = recorder; // <-- Use recorderRef instead of mediaRecorderRef
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        if (audioContext) audioContext.close();
        if (animationId) cancelAnimationFrame(animationId);
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(audioBlob));
        uploadAudio(audioBlob); // Always upload as webm
      };
      recorder.onpause = () => setPaused(true);
      recorder.onresume = () => setPaused(false);
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      // Setup waveform
      const ctx = new window.AudioContext();
      setAudioContext(ctx);
      const src = ctx.createMediaStreamSource(stream);
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 2048;
      src.connect(analyserNode);
      setAnalyser(analyserNode);
      setAnimationId(requestAnimationFrame(drawWaveform));
    } catch (err) {
      setError("Microphone access denied or unavailable.");
      setRecording(false);
      // Log the actual error for debugging
      console.error("getUserMedia error:", err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setPaused(false);
      clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Pause
  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      clearInterval(timerRef.current);
    }
  };

  // Resume
  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
  };

  // Upload
  const uploadAudio = async (audioBlob) => {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
    try {
      const response = await fetch("http://127.0.0.1:8000/mic-audio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (onResult) onResult(data);
    } catch (err) {
      setError("Failed to upload audio.");
    } finally {
      setIsUploading(false);
    }
  };

  // Button styles to match dashboard
  const buttonStyle = (base) => ({
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    background: base === 'danger'
      ? 'linear-gradient(to right, #c0392b, #a83279)'
      : 'linear-gradient(to right, #7c3aed, #4c1d95)',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: isUploading ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 10px rgba(76, 29, 149, 0.2)',
    transition: 'all 0.3s ease',
    margin: '0 0.5rem',
    minWidth: 160,
    minHeight: 48,
    opacity: isUploading ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...(base === 'danger' && { borderColor: '#c0392b' })
  });

  return (
    <div style={{ textAlign: 'center', margin: 16, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
        {!recording && (
          <button
            onClick={startRecording}
            style={buttonStyle('primary')}
            disabled={isUploading}
            className="input-action-button"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 15a3.5 3.5 0 0 0 3.5-3.5V7a3.5 3.5 0 0 0-7 0v4.5A3.5 3.5 0 0 0 12 15Zm5-3.5a1 1 0 1 1 2 0c0 4.08-3.06 7.44-7 7.93V22a1 1 0 1 1-2 0v-2.57c-3.94-.49-7-3.85-7-7.93a1 1 0 1 1 2 0c0 3.31 2.69 6 6 6s6-2.69 6-6Z"/></svg>
            Start Recording
          </button>
        )}
        {recording && !paused && (
          <>
            <button
              onClick={pauseRecording}
              style={buttonStyle('primary')}
              disabled={isUploading}
              className="input-action-button"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="2" fill="#fff"/><rect x="14" y="4" width="4" height="16" rx="2" fill="#fff"/></svg>
              Pause
            </button>
            <button
              onClick={stopRecording}
              style={buttonStyle('danger')}
              disabled={isUploading}
              className="input-action-button"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" fill="#fff"/></svg>
              Stop
            </button>
          </>
        )}
        {recording && paused && (
          <>
            <button
              onClick={resumeRecording}
              style={buttonStyle('primary')}
              disabled={isUploading}
              className="input-action-button"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="#fff"/></svg>
              Resume
            </button>
            <button
              onClick={stopRecording}
              style={buttonStyle('danger')}
              disabled={isUploading}
              className="input-action-button"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" fill="#fff"/></svg>
              Stop
            </button>
          </>
        )}
      </div>
      {recording && (
        <>
          <div style={{ color: '#6366f1', fontWeight: 500, marginBottom: 8, fontSize: 16 }}>
            {paused ? 'Paused' : 'Recording...'} {timer}s
          </div>
          <canvas
            ref={canvasRef}
            width={340}
            height={60}
            style={{
              background: '#f3f0ff',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(139,92,246,0.10)',
              margin: '0 auto 16px auto',
              display: 'block',
              border: '1.5px solid #d8b4fe',
              width: '100%',
              maxWidth: 360
            }}
          />
        </>
      )}
      {isUploading && (
        <div style={{ color: '#6366f1', marginTop: 8, fontWeight: 500 }}>
          Uploading & Processing...
          <div style={{ width: 120, height: 6, background: '#eee', borderRadius: 6, margin: '8px auto 0 auto', overflow: 'hidden' }}>
            <div className="progress-bar-animation" style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #a78bfa 0%, #6366f1 100%)' }} />
          </div>
        </div>
      )}
      {audioURL && !recording && !isUploading && (
        <audio controls src={audioURL} style={{ marginTop: 12, width: '100%', maxWidth: 340 }} />
      )}
      {error && <div style={{ color: '#c0392b', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
