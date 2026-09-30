/* ============================================================
   RT Learning — Profile Sync
   Small shared script that reads the saved profile from
   localStorage and updates the header avatar / name / level
   on every page (Dashboard, Practice, Contact, etc.).
   Also used by the Profile page itself.
   ============================================================ */

(function () {
    "use strict";

    var STORAGE_KEY = "rtLearningProfile";
    var DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";

    function loadProfile() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            return null;
        }
    }

    function shortLevel(level) {
        // "B2 High-Intermediate" -> "B2 - high-intermediate"
        var parts = (level || "").split(" ");
        if (!parts[0]) return "B2 - advance";
        return parts[0] + " - " + (parts[1] ? parts[1].toLowerCase() : "level");
    }

    function apply() {
        var profile = loadProfile();
        if (!profile) return; // nothing saved yet — keep defaults

        var nameEls = document.querySelectorAll(".js-user-name");
        var levelEls = document.querySelectorAll(".js-user-level");
        var avatarEls = document.querySelectorAll(".js-user-avatar");
        var i;

        for (i = 0; i < nameEls.length; i++) {
            nameEls[i].textContent = profile.name;
        }
        for (i = 0; i < levelEls.length; i++) {
            levelEls[i].textContent = shortLevel(profile.level);
        }
        for (i = 0; i < avatarEls.length; i++) {
            avatarEls[i].src = profile.avatar || DEFAULT_AVATAR;
        }
    }

    // Update when another tab changes the profile too
    window.addEventListener("storage", function (e) {
        if (e.key === STORAGE_KEY) apply();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", apply);
    } else {
        apply();
    }
})();
