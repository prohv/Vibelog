import React, { useState } from "react";

export default function UploadAudio() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", selectedFile);  // Fixed field name

    try {
      const response = await fetch("http://localhost:8000/upload-audio", {  // Correct endpoint
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setResult(`
  Transcript: ${data.translated_text}
  Mood: ${data.sentiment_analysis.summary.overall_mood}
  Positive Events: ${data.sentiment_analysis.summary.positive}
  Negative Events: ${data.sentiment_analysis.summary.negative}
`);
    } catch (error) {
      console.error("Error:", error);
      setResult("Upload failed. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Audio</h2>
      <input type="file" onChange={handleFileChange} accept="audio/*" />
      <button onClick={handleUpload}>Upload</button>

      {result && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          <h3>Analysis Result:</h3>
          {result}
        </div>
      )}
    </div>
  );
}
