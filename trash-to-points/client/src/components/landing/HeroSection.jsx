/**
 * Here's what this is for:
 * Above-the-fold hero: headline, subcopy, primary/secondary CTAs to register or browse rewards.
 *
 * How it fits in:
 * First section on Home.jsx — sets tone and conversion goals.
 *
 * Why it matters:
 * Most visitors decide whether to scroll based on this block alone.
 */
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="hero hero--large home-hero">
      <h1>Trash-to-Points Community Initiative</h1>
      <p className="hero-sub">
        A reward-based website that encourages proper trash disposal and community participation
      </p>
      <div className="hero-actions">
        <Link to="/register" className="btn btn-primary">
          Join Now
        </Link>
        <Link to="/rewards" className="btn btn-outline">
          View Rewards
        </Link>
      </div>
    </section>
  );
}
