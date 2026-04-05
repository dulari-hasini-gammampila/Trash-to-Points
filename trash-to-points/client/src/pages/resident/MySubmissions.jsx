/**
 * Here's what this is for:
 * Lists submissions owned by the logged-in user with status (pending/approved/rejected).
 *
 * How it fits in:
 * Feedback loop after using “New submission” — shows if proof was accepted.
 *
 * Why it matters:
 * Transparency on why points did or didn’t post; reduces duplicate submissions.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import SubmissionTable from "../../components/SubmissionTable";

export default function MySubmissions() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!user?.id) return;
    api("/submissions/my").then(setRows).catch(() => setRows([]));
  }, [user?.id]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>My submissions</h1>
      <p>
        <Link to="/resident/submit">+ New submission</Link>
      </p>
      <SubmissionTable rows={rows} showImage />
    </div>
  );
}
