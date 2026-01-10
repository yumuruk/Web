import { useState } from "react";
import { uploadVideo } from "./api";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onUpload = async () => {
  if (!file) return;
  setLoading(true);
  setError(null);
  setResult(null);

  try {
    const data = await uploadVideo(file);
    console.log("UPLOAD RESULT:", data); // 👈 이 줄 추가
    setResult(data);
  } catch (e: any) {
    console.error(e);
    setError(e?.message ?? "Unknown error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ padding: 24 }}>
      <h2>Interview Upload Test</h2>

      <input
        type="file"
        accept="image/png"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={onUpload} disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <p style={{ marginTop: 12 }}>Error: {error}</p>}
      

      {result && (
        <div style={{ marginTop: 12 }}>
          <p><b>Message:</b> {result.message}</p>
          <p><b>Original:</b> {result.original_name}</p>
          <p><b>Saved:</b> {result.saved_name}</p>
          <p><b>Size:</b> {result.size}</p>
        </div>
      )}
    </div>
  );
}

export default App;
