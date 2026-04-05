(function () {
  document.querySelectorAll("[data-signin-role]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var role = btn.getAttribute("data-signin-role");
      if (!window.TtpAuth || (role !== "user" && role !== "admin")) {
        return;
      }
      TtpAuth.setRole(role);
      window.location.href = "dashboard.html";
    });
  });
})();
