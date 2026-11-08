/* ==========================================================================
   max-otto.com — small helper script
   You should not need to edit this file to change any content.
     1. Compact header bar + reading-progress line while scrolling
     2. Highlight the menu item of the section you are looking at
     3. Menu button on small screens
     4. Scroll-in animations (elements with data-animate)
     5. Close the privacy panel on Esc / click outside
   ========================================================================== */

(function () {
  var root = document.documentElement;
  root.classList.add("js");

  /* 1. Compact header ----------------------------------------------------- */
  var SCROLL_THRESHOLD = 40; // pixels scrolled before the bar appears
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    root.classList.toggle("is-scrolled", y > SCROLL_THRESHOLD);
    root.style.setProperty("--scroll-progress", max > 0 ? Math.min(y / max, 1) : 0);
    updateActiveLink();
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);

  /* 2. Active menu item (only for links to sections on the current page) -- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[data-section]"));
  var tracked = navLinks
    .map(function (link) {
      return { link: link, section: document.getElementById(link.dataset.section) };
    })
    .filter(function (item) { return item.section; });

  function updateActiveLink() {
    if (!tracked.length) return;
    var line = window.innerHeight * 0.35;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    var current = tracked[0];
    tracked.forEach(function (item) {
      if (item.section.getBoundingClientRect().top <= line) current = item;
    });
    if (atBottom) current = tracked[tracked.length - 1];
    tracked.forEach(function (item) {
      item.link.classList.toggle("is-active", item === current);
    });
  }

  /* 3. Menu button (small screens) ---------------------------------------- */
  var menuButton = document.querySelector(".menu-button");
  if (menuButton) {
    var setMenu = function (open) {
      root.classList.toggle("menu-open", open);
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    };
    menuButton.addEventListener("click", function () {
      setMenu(!root.classList.contains("menu-open"));
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* 4. Scroll-in animations ----------------------------------------------- */
  var animated = Array.prototype.slice.call(
    document.querySelectorAll("[data-animate], [data-animate-children] > *")
  );
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    animated.forEach(function (el) {
      // anything already on screen when the page opens is shown straight away
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      else observer.observe(el);
    });
  } else {
    animated.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* 5. Privacy panel ------------------------------------------------------ */
  var privacy = document.querySelector(".privacy");
  if (privacy) {
    var closeButton = privacy.querySelector(".privacy-close");
    if (closeButton) closeButton.addEventListener("click", function () { privacy.open = false; });
    document.addEventListener("click", function (e) {
      if (privacy.open && !privacy.contains(e.target)) privacy.open = false;
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") privacy.open = false; });
  }

  onScroll();
})();
