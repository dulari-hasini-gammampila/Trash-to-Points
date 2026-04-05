/**
 * Here's what this is for:
 * Handles the staff sign-in page: you type a password, and if it matches, this script marks you as
 * staff and sends you to the dashboard.
 *
 * How it fits in:
 * Only for the simple HTML demo. Nothing is saved to a server here—it’s just this file and auth.js.
 * The main Trash-to-Points app uses a normal login screen that talks to the database.
 *
 * Why it matters:
 * Change the password below so random people can’t open staff screens. For a real launch you’d
 * want proper login on the server, not just a password sitting in a file.
 */
(function () {
  /* Organizer password — change this and tell real staff the new one. */
  var ADMIN_JOIN_ID = "TTP-STAFF-7K2M";

  var form = document.getElementById("admin-join-form");
  if (!form || !window.TtpAuth) {
    return;
  }

  var input = document.getElementById("admin-id");
  var err = document.getElementById("admin-id-error");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    err.textContent = "";

    var v = input.value.trim();
    if (!v) {
      err.textContent = "Enter your administrator ID.";
      err.hidden = false;
      input.focus();
      return;
    }

    if (v !== ADMIN_JOIN_ID) {
      err.textContent = "Invalid administrator ID. Access denied.";
      err.hidden = false;
      input.focus();
      input.select();
      return;
    }

    TtpAuth.setRole("admin");
    window.location.href = "dashboard.html";
  });
})();
