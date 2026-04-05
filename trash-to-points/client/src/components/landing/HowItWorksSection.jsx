/**
 * Here's what this is for:
 * Renders a numbered list (STEPS) from disposal through approval to redemption.
 *
 * How it fits in:
 * Home page “How it works” — educational, not interactive.
 *
 * Why it matters:
 * Aligns expectations with the actual admin review step (no instant points).
 */
const STEPS = [
  "User disposes trash in a designated bin",
  "User uploads a photo as proof",
  "User enters or scans the bin code",
  "Admin verifies the submission",
  "Approved submissions earn points",
  "Points can be redeemed for rewards",
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="home-section">
      <h2 className="section-title">How it works</h2>
      <ol className="steps-list card">
        {STEPS.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ol>
    </section>
  );
}
