"use client";

import { useState } from "react";
import { sendMultimodalMessage } from "../../services/api";

export default function SendMessage() {
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await sendMultimodalMessage(text, { audioFile, imageFile });
      setResponse(res);
    } catch (err) {
      setError(err.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Message..." />
        <div>
          <label>
            Audio:
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div>
          <label>
            Image:
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <button type="submit" disabled={loading}>{loading ? "Envoi..." : "Envoyer"}</button>
      </form>

      {error && <div style={{ color: "red" }}>{String(error)}</div>}
      {response && (
        <div>
          <h4>Réponse</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
