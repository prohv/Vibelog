import React, { useRef, useState, useEffect } from "react";

export default function RecordAudio({ onResult }) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [animationId, setAnimationId] = useState(null);
  const [seconds, setSeconds] = useState(0); // Timer starts at 0 seconds

  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null); // Ref to store mediaRecorder
  const audioChunks = useRef([]);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Cleanup when component is unmounted
    return () => {
      clearInterval(intervalRef.current); // Clear interval
      if (audioContext) audioContext.close();
      if (animationId) cancelAnimationFrame(animationId);
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
    audioChunks.current = [];
    setSeconds(0); // Reset timer to 0 when starting

    // Start the timer with setInterval
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1); // Increment timer every second
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Store stream reference
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        // Clean up audio context and animation
        if (audioContext) audioContext.close();
        if (animationId) cancelAnimationFrame(animationId);

        // Process audio blob
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(audioBlob));
        uploadAudio(audioBlob);

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      recorder.onpause = () => {
        setPaused(true);
        clearInterval(intervalRef.current); // Pause the timer
      };
      recorder.onresume = () => {
        setPaused(false);
        intervalRef.current = setInterval(() => {
          setSeconds((prev) => prev + 1); // Resume the timer
        }, 1000);
      };
      recorder.start();
    } catch (err) {
      setError("Microphone access denied or unavailable.");
      setRecording(false);
      console.error("getUserMedia error:", err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setPaused(false);
      clearInterval(intervalRef.current); // Stop the timer
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      clearInterval(intervalRef.current); // Stop the timer when paused
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1); // Resume the timer
      }, 1000);
    }
  };

  // Upload audio to backend and convert it
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
              Pause
            </button>
            <button
              onClick={stopRecording}
              style={buttonStyle('danger')}
              disabled={isUploading}
              className="input-action-button"
            >
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
              Resume
            </button>
            <button
              onClick={stopRecording}
              style={buttonStyle('danger')}
              disabled={isUploading}
              className="input-action-button"
            >
              Stop
            </button>
          </>
        )}
      </div>
      {recording && (
        <>
          <div style={{ color: '#6366f1', fontWeight: 500, marginBottom: 8, fontSize: 16 }}>
            {paused ? 'Paused' : 'Recording...'} {Math.floor(seconds / 60)}:{seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60}
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
