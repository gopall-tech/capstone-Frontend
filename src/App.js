import React, { useState } from "react";
import "./App.css";

function App() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadA = async () => {
    if (!fileA) {
      alert("Please select a file for Backend A");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileA);

    try {
      setLoading(true);
      const res = await fetch("/api/a", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadB = async () => {
    if (!fileB) {
      alert("Please select a file for Backend B");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileB);

    try {
      setLoading(true);
      const res = await fetch("/api/b", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gopal's Multi-Backend Image Upload</h1>
        <p>Upload images to Backend-A or Backend-B</p>
      </header>

      <div className="upload-container">
        <div className="upload-card">
          <h2>Backend A</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFileA(e.target.files[0])}
          />
          <button onClick={handleUploadA} disabled={loading}>
            {loading ? "Uploading..." : "Upload to A"}
          </button>
        </div>

        <div className="upload-card">
          <h2>Backend B</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFileB(e.target.files[0])}
          />
          <button onClick={handleUploadB} disabled={loading}>
            {loading ? "Uploading..." : "Upload to B"}
          </button>
        </div>
      </div>

      {response && (
        <div className="response-container">
          <h2>Response from {response.backend}</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
