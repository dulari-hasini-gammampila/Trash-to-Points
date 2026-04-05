(function () {
  var R = window.TtpRewards;
  if (!R) {
    return;
  }

  var listEl = document.getElementById("reward-list");
  var balEl = document.getElementById("points-balance");

  function refreshBalance() {
    balEl.textContent = R.readPoints().toLocaleString();
  }

  function redeem(item) {
    var pts = R.readPoints();
    if (pts < item.cost) {
      alert("Not enough points");
      return;
    }
    R.writePoints(pts - item.cost);
    var entry = {
      id: item.id,
      name: item.name,
      kind: item.kind,
      pointsCost: item.cost,
      code: R.makeCode(item.kind),
      redeemedAt: new Date().toISOString(),
    };
    var arr = R.getRedemptions();
    arr.push(entry);
    R.saveRedemptions(arr);
    refreshBalance();
  }

  R.catalog.forEach(function (item) {
    var card = document.createElement("article");
    card.className = "flow-card rw-card";

    var title = document.createElement("h2");
    title.className = "rw-card-title";
    title.textContent = item.name;

    var cost = document.createElement("p");
    cost.className = "rw-card-cost";
    cost.textContent = item.cost + " points";

    var tag = document.createElement("p");
    tag.className = "rw-card-tag";
    tag.textContent = item.kind === "digital" ? "Digital voucher" : "Pickup at booth";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary btn-block btn-flow btn-redeem";
    btn.textContent = "Redeem";
    btn.addEventListener("click", function () {
      redeem(item);
    });

    card.appendChild(title);
    card.appendChild(cost);
    card.appendChild(tag);
    card.appendChild(btn);
    listEl.appendChild(card);
  });

  refreshBalance();
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      refreshBalance();
    }
  });
})();
