(function () {
  if (typeof TtpAuth === "undefined") {
    window.location.replace("dashboard.html");
    return;
  }
  if (!TtpAuth.isAdmin()) {
    TtpAuth.guardAdminPage();
    return;
  }

  var SUBMISSIONS_KEY = "ttp_trashSubmissions";
  var POINTS_KEY = "ttp_totalPoints";

  var listEl = document.getElementById("admin-list");
  var emptyEl = document.getElementById("admin-empty");
  var countEl = document.getElementById("admin-count");

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

  function saveSubmissions(arr) {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(arr));
  }

  function readPoints() {
    var raw = localStorage.getItem(POINTS_KEY);
    if (raw === null || raw === "") {
      return 0;
    }
    var n = parseInt(raw, 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  function writePoints(n) {
    localStorage.setItem(POINTS_KEY, String(Math.max(0, Math.floor(n))));
  }

  function isPending(status) {
    return status === "Pending Verification" || !status;
  }

  function isSafeImageSrc(src) {
    return typeof src === "string" && src.indexOf("data:image/") === 0;
  }

  function formatWhen(iso) {
    if (!iso) {
      return "";
    }
    var d = new Date(iso);
    if (isNaN(d.getTime())) {
      return "";
    }
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function statusClass(status) {
    if (status === "Approved") {
      return "admin-status admin-status--approved";
    }
    if (status === "Rejected") {
      return "admin-status admin-status--rejected";
    }
    return "admin-status admin-status--pending";
  }

  function findIndexById(arr, id) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === id) {
        return i;
      }
    }
    return -1;
  }

  function approve(id) {
    var arr = getSubmissions();
    var idx = findIndexById(arr, id);
    if (idx < 0) {
      return;
    }
    var sub = arr[idx];
    if (!isPending(sub.status)) {
      return;
    }
    var n = parseInt(sub.itemCount, 10);
    if (isNaN(n) || n < 1) {
      n = 0;
    }
    writePoints(readPoints() + n);
    sub.status = "Approved";
    arr[idx] = sub;
    saveSubmissions(arr);
    render();
  }

  function reject(id) {
    var arr = getSubmissions();
    var idx = findIndexById(arr, id);
    if (idx < 0) {
      return;
    }
    var sub = arr[idx];
    if (!isPending(sub.status)) {
      return;
    }
    sub.status = "Rejected";
    arr[idx] = sub;
    saveSubmissions(arr);
    render();
  }

  function render() {
    var arr = getSubmissions().slice();
    arr.sort(function (a, b) {
      var ta = new Date(a.submittedAt || 0).getTime();
      var tb = new Date(b.submittedAt || 0).getTime();
      return tb - ta;
    });

    listEl.innerHTML = "";

    var pending = arr.filter(function (s) {
      return isPending(s.status);
    }).length;

    if (arr.length === 0) {
      emptyEl.hidden = false;
      countEl.textContent = "";
      return;
    }

    emptyEl.hidden = true;
    countEl.textContent =
      arr.length + " submission" + (arr.length === 1 ? "" : "s") + " · " + pending + " pending";

    arr.forEach(function (sub) {
      var card = document.createElement("article");
      card.className = "flow-card admin-card";

      var status = document.createElement("p");
      status.className = statusClass(sub.status);
      status.textContent = sub.status || "Pending Verification";

      var binRow = document.createElement("div");
      binRow.className = "admin-row";
      var binLabel = document.createElement("span");
      binLabel.className = "admin-k";
      binLabel.textContent = "Bin";
      var binVal = document.createElement("span");
      binVal.className = "admin-v";
      binVal.textContent = sub.binNumber || "—";
      binRow.appendChild(binLabel);
      binRow.appendChild(binVal);

      var imgWrap = document.createElement("div");
      imgWrap.className = "admin-img-wrap";
      if (isSafeImageSrc(sub.imagePreview)) {
        var img = document.createElement("img");
        img.className = "admin-img";
        img.src = sub.imagePreview;
        img.alt = "Proof: " + (sub.imageName || "upload");
        img.loading = "lazy";
        imgWrap.appendChild(img);
      } else {
        var ph = document.createElement("p");
        ph.className = "admin-img-placeholder";
        ph.textContent = sub.imageName ? "No preview · " + sub.imageName : "No image preview stored";
        imgWrap.appendChild(ph);
      }

      var itemsRow = document.createElement("div");
      itemsRow.className = "admin-row";
      var itemsLabel = document.createElement("span");
      itemsLabel.className = "admin-k";
      itemsLabel.textContent = "Items";
      var itemsVal = document.createElement("span");
      itemsVal.className = "admin-v";
      itemsVal.textContent = String(sub.itemCount != null ? sub.itemCount : "—");
      itemsRow.appendChild(itemsLabel);
      itemsRow.appendChild(itemsVal);

      var locRow = document.createElement("div");
      locRow.className = "admin-row";
      var locLabel = document.createElement("span");
      locLabel.className = "admin-k";
      locLabel.textContent = "Location";
      var locVal = document.createElement("span");
      locVal.className = "admin-v";
      locVal.textContent = sub.location || "—";
      locRow.appendChild(locLabel);
      locRow.appendChild(locVal);

      var when = document.createElement("p");
      when.className = "admin-when";
      when.textContent = formatWhen(sub.submittedAt);

      card.appendChild(status);
      card.appendChild(binRow);
      card.appendChild(imgWrap);
      card.appendChild(itemsRow);
      card.appendChild(locRow);
      card.appendChild(when);

      if (isPending(sub.status) && sub.id) {
        var actions = document.createElement("div");
        actions.className = "admin-card-actions";

        var btnAp = document.createElement("button");
        btnAp.type = "button";
        btnAp.className = "btn btn-primary btn-admin";
        btnAp.textContent = "Approve";
        (function (submissionId) {
          btnAp.addEventListener("click", function () {
            approve(submissionId);
          });
        })(sub.id);

        var btnRj = document.createElement("button");
        btnRj.type = "button";
        btnRj.className = "btn btn-danger btn-admin";
        btnRj.textContent = "Reject";
        (function (submissionId) {
          btnRj.addEventListener("click", function () {
            reject(submissionId);
          });
        })(sub.id);

        actions.appendChild(btnAp);
        actions.appendChild(btnRj);
        card.appendChild(actions);
      }

      listEl.appendChild(card);
    });
  }

  render();
  window.addEventListener("storage", function (e) {
    if (window.TtpAuth && e.key === TtpAuth.ROLE_KEY) {
      if (localStorage.getItem(TtpAuth.ROLE_KEY) !== "admin") {
        window.location.replace("dashboard.html");
      }
      return;
    }
    if (e.key === SUBMISSIONS_KEY || e.key === POINTS_KEY) {
      render();
    }
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      render();
    }
  });
})();
