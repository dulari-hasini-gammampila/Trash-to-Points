/**
 * Here's what this is for:
 * Shows a “you’re done” summary: bin, items, points earned, using values the previous step stored.
 *
 * How it fits in:
 * Matches completion.html at the end of the static HTML flow. If nothing was recorded, it nudges
 * you to start from Connect Bin.
 *
 * Why it matters:
 * Gives people a clear ending and confirms what they earned in the demo.
 */
(function () {
  var p = sessionStorage.getItem("ttp_completion_points");
  var i = sessionStorage.getItem("ttp_completion_items");
  var b = sessionStorage.getItem("ttp_completion_bin");

  var points = parseInt(p, 10);
  var items = parseInt(i, 10);
  if (isNaN(points)) {
    points = 0;
  }
  if (isNaN(items)) {
    items = 0;
  }

  document.getElementById("done-bin").textContent = b && b.trim() ? b.trim() : "—";
  document.getElementById("done-items").textContent = String(items);
  document.getElementById("done-points").textContent = String(points);

  var summary = document.getElementById("completion-summary");
  if (items === 0 && points === 0 && (!b || b === "—")) {
    summary.textContent = "Open Live Disposal from Connect Bin to record a session.";
  } else {
    summary.textContent =
      "You deposited " +
      items +
      (items === 1 ? " item" : " items") +
      " and earned " +
      points +
      (points === 1 ? " point" : " points") +
      ". Totals are saved.";
  }
})();
