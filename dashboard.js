/**
 * Here's what this is for:
 * Fills in the dashboard numbers (points, how many submissions approved or waiting) and shows a
 * staff link if you’re logged in as admin. Also wires sign-out.
 *
 * How it fits in:
 * Works with dashboard.html and reads/writes demo data stored in the browser. The React app has its own dashboards.
 *
 * Why it matters:
 * Makes the prototype dashboard feel alive when you click around the static pages.
 */
(function () {
  var POINTS_KEY = "ttp_totalPoints";
  var SUBMISSIONS_KEY = "ttp_trashSubmissions";

  function readStoredInt(key) {
    var raw = localStorage.getItem(key);
    if (raw === null || raw === "") {
      return 0;
    }
    var n = parseInt(raw, 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  function getSubmissions() {
    var raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      return [];
    }
    try {
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function isPendingStatus(status) {
    return status === "Pending Verification" || !status;
  }

  function countSubmissionStatuses() {
    var list = getSubmissions();
    var approved = 0;
    var pending = 0;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s) {
        continue;
      }
      if (s.status === "Approved") {
        approved += 1;
      } else if (isPendingStatus(s.status)) {
        pending += 1;
      }
    }
    return { approved: approved, pending: pending };
  }

  function render() {
    var pointsEl = document.getElementById("total-points");
    var approvedEl = document.getElementById("total-approved");
    var pendingEl = document.getElementById("total-pending");

    var counts = countSubmissionStatuses();

    if (pointsEl) {
      pointsEl.textContent = readStoredInt(POINTS_KEY).toLocaleString();
    }
    if (approvedEl) {
      approvedEl.textContent = String(counts.approved);
    }
    if (pendingEl) {
      pendingEl.textContent = String(counts.pending);
    }
  }

  function updateAdminNav() {
    var slot = document.getElementById("dash-admin-slot");
    if (!slot || !window.TtpAuth) {
      return;
    }
    slot.innerHTML = "";
    if (!TtpAuth.isAdmin()) {
      return;
    }
    var p = document.createElement("p");
    p.className = "dash-admin-foot";
    var a = document.createElement("a");
    a.href = "admin-verification.html";
    a.textContent = "Admin: verify submissions";
    p.appendChild(a);
    slot.appendChild(p);
  }

  render();
  updateAdminNav();

  var signOut = document.getElementById("btn-sign-out");
  if (signOut && window.TtpAuth) {
    signOut.addEventListener("click", function () {
      TtpAuth.clearAuth();
      window.location.href = "index.html";
    });
  }

  window.addEventListener("storage", function (e) {
    if (window.TtpAuth && e.key === TtpAuth.ROLE_KEY) {
      updateAdminNav();
    }
    if (
      e.key === POINTS_KEY ||
      e.key === SUBMISSIONS_KEY ||
      e.key === "ttp_redeemedRewards"
    ) {
      render();
    }
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      render();
      updateAdminNav();
    }
  });
})();
