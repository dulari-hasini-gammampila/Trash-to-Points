/**
 * Here's what this is for:
 * Loads events from `/api` and lists them with cards for the public.
 *
 * How it fits in:
 * Complements admin event management — read-only view for residents and visitors.
 *
 * Why it matters:
 * Drives participation in clean-ups; empty states should prompt admins to add events.
 */
import { useEffect, useState } from "react";
import { api } from "../../api";
import EventCard from "../../components/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api("/events")
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);
  return (
    <div>
      <h1 style={{ color: "var(--green-900)" }}>Community events</h1>
      <p style={{ color: "var(--gray-600)" }}>Upcoming Trash-to-Points activities.</p>
      <div className="grid-2" style={{ marginTop: "1rem" }}>
        {events.length === 0 && <div className="empty-state">No events listed yet.</div>}
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
