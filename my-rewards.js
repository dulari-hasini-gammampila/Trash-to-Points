(function () {
  var R = window.TtpRewards;
  if (!R) {
    return;
  }

  var digitalEl = document.getElementById("digital-list");
  var physicalEl = document.getElementById("physical-list");

  function formatDate(iso) {
    if (!iso) {
      return "";
    }
    var d = new Date(iso);
    if (isNaN(d.getTime())) {
      return "";
    }
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function emptyMsg(text) {
    var p = document.createElement("p");
    p.className = "rw-empty";
    p.textContent = text;
    return p;
  }

  function buildOwnedCard(entry) {
    var card = document.createElement("article");
    card.className = "flow-card rw-owned-card";

    var name = document.createElement("h3");
    name.className = "rw-owned-name";
    name.textContent = entry.name;

    var codeLabel = document.createElement("p");
    codeLabel.className = "rw-code-label";
    codeLabel.textContent = entry.kind === "digital" ? "Voucher code" : "Collection code";

    var code = document.createElement("p");
    code.className = "rw-code-value";
    code.textContent = entry.code || "—";

    var meta = document.createElement("p");
    meta.className = "rw-owned-meta";
    meta.textContent = entry.pointsCost + " pts · " + formatDate(entry.redeemedAt);

    card.appendChild(name);
    card.appendChild(codeLabel);
    card.appendChild(code);
    card.appendChild(meta);
    return card;
  }

  function render() {
    digitalEl.innerHTML = "";
    physicalEl.innerHTML = "";

    var all = R.getRedemptions();
    var digital = all.filter(function (e) {
      return e && e.kind === "digital";
    });
    var physical = all.filter(function (e) {
      return e && e.kind === "physical";
    });

    if (digital.length === 0) {
      digitalEl.appendChild(emptyMsg("No digital vouchers yet."));
    } else {
      digital
        .slice()
        .reverse()
        .forEach(function (entry) {
          digitalEl.appendChild(buildOwnedCard(entry));
        });
    }

    if (physical.length === 0) {
      physicalEl.appendChild(emptyMsg("No physical rewards yet."));
    } else {
      physical
        .slice()
        .reverse()
        .forEach(function (entry) {
          physicalEl.appendChild(buildOwnedCard(entry));
        });
    }
  }

  function refresh() {
    render();
  }

  refresh();
  window.addEventListener("storage", function (e) {
    if (e.key === R.REDEMPTIONS_KEY) {
      refresh();
    }
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      refresh();
    }
  });
})();
