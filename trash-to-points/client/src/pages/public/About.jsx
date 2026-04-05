/**
 * Here's what this is for:
 * Static content page describing the program’s mission and story for anonymous visitors.
 *
 * How it fits in:
 * Linked from the Navbar — supports transparency and school/community reporting.
 *
 * Why it matters:
 * Builds trust before someone commits to creating an account.
 */
export default function About() {
  return (
    <div>
      <h1 style={{ color: "var(--green-900)" }}>About the initiative</h1>
      <div className="card">
        <p>
          The Trash-to-Points Community Initiative is designed to encourage residents to collect litter and
          recyclable materials in exchange for reward points. Unlike traditional clean-up events, this system
          introduces a reward-based mechanism that makes environmental participation more engaging, interactive,
          and sustainable.
        </p>
        <p>
          Residents photograph disposals at registered smart bins. <strong>Admins review each photo</strong> and
          approve or adjust the item count before any points are added — nothing is automatic. Redeem points for
          stickers, meals, and eco-friendly gifts using unique pickup codes.
        </p>
      </div>
    </div>
  );
}
