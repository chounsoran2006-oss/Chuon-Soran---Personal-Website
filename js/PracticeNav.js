(function () {
    "use strict";

    document.body.classList.add("practice-page");

    var header = document.querySelector("body > header");
    if (!header || !document.currentScript) return;

    var rootUrl = new URL("../", document.currentScript.src);
    function page(path) { return new URL(path, rootUrl).href; }

    if (!document.querySelector("link[data-practice-theme]")) {
        var themeStyles = document.createElement("link");
        themeStyles.rel = "stylesheet";
        themeStyles.href = page("css/theme.css");
        themeStyles.setAttribute("data-practice-theme", "");
        document.head.appendChild(themeStyles);
    }

    var scoreDisplay = header.querySelector("#scoreDisplay");
    var scorePanel = scoreDisplay && scoreDisplay.closest('[class~="bg-cardBg"]');

    header.className = "w-full bg-[#171b26] border-b border-[#242838] sticky top-0 z-50";
    header.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between gap-4">
                <a href="${page("index.html")}" class="flex items-center gap-3 shrink-0">
                    <img src="https://img.magnific.com/premium-vector/rtl-logo-rtl-letter-rtl-letter-logo-design-initials-rtl-logo-linked-with-circle-uppercase-monogram-logo-rtl-typography-technology-business-real-estate-brand_229120-67750.jpg?semt=ais_hybrid&w=740&q=80"
                        alt="RT Learning Logo" class="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-indigo-500/20">
                    <span class="text-lg sm:text-xl font-bold text-white tracking-tight">RT Learning</span>
                </a>
                <div class="flex items-center gap-3">
                    <nav class="hidden md:flex items-center gap-2 lg:gap-4" aria-label="Main navigation">
                        <a href="${page("index.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">Dashboard</a>
                        <a href="${page("Pages/My course/My course.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">My Course</a>
                        <a href="${page("Pages/Practice Test/practice-test.html")}" aria-current="page" class="bg-[#817dff] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#6c67f0] transition hover:text-white">Practice Tests</a>
                        <a href="${page("Pages/Profile.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">Profile</a>
                        <a href="${page("Pages/Contact.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm">Contact Us</a>
                        <a href="${page("Pages/Logout.html")}" class="text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-[#242838] transition text-sm flex items-center gap-1.5">
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                            Logout
                        </a>
                    </nav>
                    <div data-practice-header-controls class="flex items-center gap-3"></div>
                    <button id="practice-nav-toggle" type="button" class="md:hidden text-gray-300 hover:text-white p-2 rounded-lg focus:outline-none focus:bg-[#242838]" aria-label="Open menu" aria-expanded="false" aria-controls="practice-mobile-menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>
            <nav id="practice-mobile-menu" class="hidden md:hidden mt-4 pt-4 border-t border-[#242838]" aria-label="Mobile navigation">
                <div class="flex flex-col gap-1">
                    <a href="${page("index.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Dashboard</a>
                    <a href="${page("Pages/My course/My course.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">My Course</a>
                    <a href="${page("Pages/Practice Test/practice-test.html")}" aria-current="page" class="bg-[#817dff] text-black px-4 py-2.5 rounded-lg font-semibold text-center hover:bg-[#6c67f0] transition">Practice Tests</a>
                    <a href="${page("Pages/Profile.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Profile</a>
                    <a href="${page("Pages/Contact.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition">Contact Us</a>
                    <a href="${page("Pages/Logout.html")}" class="text-gray-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-[#242838] transition flex items-center gap-2">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                        Logout
                    </a>
                </div>
            </nav>
        </div>`;

    if (scorePanel) header.querySelector("[data-practice-header-controls]").appendChild(scorePanel);

    var menuButton = header.querySelector("#practice-nav-toggle");
    var mobileMenu = header.querySelector("#practice-mobile-menu");
    menuButton.addEventListener("click", function () {
        var isExpanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isExpanded));
        menuButton.setAttribute("aria-label", isExpanded ? "Open menu" : "Close menu");
        mobileMenu.classList.toggle("hidden", isExpanded);
    });
})();