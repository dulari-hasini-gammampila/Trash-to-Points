/**
 * Here's what this is for:
 * When someone enters a bin number and continues, we save it for the next step and open the
 * “live disposal” page so the flow knows which bin they’re using.
 *
 * How it fits in:
 * Part of the old click-through HTML demo (connect-bin.html → live-disposal.html). Not the React app.
 *
 * Why it matters:
 * Without saving the bin id here, the next page wouldn’t know what to show.
 */
(function () {
  var form = document.getElementById("connect-form");
  var input = document.getElementById("bin-number");
  var err = document.getElementById("connect-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) {
      err.hidden = false;
      input.focus();
      return;
    }
    err.hidden = true;
    sessionStorage.setItem("ttp_live_bin", v);
    window.location.href = "live-disposal.html?bin=" + encodeURIComponent(v);
  });
})();
