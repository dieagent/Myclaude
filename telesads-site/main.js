/* =========================================================
   TELES ADS — main.js
   GSAP (ScrollTrigger, SplitText, DrawSVG) + Lenis.
   Every animated element starts visible in CSS; hidden start
   states are set here, so the page still works if a CDN fails.
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger && window.SplitText && window.DrawSVGPlugin);
  var lenis = null;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function finishLoading() {
    html.classList.remove("is-loading");
    document.dispatchEvent(new Event("loader:done"));
  }

  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- No GSAP or reduced motion: plain, usable page ---------- */
  if (!hasGSAP || reduce) {
    finishLoading();
    initMenu(false);
    initContact(false);
    initNavState();
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

  /* ---------- Smooth scroll ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ duration: canHover ? 1.4 : 1.0, wheelMultiplier: 0.85, smoothWheel: true });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // Wait for webfonts so SplitText measures lines with the real font.
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var fontTimeout = new Promise(function (r) { setTimeout(r, 2500); });
  Promise.race([fontsReady, fontTimeout]).then(init);

  function init() {
    setupHero();          // hidden states first, played after the loader
    runLoader();
    initDualHeadings();
    initSplitHeadings();
    initStatement();
    initMarquee();
    initServices();
    initProcess();
    initCards();
    initReveals();
    initMagnetic();
    initMenu(true);
    initContact(true);
    initNavState();
    initAnchors();
  }

  /* =========================================================
     LOADER — ribbon draws, letters bounce in, two strokes wipe out
     ========================================================= */
  function runLoader() {
    var loader = $(".loader");
    var done = false;
    function exit() {
      if (done) return; done = true;
      finishLoading();
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    }
    // Never lock the visitor out.
    setTimeout(exit, 6000);

    var ribbon = $(".loader-ribbon path", loader);
    var words = $$(".loader-word", loader);
    var split = SplitText.create(words, { type: "chars" });
    var wipeInk = $(".wipe-ink", loader);
    var wipeAccent = $(".wipe-accent", loader);

    gsap.set([wipeInk, wipeAccent], { drawSVG: "0% 100%", strokeLinecap: "butt" });
    gsap.set(ribbon, { drawSVG: "0%" });
    gsap.set(split.chars, { yPercent: 120, rotation: function () { return gsap.utils.random(-25, 25); }, scale: 0.4, opacity: 0 });

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(ribbon, { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" })
      .to(split.chars, { yPercent: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2.2)", stagger: 0.05 }, "-=0.35")
      .to(ribbon, { drawSVG: "100% 100%", duration: 0.6, ease: "power2.in" }, "+=0.15")
      .to(".loader-logo", { opacity: 0, scale: 0.96, duration: 0.35 }, "+=0.05")
      .to(wipeInk, { drawSVG: "100% 100%", duration: 0.9, ease: "power3.inOut" }, "<")
      .to(wipeAccent, { drawSVG: "100% 100%", duration: 0.9, ease: "power3.inOut" }, "-=0.62")
      .add(exit, "-=0.45");
  }

  /* =========================================================
     HERO — lines rise, pills pop, scribble draws
     ========================================================= */
  var heroTl;
  function setupHero() {
    var pills = $$(".hero-pills .pill");
    pills.forEach(function (p) {
      var r = parseFloat(getComputedStyle(p).getPropertyValue("--r")) || 0;
      gsap.set(p, { rotation: r });
    });
    heroTl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
    heroTl
      .from(".hero-line", { yPercent: 105, rotation: 3, opacity: 0, duration: 1.1, stagger: 0.12 })
      .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.8 }, 0.1)
      .from(".hero-scribble path", { drawSVG: "0%", duration: 1, ease: "power2.inOut" }, 0.55)
      .from(pills, { scale: 0, y: 40, duration: 0.8, ease: "back.out(2)", stagger: 0.09 }, 0.5)
      .from(".hero-foot", { y: 30, opacity: 0, duration: 0.9 }, 0.7);
    document.addEventListener("loader:done", function () { heroTl.play(); }, { once: true });
  }

  /* =========================================================
     DUAL HEADINGS — orange copy behind, drifts away from cursor
     ========================================================= */
  function initDualHeadings() {
    var shadows = [];
    $$(".dual").forEach(function (h) {
      var wrap = document.createElement("div");
      wrap.className = "dual-wrap";
      h.parentNode.insertBefore(wrap, h);
      wrap.appendChild(h);
      var clone = h.cloneNode(true);
      clone.removeAttribute("data-split");
      clone.removeAttribute("id");
      clone.classList.add("dual-shadow");
      clone.setAttribute("aria-hidden", "true");
      wrap.insertBefore(clone, h);
      gsap.set(clone, { opacity: 0 });
      ScrollTrigger.create({
        trigger: wrap, start: "top 75%", once: true,
        onEnter: function () { gsap.to(clone, { opacity: 1, duration: 0.6, delay: 0.6 }); }
      });
      shadows.push({ el: clone, x: gsap.quickTo(clone, "x", { duration: 0.6, ease: "power3" }), y: gsap.quickTo(clone, "y", { duration: 0.6, ease: "power3" }) });
    });
    shadows.forEach(function (s) { s.x(4); s.y(4); });
    if (!canHover || !shadows.length) return;
    window.addEventListener("pointermove", function (e) {
      var nx = (e.clientX / window.innerWidth) * 2 - 1;
      var ny = (e.clientY / window.innerHeight) * 2 - 1;
      var d = Math.min(1, Math.hypot(nx, ny));
      var mag = 1 + 3 * d;                      // 1px at centre, 4px at the edges
      var a = Math.atan2(ny, nx) + Math.PI;     // push away from the cursor
      shadows.forEach(function (s) { s.x(Math.cos(a) * mag); s.y(Math.sin(a) * mag); });
    });
  }

  /* =========================================================
     LINE-BY-LINE HEADINGS
     ========================================================= */
  function initSplitHeadings() {
    $$("[data-split]").forEach(function (h) {
      SplitText.create(h, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 110, rotation: 2, duration: 1, ease: "power4.out", stagger: 0.1,
            scrollTrigger: { trigger: h, start: "top 85%", once: true }
          });
        }
      });
    });
  }

  /* =========================================================
     STATEMENT — words light up as you scroll
     ========================================================= */
  function initStatement() {
    var el = $(".statement-text");
    if (!el) return;
    var split = SplitText.create(el, { type: "words" });
    gsap.fromTo(split.words, { opacity: 0.14 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
    });
  }

  /* =========================================================
     MARQUEE — infinite, reacts to scroll speed and direction
     ========================================================= */
  function initMarquee() {
    var track = $(".marquee-track");
    if (!track) return;
    var base = track.firstElementChild;
    var setW = 0, x = 0, dir = -1;

    function build() {
      while (track.children.length > 1) track.removeChild(track.lastChild);
      setW = base.getBoundingClientRect().width;
      var need = Math.ceil((window.innerWidth * 3) / setW);
      for (var i = 0; i < need; i++) {
        var c = base.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        track.appendChild(c);
      }
    }
    build();
    window.addEventListener("resize", gsap.utils.debounce ? gsap.utils.debounce(build, 200) : build);

    var setX = gsap.quickSetter(track, "x", "px");
    var boost = 0;
    gsap.ticker.add(function (time, delta) {
      var v = lenis ? lenis.velocity : 0;
      if (lenis && lenis.direction) dir = lenis.direction > 0 ? -1 : 1;
      boost += (Math.min(Math.abs(v) * 0.6, 18) - boost) * 0.08;
      var speed = (1.5 + boost) * (delta / 16.67);
      x += speed * dir;
      if (x <= -setW) x += setW;
      if (x > 0) x -= setW;
      setX(x);
    });
  }

  /* =========================================================
     SERVICES — pinned heading, letters tilt + glow, then settle
     ========================================================= */
  function initServices() {
    var title = $(".services-title");
    if (!title) return;
    var split = SplitText.create(title, { type: "words,chars" });
    var pills = $$(".services-pills .pill");
    pills.forEach(function (p) {
      var r = parseFloat(getComputedStyle(p).getPropertyValue("--r")) || 0;
      gsap.set(p, { rotation: r });
    });

    var mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", function () {
      gsap.set(split.chars, { opacity: 0.12 });
      gsap.set(pills, { scale: 0 });
      var tl = gsap.timeline({
        scrollTrigger: { trigger: ".services-pin", start: "top top", end: "+=130%", pin: true, scrub: 0.6, anticipatePin: 1 }
      });
      split.chars.forEach(function (c, i) {
        var t = i * 0.12;
        tl.to(c, { opacity: 1, scale: 1.14, rotation: gsap.utils.random(-5, 5), color: "#ff5c00", textShadow: "0 0 0.35em rgba(255,92,0,0.55)", duration: 0.25, ease: "power2.out" }, t)
          .to(c, { scale: 1, rotation: 0, color: "#0c0c0d", textShadow: "0 0 0em rgba(255,92,0,0)", duration: 0.35, ease: "power2.inOut" }, t + 0.25);
      });
      var total = split.chars.length * 0.12;
      pills.forEach(function (p, i) {
        tl.to(p, { scale: 1, duration: 0.4, ease: "back.out(2.5)" }, total * (0.35 + i * 0.25));
      });
    });
    mm.add("(max-width: 767px)", function () {
      gsap.from(split.chars, {
        yPercent: 80, opacity: 0, rotation: function () { return gsap.utils.random(-12, 12); },
        duration: 0.7, ease: "back.out(2)", stagger: 0.025,
        scrollTrigger: { trigger: title, start: "top 85%", once: true }
      });
      gsap.from(pills, { scale: 0, duration: 0.6, ease: "back.out(2.5)", stagger: 0.1, scrollTrigger: { trigger: ".services-pills", start: "top 90%", once: true } });
    });

    ScrollTrigger.batch(".service", {
      start: "top 88%", once: true,
      onEnter: function (els) { gsap.from(els, { y: 60, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }); }
    });
  }

  /* =========================================================
     PROCESS — the line draws as you scroll
     ========================================================= */
  function initProcess() {
    var line = $(".process-line path");
    if (line) {
      gsap.from(line, { drawSVG: "0%", ease: "none", scrollTrigger: { trigger: ".process-steps", start: "top 80%", end: "bottom 60%", scrub: true } });
    }
    gsap.from(".step", {
      y: 50, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".process-steps", start: "top 80%", once: true }
    });
    gsap.from(".step-n", {
      scale: 0, duration: 0.7, ease: "back.out(2.5)", stagger: 0.12,
      scrollTrigger: { trigger: ".process-steps", start: "top 80%", once: true }
    });
  }

  /* =========================================================
     SECTOR CARDS — clip-mask grows from the centre, 3D tilt settles
     ========================================================= */
  function initCards() {
    var cards = $$(".card");
    cards.forEach(function (card) {
      var mask = document.createElement("div");
      mask.className = "card-mask";
      card.parentNode.insertBefore(mask, card);
      mask.appendChild(card);
      gsap.set(mask, { clipPath: "inset(42.5% 42.5% 42.5% 42.5% round 36px)" });
      gsap.set(card, { scale: 1.4, rotationX: 22, rotationY: -10, transformPerspective: 1200 });
    });
    ScrollTrigger.batch(".card-mask", {
      start: "top 92%", once: true,
      onEnter: function (masks) {
        gsap.to(masks, { clipPath: "inset(0% 0% 0% 0% round 20px)", duration: 1.25, ease: "power3.out", stagger: 0.1 });
        gsap.to(masks.map(function (m) { return m.firstElementChild; }), { scale: 1, rotationX: 0, rotationY: 0, duration: 1.25, ease: "power3.out", stagger: 0.1 });
      }
    });
  }

  /* =========================================================
     GENERIC REVEALS
     ========================================================= */
  function initReveals() {
    var groups = [".process-intro", ".sectors-intro", ".work-intro", ".work-list li", ".principle", ".faq details", ".footer-top > *", ".statement .label", ".section-title + p"];
    ScrollTrigger.batch(groups.join(","), {
      start: "top 90%", once: true,
      onEnter: function (els) { gsap.from(els, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, overwrite: true }); }
    });
    // Ensure anything already in view at load is revealed once the loader ends.
    document.addEventListener("loader:done", function () { ScrollTrigger.refresh(); }, { once: true });
  }

  /* =========================================================
     MAGNETIC BUTTONS — follow cursor, fill expands, spring back
     ========================================================= */
  function initMagnetic() {
    if (!canHover) return;
    $$(".magnetic").forEach(function (btn) {
      var fill = $(".btn-fill", btn), text = $(".btn-text", btn), arrow = $(".btn-arrow", btn);
      var bx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
      var by = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
      var tx = gsap.quickTo([text, arrow], "x", { duration: 0.5, ease: "power3" });
      var ty = gsap.quickTo([text, arrow], "y", { duration: 0.5, ease: "power3" });
      var rect = null;

      btn.addEventListener("mouseenter", function () {
        rect = btn.getBoundingClientRect();
        var fr = fill.getBoundingClientRect().width || 19;
        var cover = (Math.hypot(rect.width, rect.height) / fr) * 1.15;
        gsap.to(fill, { scale: cover, duration: 0.55, ease: "power3.out" });
        gsap.fromTo(arrow, { rotation: 0 }, { rotation: 45, duration: 0.6, ease: "back.out(3)" });
      });
      btn.addEventListener("mousemove", function (e) {
        if (!rect) rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2 - (gsap.getProperty(btn, "x") || 0);
        var cy = rect.top + rect.height / 2 - (gsap.getProperty(btn, "y") || 0);
        var dx = e.clientX - cx, dy = e.clientY - cy;
        bx(dx * 0.3); by(dy * 0.4);
        tx(dx * 0.12); ty(dy * 0.12);
      });
      btn.addEventListener("mouseleave", function () {
        rect = null;
        gsap.to(btn, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
        gsap.to([text, arrow], { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
        gsap.to(fill, { scale: 0, duration: 0.45, ease: "power3.inOut" });
        gsap.to(arrow, { rotation: 0, duration: 0.5, ease: "power3.out" });
      });
    });
  }

  /* =========================================================
     MOBILE MENU
     ========================================================= */
  function initMenu(animated) {
    var toggle = $(".menu-toggle"), menu = $("#menu");
    if (!toggle || !menu) return;
    var open = false;
    function set(state) {
      open = state;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        menu.hidden = false;
        if (lenis) lenis.stop();
        if (animated) {
          gsap.fromTo(menu, { clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }, { clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)", duration: 0.8, ease: "power3.inOut" });
          gsap.fromTo($$(".menu-links a, .menu .btn", menu), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.06, delay: 0.25 });
        }
      } else {
        var hide = function () { menu.hidden = true; if (lenis) lenis.start(); };
        if (animated) gsap.to(menu, { clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)", duration: 0.6, ease: "power3.inOut", onComplete: hide });
        else hide();
      }
    }
    toggle.addEventListener("click", function () { set(!open); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { if (open) set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) set(false); });
    document.addEventListener("contact:open", function () { if (open) set(false); });
  }

  /* =========================================================
     CONTACT MODAL — stroke wipe in, content pops, kinetic links
     ========================================================= */
  function initContact(animated) {
    var modal = $(".contact");
    if (!modal) return;
    var wipe = $(".contact-wipe path", modal);
    var closeBtn = $(".contact-close", modal);
    var items = $$(".contact-title, .contact-copy, .contact-h, .contact-link, .contact-pills .pill, .contact-close", modal);
    var lastFocus = null, isOpen = false, tl = null;

    if (animated) {
      $$(".contact-link", modal).forEach(function (link) {
        var s = SplitText.create(link, { type: "chars", charsClass: "ch" });
        link.addEventListener("mouseenter", function () {
          gsap.to(s.chars, {
            keyframes: [
              { y: -14, rotation: function () { return gsap.utils.random(-14, 14); }, scale: 1.2, duration: 0.18, ease: "power2.out" },
              { y: 0, rotation: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
            ],
            stagger: 0.02, overwrite: true
          });
        });
      });
    } else {
      modal.style.background = "var(--accent)";
    }

    function open() {
      if (isOpen) return; isOpen = true;
      document.dispatchEvent(new Event("contact:open"));
      lastFocus = document.activeElement;
      modal.hidden = false;
      if (lenis) lenis.stop(); else document.body.style.overflow = "hidden";
      if (animated) {
        if (tl) tl.kill();
        tl = gsap.timeline();
        tl.fromTo(wipe, { drawSVG: "0%", strokeWidth: 0 }, { drawSVG: "100%", strokeWidth: 1600, duration: 0.9, ease: "power3.inOut" })
          .fromTo(items, { y: 60, opacity: 0, rotation: function () { return gsap.utils.random(-4, 4); } }, { y: 0, opacity: 1, rotation: 0, duration: 0.7, ease: "back.out(1.6)", stagger: 0.05 }, "-=0.35");
      }
      setTimeout(function () { closeBtn.focus(); }, animated ? 500 : 0);
    }
    function close() {
      if (!isOpen) return; isOpen = false;
      var done = function () {
        modal.hidden = true;
        if (lenis) lenis.start(); else document.body.style.overflow = "";
        if (lastFocus) lastFocus.focus();
      };
      if (!animated) return done();
      if (tl) tl.kill();
      tl = gsap.timeline({ onComplete: done });
      tl.to(items, { opacity: 0, y: -20, duration: 0.3, stagger: 0.015, ease: "power2.in" })
        .to(wipe, { drawSVG: "100% 100%", duration: 0.75, ease: "power3.inOut" }, "-=0.1");
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest(".cta-btn")) { e.preventDefault(); open(); }
    });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") { // keep focus inside the dialog
        var f = $$("a, button", modal);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Nav background after scrolling ---------- */
  function initNavState() {
    var nav = $(".nav");
    function update() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Smooth anchor links ---------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = $(id);
        if (!target || !lenis) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === "#top" ? 0 : -70, duration: 1.4 });
      });
    });
  }
})();
