/**
 * Here's what this is for:
 * Inline alert banner (success/error variants) with optional dismiss.
 *
 * How it fits in:
 * Shared feedback after forms (login, submissions, admin saves).
 *
 * Why it matters:
 * Clear operator/resident feedback reduces duplicate submits and support questions.
 */
export default function AlertMessage({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type === "error" ? "error" : "success"}`}>
      {message}
      {onClose && (
        <button type="button" onClick={onClose} style={{ float: "right", fontWeight: "bold" }}>
          ×
        </button>
      )}
    </div>
  );
}
