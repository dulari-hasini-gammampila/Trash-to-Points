/**
 * Here's what this is for:
 * Multipart form: photo, bin code, quantity — posts to submissions API as pending proof.
 *
 * How it fits in:
 * Embedded in NewSubmission; points accrue only after admin approval in Manage submissions.
 *
 * Why it matters:
 * Primary data capture for the program — validation and upload errors must be obvious.
 */
import { useState, useRef } from "react";
import { apiUpload } from "../api";

export default function SubmissionForm({ onSuccess }) {
  const [binCode, setBinCode] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const fileRef = useRef(null);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : "");
    tryScanQr(f);
  }

  async function tryScanQr(f) {
    setHint("");
    if (!f || typeof globalThis.BarcodeDetector !== "function") return;
    try {
      const detector = new globalThis.BarcodeDetector({ formats: ["qr_code"] });
      const bmp = await createImageBitmap(f);
      const codes = await detector.detect(bmp);
      bmp.close?.();
      if (codes[0]?.rawValue) {
        setBinCode(codes[0].rawValue);
        setHint("QR code detected — bin field filled. You can edit it if needed.");
      }
    } catch {
      /* ignore — manual entry still works */
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!file) {
        setError("Please choose a photo of your trash disposal.");
        return;
      }
      const q = parseInt(quantity, 10);
      if (!Number.isFinite(q) || q < 1) {
        setError("Enter a valid number of items (at least 1).");
        return;
      }
      const fd = new FormData();
      fd.append("image", file);
      fd.append("bin_code", binCode.trim());
      fd.append("user_reported_quantity", String(q));
      await apiUpload("/submissions", fd);
      setBinCode("");
      setQuantity("1");
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>New submission</h2>
      <p style={{ color: "var(--gray-600)", fontSize: "0.92rem", marginTop: 0 }}>
        Upload a clear photo, enter the bin code on the bin label or paste the value from a QR scan. An admin
        will verify before any points are added.
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      {hint && <div className="alert alert-success">{hint}</div>}

      <div className="form-group">
        <label>Photo proof</label>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} />
        {preview && (
          <img className="submission-preview" src={preview} alt="Preview" style={{ marginTop: "0.75rem" }} />
        )}
      </div>

      <div className="form-group">
        <label htmlFor="bin-code">Bin code or QR value</label>
        <input
          id="bin-code"
          value={binCode}
          onChange={(e) => setBinCode(e.target.value)}
          placeholder="e.g. TP-PARK-A"
          required
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="qty">Number of items you disposed</label>
        <input
          id="qty"
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? "Sending…" : "Submit for review"}
      </button>
    </form>
  );
}
