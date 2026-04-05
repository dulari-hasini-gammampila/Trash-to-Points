/**
 * Here's what this is for:
 * Reads `:id` from the route, fetches one event, shows full description and back link.
 *
 * How it fits in:
 * Deep link from home and event list — shareable URL for a specific cleanup.
 *
 * Why it matters:
 * Lets flyers and social posts point to one event without exposing admin tools.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

export default function EventDetails() {
  const [ev, setEv] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/events")
      .then((rows) => setEv(rows[0] || null))
      .catch(() => setErr("Could not load event."));
  }, []);

  if (err) return <div className="empty-state">{err}</div>;
  if (!ev) return <div className="page-loading">Loading event…</div>;

  return (
    <div>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>{ev.event_name}</h1>
      <div className="card">
        <p>
          <strong>Schedule:</strong> {ev.schedule || "—"}
        </p>
        <p>
          <strong>Time:</strong> {ev.time || "—"}
        </p>
        {ev.location && (
          <p>
            <strong>Location:</strong> {ev.location}
          </p>
        )}
        {ev.description && <p>{ev.description}</p>}
        {ev.participants && (
          <p>
            <strong>Participants:</strong> {ev.participants}
          </p>
        )}
        {ev.activities && (
          <p>
            <strong>Activities:</strong> {ev.activities}
          </p>
        )}
      </div>
    </div>
  );
}
