/**
 * Main Application Component - Multi-Backend Image Upload Interface
 *
 * This React component provides the user interface for uploading images
 * to two different backend services (Backend-A and Backend-B) through
 * the APIM gateway.
 *
 * Features:
 * - Dual file upload inputs for Backend-A and Backend-B
 * - Asynchronous image upload with loading states
 * - Real-time response display from backend services
 * - Error handling with user feedback
 *
 * API Endpoints (routed through APIM):
 * - POST /api/a - Upload to Backend-A
 * - POST /api/b - Upload to Backend-B
 */

import React, { useState } from "react";
import "./App.css";

function App() {
  // State Management
  const [fileA, setFileA] = useState(null);       // Selected file for Backend-A
  const [fileB, setFileB] = useState(null);       // Selected file for Backend-B
  const [response, setResponse] = useState(null); // API response data
  const [loading, setLoading] = useState(false);  // Upload in progress flag

  /**
   * Handle Image Upload to Backend-A
   *
   * Validates file selection, creates FormData payload, and sends
   * multipart/form-data POST request to /api/a endpoint via APIM.
   *
   * Process:
   * 1. Validates file selection
   * 2. Creates FormData with 'image' field
   * 3. Sends POST request through APIM gateway
   * 4. Updates UI with response or error
   */
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

  /**
   * Handle Image Upload to Backend-B
   *
   * Validates file selection, creates FormData payload, and sends
   * multipart/form-data POST request to /api/b endpoint via APIM.
   *
   * Process:
   * 1. Validates file selection
   * 2. Creates FormData with 'image' field
   * 3. Sends POST request through APIM gateway
   * 4. Updates UI with response or error
   */
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
      {/* Application Header */}
      <header className="App-header">
        <h1>Gopal's Multi-Backend Image Upload</h1>
        <p>Upload images to Backend-A or Backend-B</p>
      </header>

      {/* Upload Interface - Two separate upload cards */}
      <div className="upload-container">
        {/* Backend-A Upload Card */}
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

        {/* Backend-B Upload Card */}
        <div className="upload-card">
          <h2>Backend B</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFileB(e.target.files[0])}
          />
          <button onClick={handleUploadB} disabled={loading}>
            {loading ? "Uploading..." : "Upload to B"}
          </button}
        </div>
      </div>

      {/* Response Display - Shows JSON response from backend */}
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
