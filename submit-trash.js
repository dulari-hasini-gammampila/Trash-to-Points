(function () {
  var STORAGE_KEY = "ttp_trashSubmissions";
  var MAX_PREVIEW_BYTES = 450000;

  var form = document.getElementById("submit-trash-form");
  var binInput = document.getElementById("bin-number");
  var fileInput = document.getElementById("proof-image");
  var itemsInput = document.getElementById("item-count");
  var locationSelect = document.getElementById("location");
  var errEl = document.getElementById("submit-error");
  var successEl = document.getElementById("submit-success");
  var previewWrap = document.getElementById("file-preview-wrap");
  var previewImg = document.getElementById("file-preview");
  var submitBtn = document.getElementById("submit-btn");

  function getSubmissions() {
    var raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        resolve(r.result);
      };
      r.onerror = function () {
        reject(new Error("read"));
      };
      r.readAsDataURL(file);
    });
  }

  function showError(msg) {
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  function clearError() {
    errEl.hidden = true;
    errEl.textContent = "";
  }

  fileInput.addEventListener("change", function () {
    var f = fileInput.files && fileInput.files[0];
    clearError();
    if (!f || !f.type || f.type.indexOf("image/") !== 0) {
      previewWrap.hidden = true;
      previewImg.removeAttribute("src");
      return;
    }
    var url = URL.createObjectURL(f);
    previewImg.onload = function () {
      URL.revokeObjectURL(url);
    };
    previewImg.src = url;
    previewWrap.hidden = false;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    successEl.hidden = true;

    var bin = binInput.value.trim();
    if (!bin) {
      showError("Please enter a smart bin number.");
      binInput.focus();
      return;
    }

    var file = fileInput.files && fileInput.files[0];
    if (!file) {
      showError("Please add an image proof.");
      fileInput.focus();
      return;
    }
    if (!file.type || file.type.indexOf("image/") !== 0) {
      showError("Please choose an image file.");
      return;
    }

    var items = parseInt(itemsInput.value, 10);
    if (isNaN(items) || items < 1) {
      showError("Enter at least 1 item.");
      itemsInput.focus();
      return;
    }

    var loc = locationSelect.value;
    if (!loc) {
      showError("Please select a location.");
      locationSelect.focus();
      return;
    }

    submitBtn.disabled = true;

    readFileAsDataURL(file)
      .then(function (dataUrl) {
        var imageName = file.name || "image";
        var imagePreview = null;
        if (typeof dataUrl === "string" && file.size <= MAX_PREVIEW_BYTES) {
          imagePreview = dataUrl;
        }

        var entry = {
          id: Date.now() + "-" + Math.random().toString(36).slice(2, 10),
          binNumber: bin,
          imageName: imageName,
          imagePreview: imagePreview,
          itemCount: items,
          location: loc,
          status: "Pending Verification",
          submittedAt: new Date().toISOString(),
        };

        var list = getSubmissions();
        list.push(entry);

        try {
          saveSubmissions(list);
        } catch (err) {
          if (imagePreview) {
            entry.imagePreview = null;
            list[list.length - 1] = entry;
            try {
              saveSubmissions(list);
            } catch (err2) {
              submitBtn.disabled = false;
              showError("Could not save. Try a smaller image or clear old submissions.");
              return;
            }
          } else {
            submitBtn.disabled = false;
            showError("Could not save. Storage may be full.");
            return;
          }
        }

        form.reset();
        previewWrap.hidden = true;
        previewImg.removeAttribute("src");
        successEl.hidden = false;
        successEl.textContent = "Submission sent for admin review";
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(function () {
        showError("Could not read the image. Try another file.");
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
