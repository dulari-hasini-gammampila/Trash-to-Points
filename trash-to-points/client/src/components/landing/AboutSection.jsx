/**
 * Here's what this is for:
 * Mid-page section with narrative copy about the initiative’s purpose.
 *
 * How it fits in:
 * Composes Home.jsx — supports grants and educator-facing storytelling.
 *
 * Why it matters:
 * Explains *why* the points exist beyond gamification.
 */
export default function AboutSection() {
  return (
    <section id="about" className="home-section">
      <h2 className="section-title">About</h2>
      <div className="card">
        <p>
          The Trash-to-Points Community Initiative is designed to encourage residents to collect litter and
          recyclable materials in exchange for reward points. Unlike traditional clean-up events, this system
          introduces a reward-based mechanism that makes environmental participation more engaging, interactive,
          and sustainable.
        </p>
      </div>
    </section>
  );
}
