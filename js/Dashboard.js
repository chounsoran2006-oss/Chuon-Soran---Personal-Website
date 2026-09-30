/* ============================================================
   RT Learning — Dashboard logic
   Streak + XP tracking, weekly chart, study timer, search,
   notifications, and activity sessions.
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Storage keys ---------- */
    var K_STREAK = "rtlStreak";
    var K_LAST = "rtlLastStudyDate";
    var K_RECORD = "rtlStreakRecord";
    var K_XP_TODAY = "rtlXpToday";
    var K_XP_DATE = "rtlXpDate";
    var K_XP_WEEK = "rtlXpWeek";
    var K_XP_WEEK_REF = "rtlXpWeekRef";
    var K_STUDY_SECS = "rtlStudySeconds";
    var K_STUDY_DATE = "rtlStudyDate";
    var K_PROFILE = "rtLearningProfile"; // shared with ProfileSync / Proffile.js

    var CATALOG = [
        { title: "Speed Listening", desc: "3 min rapid audio", xp: 45, kw: "listening audio speed ear training rapid comprehension" },
        { title: "Grammar Sprint", desc: "10 tense queries", xp: 60, kw: "grammar tense quiz writing structure drill" },
        { title: "AI Speech Coach", desc: "Phoneme feedback", xp: 75, kw: "speech speaking pronunciation phoneme coach voice" },
        { title: "Vocabulary Builder", desc: "20 new words daily", xp: 50, kw: "vocabulary words flashcards definitions builder" },
        { title: "Reading Comprehension", desc: "Short story + questions", xp: 55, kw: "reading comprehension story passage questions text" },
        { title: "Idiom of the Day", desc: "Learn 5 idioms", xp: 30, kw: "idiom phrase expression slang meaning" },
        { title: "Writing Practice", desc: "Guided essay tasks", xp: 65, kw: "writing essay paragraph guided composition" },
        { title: "Pronunciation Lab", desc: "Minimal pairs drill", xp: 40, kw: "pronunciation minimal pairs sounds drill lab" },
        { title: "Listening Test", desc: "CEFR listening track", xp: 80, kw: "listening test cefr assessment diagnostic exam" }
    ];

    var DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
    var TARGET_MINS = 15;

    /* ---------- Utils ---------- */
    function $(id) { return document.getElementById(id); }

    function get(k, fallback) {
        try {
            var v = localStorage.getItem(k);
            return v === null ? fallback : JSON.parse(v);
        } catch (e) { return fallback; }
    }

    function set(k, v) {
        try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ }
    }

    function isoOf(d) {
        return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
    }

    function todayISO() { return isoOf(new Date()); }

    function mondayRef() {
        var d = new Date();
        var diff = (d.getDay() === 0) ? 6 : (d.getDay() - 1);
        d.setDate(d.getDate() - diff);
        return isoOf(d);
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
        });
    }

    /* ---------- Day rollover ---------- */
    function ensureDayRollover() {
        var today = todayISO();

        // Streak resets if a full day was missed
        var last = get(K_LAST, null);
        if (last && last !== today) {
            var diffDays = Math.round((new Date(today) - new Date(last)) / 86400000);
            if (diffDays > 1) set(K_STREAK, 0);
        }

        // XP today resets
        if (get(K_XP_DATE, null) !== today) {
            set(K_XP_TODAY, 0);
            set(K_XP_DATE, today);
        }

        // Weekly XP resets on a new Monday
        if (get(K_XP_WEEK_REF, null) !== mondayRef()) {
            set(K_XP_WEEK, [0, 0, 0, 0, 0, 0, 0]);
            set(K_XP_WEEK_REF, mondayRef());
        }

        // Study timer resets
        if (get(K_STUDY_DATE, null) !== today) {
            set(K_STUDY_SECS, 0);
            set(K_STUDY_DATE, today);
        }
    }

    /* ---------- Streak / XP ---------- */
    function getStreak() { return get(K_STREAK, 14); }

    function getRecord() {
        var rec = get(K_RECORD, null);
        if (rec === null) { rec = getStreak(); set(K_RECORD, rec); }
        return Math.max(rec, getStreak());
    }

    function addXp(amount) {
        ensureDayRollover();
        set(K_XP_TODAY, get(K_XP_TODAY, 0) + amount);

        var week = get(K_XP_WEEK, null);
        if (!week || week.length !== 7) week = [0, 0, 0, 0, 0, 0, 0];
        var idx = (new Date().getDay() + 6) % 7; // Mon = 0
        week[idx] += amount;
        set(K_XP_WEEK, week);

        renderXp();
        renderChart();
    }

    function markStudied() {
        var today = todayISO();
        var already = get(K_LAST, null) === today;
        set(K_LAST, today);
        if (!already) set(K_STREAK, getStreak() + 1);
        set(K_RECORD, Math.max(getRecord(), getStreak()));
        renderStreak();
    }

    /* ---------- Study timer ---------- */
    var timerInterval = null;
    var studiedSecs = get(K_STUDY_SECS, 0);

    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(function () {
            studiedSecs++;
            if (studiedSecs % 5 === 0) set(K_STUDY_SECS, studiedSecs);
            renderTimeTarget();
        }, 1000);
    }

    function stopTimer() {
        if (!timerInterval) return;
        clearInterval(timerInterval);
        timerInterval = null;
        set(K_STUDY_SECS, studiedSecs);
    }

    /* ---------- Renderers ---------- */
    function firstName() {
        try {
            var p = JSON.parse(localStorage.getItem(K_PROFILE) || "{}");
            return (p.name || "Sora").split(" ")[0];
        } catch (e) { return "Sora"; }
    }

    function renderGreeting() {
        var el = $("greeting");
        if (!el) return;
        var d = new Date();
        var hour = d.getHours();
        var part = hour < 12 ? "Good morning" : (hour < 18 ? "Good afternoon" : "Good evening");
        el.innerHTML = part + ", <br class=\"hidden sm:inline\">" + escapeHtml(firstName()) + "! Ready to learn?";
    }

    function renderStreak() {
        var s = getStreak();
        var rec = getRecord();

        var pill = $("streakDays");
        if (pill) pill.textContent = s + (s === 1 ? " day" : " days");

        var title = $("streakTitle");
        if (title) title.textContent = s + "-Day Streak";

        var record = $("streakRecord");
        if (record) record.textContent = "Personal record: " + rec + " days";

        var grid = $("streakGrid");
        if (!grid) return;
        grid.innerHTML = "";
        var last = get(K_LAST, null);
        for (var i = 6; i >= 0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            var isToday = i === 0;
            var studied = last === isoOf(d);
            var cell = document.createElement("span");
            cell.title = isoOf(d);
            cell.className = "w-full aspect-square flex items-center justify-center rounded-lg text-sm font-bold " +
                (studied
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : "bg-[#252c3d] border border-[#2d354a] text-slate-600");
            cell.textContent = studied ? "\u2713" : (isToday ? "S" : DAY_LETTERS[(d.getDay() + 6) % 7]);
            grid.appendChild(cell);
        }
    }

    function renderTimeTarget() {
        var text = $("timeTargetText");
        var bar = $("timeTargetBar");
        if (!text || !bar) return;
        var mins = Math.floor(studiedSecs / 60);
        var pct = Math.min(100, Math.round(studiedSecs / (TARGET_MINS * 60) * 100));
        text.textContent = mins + " / " + TARGET_MINS + " mins (" + pct + "%)";
        bar.style.width = Math.max(pct, 2) + "%";
        if (pct >= 100) {
            bar.classList.remove("bg-emerald-500");
            bar.classList.add("bg-indigo-400");
        }
    }

    function renderXp() {
        var el = $("xpToday");
        if (el) el.textContent = get(K_XP_TODAY, 0) + " XP Today";
    }

    function renderChart() {
        var chart = $("xpChart");
        if (!chart) return;
        var week = get(K_XP_WEEK, null);
        if (!week || week.length !== 7) week = [45, 60, 45, 80, 55, 65, 95];

        var max = Math.max.apply(null, week.concat([1]));
        var sum = week.reduce(function (a, b) { return a + b; }, 0);
        var avg = sum / 7;

        chart.innerHTML = "";
        for (var i = 0; i < 7; i++) {
            var hPct = week[i] > 0 ? Math.max(8, Math.round(week[i] / max * 100)) : 4;
            var isToday = i === (new Date().getDay() + 6) % 7;
            var col = document.createElement("div");
            col.className = "flex flex-col items-center gap-2 w-full h-full justify-end";
            var bar = document.createElement("div");
            bar.className = "w-full max-w-8 rounded-t-lg transition-all duration-500 " +
                (isToday ? "bg-emerald-400 shadow-lg shadow-emerald-500/20" : "bg-[#252c3d]");
            bar.style.height = hPct + "%";
            bar.title = week[i] + " XP";
            col.appendChild(bar);
            var lbl = document.createElement("span");
            lbl.className = "font-bold text-xs " + (isToday ? "text-emerald-400" : "text-slate-400");
            lbl.textContent = DAY_LETTERS[i];
            col.appendChild(lbl);
            chart.appendChild(col);
        }

        var avgEl = $("xpAvg");
        if (avgEl && avg > 0) {
            var diff = Math.round((week[(new Date().getDay() + 6) % 7] - avg) / avg * 100);
            avgEl.textContent = (diff >= 0 ? "+" : "") + diff + "% vs avg";
        }
    }

    /* ---------- Toast ---------- */
    function toast(msg) {
        var old = document.querySelector(".js-dash-toast");
        if (old && old.parentNode) old.parentNode.removeChild(old);

        var t = document.createElement("div");
        t.className = "js-dash-toast fixed bottom-6 right-6 z-[80] rounded-xl border border-emerald-500/30 bg-[#0d221c] px-4 py-3 text-sm text-white shadow-2xl transition-all duration-300 translate-y-3 opacity-0";
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () { t.classList.remove("translate-y-3", "opacity-0"); }, 10);
        setTimeout(function () { t.classList.add("translate-y-3", "opacity-0"); }, 2500);
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2900);
    }

    /* ---------- Activity session ---------- */
    function startActivity(item) {
        var title = item ? item.title : "Focus Session";
        var xp = item ? item.xp : 30;
        var totalSecs = 3 * 60;

        var overlay = document.createElement("div");
        overlay.className = "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm";
        overlay.innerHTML =
            "<div class=\"w-full max-w-sm rounded-2xl border border-[#242838] bg-[#121625] p-6 text-center shadow-2xl\">" +
            "<p class=\"text-xs font-bold tracking-wide text-indigo-400 uppercase\">" + escapeHtml(title) + "</p>" +
            "<h3 id=\"sessionTimer\" class=\"mt-2 text-4xl font-bold text-white\">03:00</h3>" +
            "<p class=\"mt-1 text-xs text-slate-400\">Stay focused — the session auto-starts your study timer.</p>" +
            "<div class=\"mt-5 flex gap-3\">" +
            "<button id=\"sessionGiveUp\" class=\"flex-1 rounded-xl border border-[#242838] bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10\">Quit</button>" +
            "<button id=\"sessionDone\" class=\"flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400\">Finish (+" + xp + " XP)</button>" +
            "</div></div>";

        document.body.appendChild(overlay);
        startTimer();

        function fmt(s) {
            return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
        }

        var remaining = totalSecs;
        var t = setInterval(function () {
            remaining--;
            var el = document.getElementById("sessionTimer");
            if (el) el.textContent = fmt(remaining);
            if (remaining <= 0) finish(true);
        }, 1000);

        function finish(complete) {
            clearInterval(t);
            stopTimer();
            overlay.remove();
            if (!complete) return;
            addXp(xp);
            markStudied();
            toast("+" + xp + " XP earned from " + title + "!");
        }

        overlay.querySelector("#sessionGiveUp").addEventListener("click", function () { finish(false); });
        overlay.querySelector("#sessionDone").addEventListener("click", function () { finish(true); });
    }

    /* ---------- Search ---------- */
    function setupSearch() {
        var input = $("searchInput");
        var panel = $("searchResults");
        if (!input || !panel) return;

        function render(results) {
            if (!results.length) {
                panel.innerHTML = "<div class=\"px-4 py-3 text-xs text-slate-500\">No lessons found for \u201C" + escapeHtml(input.value) + "\u201D</div>";
            } else {
                panel.innerHTML = results.map(function (r) {
                    return "<button data-title=\"" + escapeHtml(r.title) + "\" class=\"w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between gap-3\">" +
                        "<span><span class=\"block text-sm font-semibold text-white\">" + escapeHtml(r.title) + "</span>" +
                        "<span class=\"block text-xs text-slate-400\">" + escapeHtml(r.desc) + "</span></span>" +
                        "<span class=\"text-[11px] font-bold text-indigo-400 shrink-0\">+" + r.xp + " XP</span></button>";
                }).join("");
            }
            panel.classList.remove("hidden");
        }

        function doSearch() {
            var q = input.value.trim().toLowerCase();
            if (!q) { panel.classList.add("hidden"); return; }
            var results = CATALOG.filter(function (item) {
                return (item.title + " " + item.desc + " " + item.kw).toLowerCase().indexOf(q) !== -1;
            }).slice(0, 6);
            render(results);
        }

        panel.addEventListener("click", function (e) {
            var btn = e.target.closest("button[data-title]");
            if (!btn) return;
            var match = null;
            for (var i = 0; i < CATALOG.length; i++) {
                if (CATALOG[i].title === btn.getAttribute("data-title")) { match = CATALOG[i]; break; }
            }
            panel.classList.add("hidden");
            input.value = "";
            if (match) startActivity(match);
        });

        input.addEventListener("input", doSearch);
        input.addEventListener("focus", doSearch);
        input.addEventListener("keydown", function (e) {
            if (e.key === "Escape") panel.classList.add("hidden");
        });
        document.addEventListener("click", function (e) {
            if (!panel.contains(e.target) && e.target !== input) panel.classList.add("hidden");
        });
    }

    /* ---------- Notifications ---------- */
    function seedNotifications() {
        if (get("rtlNotifSeeded", false)) return;
        set("rtlNotifs", [
            { title: "You reached a 14-day streak!", time: "2h ago", unread: true },
            { title: "New: AI Speech Coach is available", time: "1d ago", unread: true },
            { title: "Your B2 certificate is ready", time: "3d ago", unread: true }
        ]);
        set("rtlNotifSeeded", true);
    }

    function renderNotifs() {
        var list = $("notifList");
        if (!list) return;
        var notifs = get("rtlNotifs", []);
        list.innerHTML = notifs.length ? notifs.map(function (n) {
            return "<div class=\"px-4 py-3 " + (n.unread ? "bg-indigo-500/5" : "") + "\">" +
                "<div class=\"flex items-start justify-between gap-3\">" +
                "<span class=\"text-sm text-slate-200\">" + escapeHtml(n.title) + "</span>" +
                "<span class=\"text-[10px] text-slate-500 shrink-0\">" + escapeHtml(n.time) + "</span></div>" +
                "<span class=\"block mt-1 text-[11px] " + (n.unread ? "text-indigo-400" : "text-slate-600") + "\">" +
                (n.unread ? "\u25CF Unread" : "Read") + "</span></div>";
        }).join("") : "<div class=\"px-4 py-6 text-center text-xs text-slate-500\">You're all caught up</div>";

        var dot = $("notifDot");
        if (dot) dot.classList.toggle("hidden", !notifs.some(function (n) { return n.unread; }));
    }

    function setupNotifs() {
        var btn = $("bellBtn");
        var panel = $("notifPanel");
        var clearBtn = $("notifClear");
        if (!btn || !panel) return;

        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            panel.classList.toggle("hidden");
        });

        document.addEventListener("click", function (e) {
            if (!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.add("hidden");
        });

        if (clearBtn) {
            clearBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                var notifs = get("rtlNotifs", []);
                notifs.forEach(function (n) { n.unread = false; });
                set("rtlNotifs", notifs);
                renderNotifs();
            });
        }
    }

    /* ---------- Activity cards ---------- */
    function setupActivityCards() {
        var cards = document.querySelectorAll(".js-activity");
        Array.prototype.forEach.call(cards, function (card) {
            card.addEventListener("click", function () {
                var titleEl = card.querySelector("h3");
                var title = titleEl ? titleEl.textContent : "Focus Session";
                var match = null;
                for (var i = 0; i < CATALOG.length; i++) {
                    if (CATALOG[i].title === title) { match = CATALOG[i]; break; }
                }
                startActivity(match || { title: title, xp: 30 });
            });
        });
    }

    /* ---------- Init ---------- */
    ensureDayRollover();
    seedNotifications();
    studiedSecs = get(K_STUDY_SECS, 0);
    renderGreeting();
    renderStreak();
    renderTimeTarget();
    renderXp();
    renderChart();
    renderNotifs();
    setupSearch();
    setupNotifs();
    setupActivityCards();
})();
