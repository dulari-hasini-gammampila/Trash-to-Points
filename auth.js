/**
 * Here's what this is for:
 * Keeps track on this computer of whether the visitor is a regular user or staff. Other pages ask
 * this script so they know which menus to show—think of it as a sticky note inside the browser.
 *
 * How it fits in:
 * The old HTML-only pages use this. The newer React app signs people in through the real server instead.
 *
 * Why it matters:
 * Staff pages hide or show links based on this. It’s fine for a student demo, but it’s not real
 * security—someone could change the browser storage—so don’t use this alone to protect serious data.
 */
(function (global) {
  var ROLE_KEY = "ttp_userRole";

  function getRole() {
    var v = localStorage.getItem(ROLE_KEY);
    if (v === "admin" || v === "user") {
      return v;
    }
    return null;
  }

  function setRole(role) {
    if (role === "admin" || role === "user") {
      localStorage.setItem(ROLE_KEY, role);
    }
  }

  function clearAuth() {
    localStorage.removeItem(ROLE_KEY);
  }

  function isAdmin() {
    return getRole() === "admin";
  }

  function redirectNonAdminFromAdminPage() {
    global.location.replace("dashboard.html");
  }

  function guardAdminPage() {
    if (getRole() !== "admin") {
      redirectNonAdminFromAdminPage();
    }
  }

  global.TtpAuth = {
    ROLE_KEY: ROLE_KEY,
    getRole: getRole,
    setRole: setRole,
    clearAuth: clearAuth,
    isAdmin: isAdmin,
    guardAdminPage: guardAdminPage,
  };
})(window);
