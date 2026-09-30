/* ============================================================
   RT Learning — Profile page logic
   Handles: avatar upload, edit mode (name / email / level / bio),
   validation, localStorage persistence, and header sync.
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Keys & defaults ---------- */
    var STORAGE_KEY = "rtLearningProfile";
    var DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
    var MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

    var DEFAULT_PROFILE = {
        name: "Soran",
        email: "soran@example.com",
        level: "B2 High-Intermediate",
        bio: "",
        avatar: DEFAULT_AVATAR
    };

    /* ---------- Element references ---------- */
    var $ = function (id) { return document.getElementById(id); };

    var els = {
        // view
        viewMode: $("viewMode"),
        viewName: $("viewName"),
        viewEmail: $("viewEmail"),
        viewLevel: $("viewLevel"),
        viewBio: $("viewBio"),

        // edit
        editMode: $("editMode"),
        inputName: $("inputName"),
        inputEmail: $("inputEmail"),
        inputLevel: $("inputLevel"),
        inputBio: $("inputBio"),
        errorName: $("errorName"),
        errorEmail: $("errorEmail"),

        // photo
        profileAvatar: $("profileAvatar"),
        avatarPreview: $("avatarPreview"),
        avatarEditBtn: $("avatarEditBtn"),
        pickPhotoBtn: $("pickPhotoBtn"),
        avatarInput: $("avatarInput"),

        // actions
        editBtn: $("editBtn"),
        saveBtn: $("saveBtn"),
        cancelBtn: $("cancelBtn"),

        // toast
        toast: $("toast"),
        toastMsg: $("toastMsg"),

        // header widgets
        headerName: document.querySelector(".js-user-name"),
        headerLevel: document.querySelector(".js-user-level"),
        headerAvatars: document.querySelectorAll(".js-user-avatar")
    };

    /* ---------- State ---------- */
    var profile = loadProfile();
    var pendingAvatar = null; // base64 chosen while in edit mode, not yet saved

    function loadProfile() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return Object.assign({}, DEFAULT_PROFILE);
            var parsed = JSON.parse(raw);
            return Object.assign({}, DEFAULT_PROFILE, parsed);
        } catch (err) {
            return Object.assign({}, DEFAULT_PROFILE);
        }
    }

    function saveProfile() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } catch (err) {
            // Storage full (large image) or unavailable — keep UI working anyway
            showToast("Could not save image permanently — storage limit reached.", true);
        }
    }

    /* ---------- Rendering ---------- */
    function render() {
        // Main card
        if (els.viewName) els.viewName.textContent = profile.name;
        if (els.viewEmail) els.viewEmail.textContent = profile.email;
        if (els.viewLevel) els.viewLevel.textContent = profile.level;
        if (els.viewBio) {
            if (profile.bio && profile.bio.trim()) {
                els.viewBio.textContent = profile.bio;
                els.viewBio.classList.remove("hidden");
            } else {
                els.viewBio.classList.add("hidden");
            }
        }

        // Avatars
        if (els.profileAvatar) els.profileAvatar.src = profile.avatar;
        if (els.avatarPreview) els.avatarPreview.src = profile.avatar;
        if (els.headerAvatars && els.headerAvatars.length) {
            for (var i = 0; i < els.headerAvatars.length; i++) {
                els.headerAvatars[i].src = profile.avatar;
            }
        }

        // Header widgets
        if (els.headerName) els.headerName.textContent = profile.name;
        if (els.headerLevel) {
            els.headerLevel.textContent = profile.level.split(" ")[0] + " - " +
                (profile.level.split(" ")[1] ? profile.level.split(" ")[1].toLowerCase() : "level");
        }
    }

    /* ---------- Edit mode ---------- */
    function enterEditMode() {
        // Prefill form with current values
        els.inputName.value = profile.name;
        els.inputEmail.value = profile.email;
        els.inputLevel.value = profile.level;
        els.inputBio.value = profile.bio || "";
        pendingAvatar = null;

        clearErrors();

        // Toggle visibility
        els.viewMode.classList.add("hidden");
        els.editMode.classList.remove("hidden");
        els.editBtn.classList.add("hidden");
        els.saveBtn.classList.remove("hidden");
        els.saveBtn.classList.add("flex");
        els.cancelBtn.classList.remove("hidden");
    }

    function exitEditMode() {
        els.viewMode.classList.remove("hidden");
        els.editMode.classList.add("hidden");
        els.editBtn.classList.remove("hidden");
        els.saveBtn.classList.add("hidden");
        els.saveBtn.classList.remove("flex");
        els.cancelBtn.classList.add("hidden");
    }

    function clearErrors() {
        els.errorName.classList.add("hidden");
        els.errorEmail.classList.add("hidden");
        els.inputName.classList.remove("border-rose-500");
        els.inputEmail.classList.remove("border-rose-500");
    }

    function validate() {
        var ok = true;
        var name = els.inputName.value.trim();
        var email = els.inputEmail.value.trim();
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (name.length < 2) {
            els.errorName.classList.remove("hidden");
            els.inputName.classList.add("border-rose-500");
            ok = false;
        } else {
            els.errorName.classList.add("hidden");
            els.inputName.classList.remove("border-rose-500");
        }

        if (!emailRe.test(email)) {
            els.errorEmail.classList.remove("hidden");
            els.inputEmail.classList.add("border-rose-500");
            ok = false;
        } else {
            els.errorEmail.classList.add("hidden");
            els.inputEmail.classList.remove("border-rose-500");
        }

        return ok;
    }

    function saveChanges() {
        if (!validate()) return;

        profile.name = els.inputName.value.trim();
        profile.email = els.inputEmail.value.trim();
        profile.level = els.inputLevel.value;
        profile.bio = els.inputBio.value.trim();
        if (pendingAvatar) profile.avatar = pendingAvatar;

        saveProfile();
        render();
        exitEditMode();
        showToast("Profile updated successfully!");
    }

    /* ---------- Avatar upload ---------- */
    function handleImageFile(file) {
        if (!file) return;

        if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
            showToast("Please choose a PNG, JPG or WEBP image.", true);
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            showToast("Image is too large — max 2MB.", true);
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var dataUrl = e.target.result;
            pendingAvatar = dataUrl;

            // Shrink large photos before storing so localStorage doesn't overflow
            compressImage(dataUrl, 512, function (compressed) {
                pendingAvatar = compressed;
                els.profileAvatar.src = compressed;
                els.avatarPreview.src = compressed;
            });
        };
        reader.readAsDataURL(file);
    }

    function compressImage(dataUrl, maxSize, callback) {
        var img = new Image();
        img.onload = function () {
            var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            if (scale >= 1) { callback(dataUrl); return; }

            var canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            try {
                callback(canvas.toDataURL("image/jpeg", 0.85));
            } catch (err) {
                callback(dataUrl);
            }
        };
        img.onerror = function () { callback(dataUrl); };
        img.src = dataUrl;
    }

    /* ---------- Toast ---------- */
    var toastTimer = null;
    function showToast(message, isError) {
        if (!els.toast || !els.toastMsg) return;
        els.toastMsg.textContent = message;
        els.toast.classList.remove("hidden");
        els.toast.classList.add("flex");
        // trigger transition
        requestAnimationFrame(function () {
            els.toast.classList.remove("translate-y-3", "opacity-0");
        });
        if (isError) {
            els.toast.classList.remove("border-emerald-500/30", "bg-[#0d221c]");
            els.toast.classList.add("border-rose-500/30", "bg-[#22101a]");
        } else {
            els.toast.classList.remove("border-rose-500/30", "bg-[#22101a]");
            els.toast.classList.add("border-emerald-500/30", "bg-[#0d221c]");
        }
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            els.toast.classList.add("translate-y-3", "opacity-0");
            setTimeout(function () {
                els.toast.classList.add("hidden");
                els.toast.classList.remove("flex");
            }, 320);
        }, 2600);
    }

    /* ---------- Events ---------- */
    if (els.editBtn) els.editBtn.addEventListener("click", enterEditMode);
    if (els.cancelBtn) els.cancelBtn.addEventListener("click", function () {
        exitEditMode();
        render(); // restore any previewed avatar back to the saved one
    });
    if (els.saveBtn) els.saveBtn.addEventListener("click", saveChanges);

    // Both camera button (view mode) and upload button (edit mode) open the picker.
    // In view mode, picking a photo enters edit mode automatically.
    if (els.avatarEditBtn) els.avatarEditBtn.addEventListener("click", function () {
        if (els.editMode.classList.contains("hidden")) enterEditMode();
        els.avatarInput.click();
    });
    if (els.pickPhotoBtn) els.pickPhotoBtn.addEventListener("click", function () {
        els.avatarInput.click();
    });
    if (els.avatarInput) els.avatarInput.addEventListener("change", function () {
        if (this.files && this.files[0]) handleImageFile(this.files[0]);
        this.value = ""; // allow re-picking the same file
    });

    // Clear error highlight while typing
    if (els.inputName) els.inputName.addEventListener("input", function () {
        els.inputName.classList.remove("border-rose-500");
        els.errorName.classList.add("hidden");
    });
    if (els.inputEmail) els.inputEmail.addEventListener("input", function () {
        els.inputEmail.classList.remove("border-rose-500");
        els.errorEmail.classList.add("hidden");
    });

    // Ctrl/Cmd + S saves while in edit mode
    document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" &&
            !els.editMode.classList.contains("hidden")) {
            e.preventDefault();
            saveChanges();
        }
    });

    /* ---------- Init ---------- */
    render();
})();
