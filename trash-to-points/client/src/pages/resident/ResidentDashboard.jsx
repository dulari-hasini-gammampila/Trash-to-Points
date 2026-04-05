/**
 * Here's what this is for:
 * Dashboard cards, quick links, and recent activity for a logged-in resident.
 *
 * How it fits in:
 * Default `/resident` landing — steers users to submit, redeem, or check status.
 *
 * Why it matters:
 * Main hub for engagement after onboarding; dead ends here lose daily active users.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import RewardCard from "../../components/RewardCard";
import EventCard from "../../components/EventCard";
import AlertMessage from "../../components/AlertMessage";
import SubmissionTable from "../../components/SubmissionTable";

export default function ResidentDashboard() {
  const { user, refreshUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    function load() {
      Promise.all([api("/submissions/my"), api("/redemptions/my"), api("/rewards"), api("/events")])
        .then(([s, red, rew, ev]) => {
          if (cancelled) return;
          setSubmissions(s);
          setRedemptions(red);
          setRewards(rew.slice(0, 3));
          setEvents(ev.slice(0, 1));
        })
        .catch(() => {});
    }
    load();
    const pollMs = Number(import.meta.env.VITE_DASHBOARD_POLL_MS) || 0;
    if (!pollMs)
      return () => {
        cancelled = true;
      };
    const id = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user?.id]);

  async function redeem(id) {
    setMsg("");
    setErr("");
    try {
      await api("/redemptions", { method: "POST", body: { reward_id: id } });
      setMsg("Reward redeemed! Your code appears under My Rewards.");
      refreshUser();
      const red = await api("/redemptions/my");
      setRedemptions(red);
      const rew = await api("/rewards");
      setRewards(rew.slice(0, 3));
    } catch (e) {
      setErr(e.message);
    }
  }

  const pending = submissions.filter((s) => s.status === "Pending").length;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Welcome, {user?.full_name}!</h1>
      <AlertMessage type="success" message={msg} onClose={() => setMsg("")} />
      <AlertMessage type="error" message={err} onClose={() => setErr("")} />

      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="Total points" value={user?.total_points ?? 0} />
        <StatCard label="Pending submissions" value={pending} />
      </div>

      <p>
        <Link to="/resident/submit" className="btn btn-primary">
          New submission
        </Link>
      </p>

      <h2 className="section-title" style={{ marginTop: "1.5rem" }}>
        Recent submissions
      </h2>
      {submissions.length === 0 ? (
        <div className="empty-state">
          No submissions yet.{" "}
          <Link to="/resident/submit">Upload your first disposal photo</Link>.
        </div>
      ) : (
        <SubmissionTable rows={submissions.slice(0, 5)} showImage />
      )}

      <h2 className="section-title">Recent redemptions</h2>
      {redemptions.length === 0 ? (
        <div className="empty-state">No redemptions yet.</div>
      ) : (
        <ul className="card">
          {redemptions.slice(0, 5).map((r) => (
            <li key={r.id}>
              <strong>{r.reward_name}</strong> — code <code>{r.redemption_code}</code> — {r.status} (
              {r.created_at?.slice(0, 10)})
            </li>
          ))}
        </ul>
      )}

      <h2 className="section-title">Featured rewards</h2>
      <div className="grid-2">
        {rewards.map((r) => (
          <RewardCard
            key={r.id}
            reward={r}
            showRedeem
            onRedeem={redeem}
            disabled={!user || user.total_points < r.points_required}
          />
        ))}
      </div>

      <h2 className="section-title">Upcoming event</h2>
      {events.length === 0 ? (
        <div className="empty-state">Check back for events.</div>
      ) : (
        <EventCard event={events[0]} />
      )}
    </div>
  );
}
