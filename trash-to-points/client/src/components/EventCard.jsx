/**
 * Here's what this is for:
 * Card UI for one event: title, schedule/location summary, optional link to details.
 *
 * How it fits in:
 * Used on public lists and admin views — same visual language everywhere.
 *
 * Why it matters:
 * Consistent event presentation helps scanning and reduces duplicate layout code.
 */
export default function EventCard({ event }) {
  return (
    <div className="card">
      <h3 style={{ margin: "0 0 0.5rem" }}>{event.event_name}</h3>
      <p style={{ margin: "0.25rem 0" }}>
        <strong>When:</strong> {event.schedule}
      </p>
      <p style={{ margin: "0.25rem 0" }}>
        <strong>Time:</strong> {event.time}
      </p>
      <p style={{ margin: "0.25rem 0" }}>
        <strong>Where:</strong> {event.location}
      </p>
      {event.description && <p style={{ margin: "0.75rem 0 0", color: "var(--gray-600)" }}>{event.description}</p>}
      {event.participants && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.92rem" }}>
          <strong>Participants:</strong> {event.participants}
        </p>
      )}
      {event.activities && (
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.92rem" }}>
          <strong>Activities:</strong> {event.activities}
        </p>
      )}
    </div>
  );
}
