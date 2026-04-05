/**
 * Here's what this is for:
 * Short footer with links or copyright text at the bottom of the layout.
 *
 * How it fits in:
 * Included from App.jsx below routed content for polish and optional legal links.
 *
 * Why it matters:
 * Anchors the page visually and can hold contact/privacy info for school deployments.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <p>Trash-to-Points Community Initiative — cleaner parks, stronger community.</p>
      <p style={{ opacity: 0.85, marginTop: "0.5rem" }}>Student project demo · {new Date().getFullYear()}</p>
    </footer>
  );
}
