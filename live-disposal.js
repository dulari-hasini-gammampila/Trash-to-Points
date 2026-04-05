(function () {
  var POINTS_KEY = "ttp_totalPoints";
  var ITEMS_KEY = "ttp_totalItemsDeposited";

  var items = 0;
  var points = 0;

  var binDisplay = document.getElementById("bin-display");
  var itemsEl = document.getElementById("live-items");
  var pointsEl = document.getElementById("live-points");
  var btnInsert = document.getElementById("btn-insert");
  var btnFinish = document.getElementById("btn-finish");

  function readStoredInt(key) {
    var raw = localStorage.getItem(key);
    if (raw === null || raw === "") {
      return 0;
    }
    var n = parseInt(raw, 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  function resolveBin() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("bin");
    if (q) {
      try {
        q = decodeURIComponent(q).trim();
      } catch (e) {
        q = "";
      }
      if (q) {
        sessionStorage.setItem("ttp_live_bin", q);
        return q;
      }
    }
    var stored = sessionStorage.getItem("ttp_live_bin");
    return stored && stored.trim() ? stored.trim() : "";
  }

  var binId = resolveBin();
  if (!binId) {
    window.location.replace("connect-bin.html");
    return;
  }
  binDisplay.textContent = binId;

  function render() {
    itemsEl.textContent = String(items);
    pointsEl.textContent = String(points);
  }

  btnInsert.addEventListener("click", function () {
    items += 1;
    points += 1;
    render();
  });

  btnFinish.addEventListener("click", function () {
    var totalP = readStoredInt(POINTS_KEY) + points;
    var totalI = readStoredInt(ITEMS_KEY) + items;
    localStorage.setItem(POINTS_KEY, String(totalP));
    localStorage.setItem(ITEMS_KEY, String(totalI));

    sessionStorage.setItem("ttp_completion_points", String(points));
    sessionStorage.setItem("ttp_completion_items", String(items));
    sessionStorage.setItem("ttp_completion_bin", binId || "—");

    sessionStorage.removeItem("ttp_live_bin");
    window.location.href = "completion.html";
  });

  render();
})();
