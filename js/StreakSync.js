(function () {
    "use strict";

    var STORAGE_KEY = "rtlStreak";

    function getStreak() {
        try {
            var streak = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Number.isFinite(streak) && streak >= 0 ? streak : 14;
        } catch (error) {
            return 14;
        }
    }

    function render() {
        var streak = getStreak();
        var dayText = streak + (streak === 1 ? " day" : " days");

        document.querySelectorAll(".js-streak-days").forEach(function (element) {
            element.textContent = dayText;
        });
        document.querySelectorAll(".js-streak-count").forEach(function (element) {
            element.textContent = streak;
        });
    }

    window.addEventListener("storage", function (event) {
        if (event.key === STORAGE_KEY) render();
    });

    render();
})();