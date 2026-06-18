import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

export default function App() {
  const [file, setFile]           = useState(null);
  const [expiryHours, setExpiry]  = useState(24);
  const [shareLink, setShareLink] = useState("");
  const [status, setStatus]       = useState("idle");
  const [errorMsg, setErrorMsg]   = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      const { data } = await axios.post(`${API}/upload`, {
        filename:    file.name,
        mimeType:    file.type || "application/octet-stream",
        sizeBytes:   file.size,
        expiryHours: Number(expiryHours),
      });

      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      setShareLink(data.shareLink);
      setStatus("done");

    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const copyLink = () => navigator.clipboard.writeText(shareLink);

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">VaultDrop</h1>
        <p className="subtitle">Share files securely. Links self-destruct.</p>

        {status !== "done" && (
          <>
            <div
              className="dropzone"
              onClick={() => document.getElementById("fileInput").click()}
            >
              {file ? (
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <p className="drop-hint">Click to select a file</p>
              )}
              <input
                id="fileInput"
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <div className="expiry-row">
              <label>Link expires in</label>
              <select value={expiryHours} onChange={(e) => setExpiry(e.target.value)}>
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={24}>24 hours</option>
                <option value={72}>3 days</option>
              </select>
            </div>

            <button
              className="btn"
              onClick={handleUpload}
              disabled={!file || status === "uploading"}
            >
              {status === "uploading" ? "Uploading..." : "Upload & Get Link"}
            </button>

            {status === "error" && <p className="error">{errorMsg}</p>}
          </>
        )}

        {status === "done" && (
          <div className="success">
            <p className="success-title">✅ File uploaded!</p>
            <p className="success-sub">Share this link — it expires in {expiryHours}h</p>
            <div className="link-box">
              <span className="link-text">{shareLink}</span>
              <button className="copy-btn" onClick={copyLink}>Copy</button>
            </div>
            <button
              className="btn-outline"
              onClick={() => { setStatus("idle"); setFile(null); setShareLink(""); }}
            >
              Upload another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
}