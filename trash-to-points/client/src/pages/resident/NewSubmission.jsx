/**
 * Here's what this is for:
 * Page wrapper around SubmissionForm — handles success messaging and navigation hints.
 *
 * How it fits in:
 * Core action for earning points: residents prove proper disposal here.
 *
 * Why it matters:
 * Broken upload flow means no new data for admins and no points for residents.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import SubmissionForm from "../../components/SubmissionForm";
import AlertMessage from "../../components/AlertMessage";

export default function NewSubmission() {
  const [msg, setMsg] = useState("");

  return (
    <div>
      <p>
        <Link to="/resident/submissions">← My submissions</Link>
      </p>
      <AlertMessage type="success" message={msg} onClose={() => setMsg("")} />
      <SubmissionForm
        onSuccess={() => setMsg("Submission received! It is pending admin review. You will get points only after approval.")}
      />
    </div>
  );
}
