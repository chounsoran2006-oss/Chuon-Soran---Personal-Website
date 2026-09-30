(function () {
    "use strict";

    var rootUrl = new URL("../", document.currentScript.src);
    var pageUrl = function (path) { return new URL(path, rootUrl).href; };
    document.body.classList.add("course-page");
    document.querySelectorAll("body a").forEach(function (link) {
        if (/back to (?:all )?courses|return to portal/i.test(link.textContent)) {
            link.remove();
        }
    });
    var oldNavigation = document.body.firstElementChild;

    if (oldNavigation && /^(HEADER|NAV)$/.test(oldNavigation.tagName)) {
        oldNavigation.remove();
    }

    var coursePath = decodeURIComponent(window.location.pathname);
    var courseTracks = [
        { folder: "Business English .course", page: "Business English .html" },
        { folder: "IELTS & TOEFL.course", page: "IELTS & TOEFL.html" },
        { folder: "Everyday Fluency.course", page: "Everyday Fluency.html" },
        { folder: "academic-writing-courses", page: "Academic Writing .html" }
    ];
    var currentTrack = courseTracks.find(function (track) {
        return coursePath.includes("/" + track.folder + "/");
    });
    var isTrackLandingPage = currentTrack && coursePath.endsWith("/" + currentTrack.folder + "/" + currentTrack.page);
    var main = document.querySelector("main");

    if (currentTrack && !isTrackLandingPage && main) {
        var backRow = document.createElement("div");
        backRow.className = "mb-5 flex justify-end";
        backRow.innerHTML = '<a href="' + pageUrl("Pages/My course/" + currentTrack.folder + "/" + currentTrack.page) + '" aria-label="Back to course category" class="inline-flex items-center gap-2 rounded-lg bg-[#817dff] px-4 py-2.5 text-sm font-semibold text-[#111321] transition hover:bg-[#9692ff]"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7 7-7M3 12h18" /></svg>Back</a>';
        main.prepend(backRow);
    }

    var header = document.createElement("header");
    header.className = "w-full bg-[#171b26] border-b border-[#242838] sticky top-0 z-50";
    header.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between gap-4">
                <a href="${pageUrl("index.html")}" class="flex items-center gap-3 shrink-0">
                    <img src="https://img.magnific.com/premium-vector/rtl-logo-rtl-letter-rtl-letter-logo-design-initials-rtl-logo-linked-with-circle-uppercase-monogram-logo-rtl-typography-technology-business-real-estate-brand_229120-67750.jpg?semt=ais_hybrid&w=740&q=80"
                        alt="RT Learning Logo" class="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-indigo-500/20">
                    <span class="text-lg sm:text-xl font-bold text-white tracking-tight">RT Learning</span>
                </a>
                <nav class="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main navigation">
                    <a href="${pageUrl("index.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">Dashboard</a>
                    <a href="${pageUrl("Pages/My course/My course.html")}" aria-current="page" class="bg-[#817dff] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#6c67f0] transition text-sm hover:text-white">My Course</a>
                    <a href="${pageUrl("Pages/Practice Test/practice-test.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">Practice Tests</a>
                    <a href="${pageUrl("Pages/Profile.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">Profile</a>
                    <a href="${pageUrl("Pages/Contact.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">Contact Us</a>
                    <a href="${pageUrl("Pages/Logout.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm flex items-center gap-1.5">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                        Logout
                    </a>
                </nav>
                <button id="course-menu-toggle" type="button" class="md:hidden text-gray-300 hover:text-white p-2 rounded-lg focus:outline-none focus:bg-[#242838]" aria-label="Open menu" aria-expanded="false">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>
            <nav id="mobile-menu" class="hidden md:hidden mt-4 pt-4 border-t border-[#242838]" aria-label="Mobile navigation">
                <div class="flex flex-col gap-1">
                    <a href="${pageUrl("index.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Dashboard</a>
                    <a href="${pageUrl("Pages/My course/My course.html")}" aria-current="page" class="bg-[#817dff] text-black px-4 py-2.5 rounded-lg font-semibold text-center hover:bg-[#6c67f0] transition">My Course</a>
                    <a href="${pageUrl("Pages/Practice Test/practice-test.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Practice Tests</a>
                    <a href="${pageUrl("Pages/Profile.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Profile</a>
                    <a href="${pageUrl("Pages/Contact.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Contact Us</a>
                    <a href="${pageUrl("Pages/Logout.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Logout</a>
                </div>
            </nav>
        </div>`;

    document.body.prepend(header);

    var menuButton = header.querySelector("#course-menu-toggle");
    var mobileMenu = header.querySelector("#mobile-menu");
    menuButton.addEventListener("click", function () {
        var isExpanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isExpanded));
        menuButton.setAttribute("aria-label", isExpanded ? "Open menu" : "Close menu");
        mobileMenu.classList.toggle("hidden", isExpanded);
    });

    var themeStyles = document.createElement("link");
    themeStyles.rel = "stylesheet";
    themeStyles.href = pageUrl("css/theme.css");
    document.head.appendChild(themeStyles);

    var themeScript = document.createElement("script");
    themeScript.src = pageUrl("js/Theme.js");
    document.head.appendChild(themeScript);
})();