/**
 * Here's what this is for:
 * Create/edit/delete events and show them with admin forms and cards.
 *
 * How it fits in:
 * Backs the public events calendar — changes here appear on marketing pages.
 *
 * Why it matters:
 * Stale events undermine turnout; this is the control center for community dates.
 */
import { useEffect, useState } from "react";
import { api } from "../../api";
import EventCard from "../../components/EventCard";
import AlertMessage from "../../components/AlertMessage";

const emptyForm = {
  event_name: "",
  schedule: "",
  time: "",
  location: "",
  description: "",
  participants: "",
  activities: "",
};

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");

  function load() {
    api("/events").then(setEvents).catch(() => setEvents([]));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(ev) {
    setEditing(ev.id);
    setForm({
      event_name: ev.event_name,
      schedule: ev.schedule || "",
      time: ev.time || "",
      location: ev.location || "",
      description: ev.description || "",
      participants: ev.participants || "",
      activities: ev.activities || "",
    });
  }

  async function save(e) {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/events/${editing}`, { method: "PUT", body: form });
        setMsg("Event updated.");
      } else {
        await api("/events", { method: "POST", body: form });
        setMsg("Event created.");
      }
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Manage events</h1>
      <AlertMessage type="success" message={msg} onClose={() => setMsg("")} />

      <form className="card" onSubmit={save} style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>{editing ? "Edit event" : "New event"}</h2>
        <div className="form-group">
          <label>Event name</label>
          <input
            value={form.event_name}
            onChange={(f) => setForm({ ...form, event_name: f.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Schedule</label>
          <input value={form.schedule} onChange={(f) => setForm({ ...form, schedule: f.target.value })} />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input value={form.time} onChange={(f) => setForm({ ...form, time: f.target.value })} />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input value={form.location} onChange={(f) => setForm({ ...form, location: f.target.value })} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(f) => setForm({ ...form, description: f.target.value })}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Participants</label>
          <textarea
            value={form.participants}
            onChange={(f) => setForm({ ...form, participants: f.target.value })}
            rows={2}
            placeholder="e.g. Residents, volunteers, RC members"
          />
        </div>
        <div className="form-group">
          <label>Activities</label>
          <textarea
            value={form.activities}
            onChange={(f) => setForm({ ...form, activities: f.target.value })}
            rows={2}
            placeholder="e.g. Collect litter, sort recyclables"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {editing ? "Save" : "Create"}
        </button>
        {editing && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginLeft: "0.5rem" }}
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="grid-2">
        {events.map((ev) => (
          <div key={ev.id}>
            <EventCard event={ev} />
            <button
              type="button"
              className="btn btn-sm btn-outline"
              style={{ marginTop: "0.5rem" }}
              onClick={() => startEdit(ev)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
