/**
 * Here's what this is for:
 * Static snapshot of a recurring community event plus link to the full events area.
 *
 * How it fits in:
 * Home.jsx marketing block — may differ from live API events (intentional teaser).
 *
 * Why it matters:
 * Gives a concrete date rhythm so the program feels active even before API data loads.
 */
import { Link } from "react-router-dom";

export default function HomeEventCard() {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Trash-to-Points Day</h3>
      <p>
        <strong>Schedule:</strong> First Saturday of each month
      </p>
      <p>
        <strong>Time:</strong> 9:00 AM – 10:00 AM
      </p>
      <p>
        <strong>Participants:</strong> Community residents, student volunteers, Resident Committee (RC) members
      </p>
      <p>
        <strong>Activities:</strong> Collect litter, sort recyclable waste, record points, distribute rewards
      </p>
      <p style={{ marginBottom: 0 }}>
        <Link to="/event-details">Full event details →</Link>
      </p>
    </div>
  );
}
