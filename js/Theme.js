/* ============================================================
   RT Learning — Theme toggle
   Injects a Light/Dark button into the navbar of every page,
   toggles the "light" class on <html>, and remembers the choice.
   ============================================================ */

(function () {
    "use strict";

    var KEY = "rtlTheme";

    function current() {
        try { return localStorage.getItem(KEY) || "dark"; } catch (e) { return "dark"; }
    }

    function applyTheme(t) {
        document.documentElement.classList.toggle("light", t === "light");
    }

    /* Smooth crossfade: html gets "theme-anim" only while switching
       (css/theme.css turns it into a color transition), then it is
       removed so everyday hovers keep their fast Tailwind timing. */
    var animTimer = null;

    function animateTheme() {
        var reduce = false;
        try {
            reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (e) { /* ignore */ }
        if (reduce) return;
        var root = document.documentElement;
        root.classList.add("theme-anim");
        if (animTimer) clearTimeout(animTimer);
        animTimer = setTimeout(function () { root.classList.remove("theme-anim"); }, 450);
    }

    /* Duotone icons — filled amber sun / indigo crescent moon with sparkle */
var SUN_SVG = '<svg class="w-5 h-5 text-amber-400" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        + '<circle cx="12" cy="12" r="4.5" fill="currentColor"/>'
        + '<g stroke="currentColor" stroke-width="2" stroke-linecap="round">'
        + '<path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'
        + '</g></svg>';
var MOON_SVG = '<svg class="w-5 h-5 text-indigo-300" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        + '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>'
        + '<path d="M18.5 2.5L19.3 4.7L21.5 5.5L19.3 6.3L18.5 8.5L17.7 6.3L15.5 5.5L17.7 4.7Z" fill="currentColor" opacity=".85"/>'
        + '</svg>';

    function iconFor(t) { return t === "light" ? MOON_SVG : SUN_SVG; } // show the mode you'd switch TO
    function labelFor(t) { return t === "light" ? "Dark" : "Light"; }

    function animateSwap(el) {
        if (el && el.animate) {
            el.animate(
                [{ transform: "rotate(-140deg) scale(.3)", opacity: "0" },
                 { transform: "rotate(0deg) scale(1)", opacity: "1" }],
                { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" }
            );
        }
    }

    // Apply saved theme immediately (before paint as much as possible)
    applyTheme(current());

    function makeButton(block) {
        var t = current();
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Toggle light and dark mode");
        b.className = "js-theme-toggle group flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border border-[#242838] bg-[#121625] hover:bg-[#1a2030] hover:border-[#3d4a75] text-gray-400 hover:text-white shadow-sm transition-all" +
            (block ? " w-full justify-center mt-1" : "");
        b.title = "Switch to " + labelFor(t) + " mode";
        b.innerHTML = '<span class="js-theme-icon inline-flex items-center transition-transform group-hover:scale-110" aria-hidden="true">' + iconFor(t) + '</span><span class="js-theme-label">' + labelFor(t) + '</span>';
        b.addEventListener("click", toggle);
        return b;
    }

    function inject() {
        var found = false;

        // Desktop navbars (skip the mobile menu nav)
        var navs = document.querySelectorAll("header nav:not(#mobile-menu):not(#practice-mobile-menu)");
        Array.prototype.forEach.call(navs, function (nav) {
            if (nav.querySelector(".js-theme-toggle")) return;
            nav.appendChild(makeButton(false));
            found = true;
        });

        // Mobile menu — add a full-width item at the end of its list
        var mm = document.getElementById("mobile-menu") || document.getElementById("practice-mobile-menu");
        if (mm) {
            var list = mm.querySelector(".flex.flex-col") || mm;
            if (!list.querySelector(".js-theme-toggle")) {
                list.appendChild(makeButton(true));
            }
        }

        // Pages without a navbar (Login, Logout) — floating toggle
        if (!found && !document.querySelector(".js-theme-toggle")) {
            var b = makeButton(false);
            b.classList.add("fixed", "top-4", "right-4", "z-[90]", "shadow-lg");
            document.body.appendChild(b);
        }
    }

    function syncButtons(animate) {
        var t = current();
        Array.prototype.forEach.call(document.querySelectorAll(".js-theme-toggle"), function (b) {
            var icon = b.querySelector(".js-theme-icon");
            var label = b.querySelector(".js-theme-label");
            if (icon) {
                icon.innerHTML = iconFor(t);
                if (animate) animateSwap(icon);
            }
            if (label) label.textContent = labelFor(t);
            b.title = "Switch to " + labelFor(t) + " mode";
        });
    }

    function toggle() {
        var t = current() === "light" ? "dark" : "light";
        try { localStorage.setItem(KEY, t); } catch (e) { /* ignore */ }
        animateTheme();
        applyTheme(t);
        syncButtons(true);
    }

    // Keep tabs in sync
    window.addEventListener("storage", function (e) {
        if (e.key === KEY) { animateTheme(); applyTheme(current()); syncButtons(true); }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inject);
    } else {
        inject();
    }
})();

