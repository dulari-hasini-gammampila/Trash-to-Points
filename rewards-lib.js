(function (global) {
  var POINTS_KEY = "ttp_totalPoints";
  var REDEMPTIONS_KEY = "ttp_redeemedRewards";

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

  function getRedemptions() {
    var raw = localStorage.getItem(REDEMPTIONS_KEY);
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

  function saveRedemptions(arr) {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(arr));
  }

  function randomSegment(len) {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "";
    for (var i = 0; i < len; i++) {
      s += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return s;
  }

  function makeCode(kind) {
    if (kind === "digital") {
      return "VCH-" + randomSegment(6);
    }
    return "COL-" + randomSegment(6);
  }

  global.TtpRewards = {
    POINTS_KEY: POINTS_KEY,
    REDEMPTIONS_KEY: REDEMPTIONS_KEY,
    readPoints: readPoints,
    writePoints: writePoints,
    getRedemptions: getRedemptions,
    saveRedemptions: saveRedemptions,
    makeCode: makeCode,
    catalog: [
      { id: "sticker", name: "Sticker", cost: 10, kind: "physical" },
      { id: "food-voucher", name: "Food Voucher", cost: 20, kind: "digital" },
      { id: "eco-bag", name: "Eco-bag", cost: 40, kind: "physical" },
    ],
  };
})(window);
