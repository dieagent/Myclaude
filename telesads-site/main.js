/* =========================================================
   TELES ADS — main.js
   GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG) + Lenis.
   Hidden start states are set here, never in CSS, so the page
   still works if a CDN fails or motion is reduced.
   ========================================================= */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger && window.SplitText && window.DrawSVGPlugin);
  var animated = hasGSAP && !reduce;
  var lenis = null;
  var loaderDone = false;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function isMobile() { return window.innerWidth < 768; }
  function finishLoading() {
    if (loaderDone) return;
    loaderDone = true;
    html.classList.remove("is-loading");
    document.dispatchEvent(new Event("loader:done"));
  }
  function onLoaderDone(fn) {
    if (loaderDone) fn(); else document.addEventListener("loader:done", fn, { once: true });
  }

  html.classList.add("js");
  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Services path data (viewBox 0 0 1000 2400) ---------- */
  var SERVICE_PATH =
    "M1040 60 C880 30 700 60 620 160 C540 260 640 360 560 380 C480 400 470 300 540 300 " +
    "C640 300 640 470 500 560 C360 650 180 640 200 780 C220 900 520 860 700 900 " +
    "C880 940 900 1080 760 1120 C640 1150 520 1120 480 1220 C440 1320 600 1360 560 1280 " +
    "C520 1200 380 1300 330 1420 C280 1540 420 1600 600 1620 C780 1640 860 1720 800 1840 " +
    "C740 1960 560 1900 470 2000 C380 2100 460 2200 380 2260 C300 2320 120 2320 -40 2400";
  $$(".services-path path").forEach(function (p) { p.setAttribute("d", SERVICE_PATH); });
  placeServices();
  window.addEventListener("resize", debounce(function () { placeServices(); if (hasGSAP) ScrollTrigger.refresh(); }, 200));

  if (!animated) {
    finishLoading();
    initMenu(false);
    initContact(false);
    initFaq(false);
    initDeck(false);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

  /* ---------- Smooth scroll ---------- */
  if (window.Lenis) {
    lenis = new Lenis({ duration: canHover ? 1.5 : 1.0, wheelMultiplier: 0.85, smoothWheel: true });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 2500); })]).then(function () {
    placeServices();
    setupHero();
    runLoader();
    initRibbon();
    initAbout();
    initDualHeadings();
    initSplitHeadings();
    initProjects();
    initProjectsEnd();
    initServices();
    initDeck(true);
    initFaq(true);
    initFooter();
    initKineticLinks();
    initMagnetic();
    initMenu(true);
    initContact(true);
    initAnchors();
  });

  /* =========================================================
     LOADER — trail draws, letters pop, pink then orange strokes
     slither out of the viewport to reveal the page
     ========================================================= */
  function runLoader() {
    var loader = $(".loader");
    var exited = false;
    function exit() {
      if (exited) return; exited = true;
      finishLoading();
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    }
    setTimeout(exit, 6000);   // hard safety: never lock the visitor out

    var trail = $(".loader-trail", loader);
    var word = $(".loader-word", loader);
    var split = SplitText.create(word, { type: "chars", charsClass: "ch" });
    var pink = $(".wipe-pink", loader), orange = $(".wipe-orange", loader);

    gsap.set([pink, orange], { drawSVG: "0% 100%" });
    gsap.set(trail, { drawSVG: "0%" });
    gsap.set(split.chars, { scale: 0, yPercent: 40, rotation: function () { return gsap.utils.random(-30, 30); }, transformOrigin: "50% 80%" });

    var tl = gsap.timeline();
    tl.to(trail, { drawSVG: "100%", duration: 0.75, ease: "power2.inOut" })
      .to(split.chars, { scale: 1, yPercent: 0, rotation: 0, duration: 0.6, ease: "back.out(3)", stagger: 0.045 }, "-=0.3")
      .to(trail, { drawSVG: "100% 100%", duration: 0.5, ease: "power2.in" }, "+=0.2")
      .add("wipe", "+=0.1")
      .to(pink, { drawSVG: "100% 100%", duration: 0.85, ease: "power3.inOut" }, "wipe")
      .to(".loader-logo", { opacity: 0, duration: 0.25 }, "wipe+=0.2")
      .to(orange, { drawSVG: "100% 100%", duration: 0.85, ease: "power3.inOut" }, "wipe+=0.22")
      .add(exit, "wipe+=0.55");
  }

  /* =========================================================
     HERO — lines rise, pills pop with masked text, swirls draw,
     illustration pops in then floats
     ========================================================= */
  function setupHero() {
    var lines = $$(".hero-line");
    var splits = lines.map(function (l) { return SplitText.create(l, { type: "lines", mask: "lines" }); });
    var pills = $$(".hero-pills .pill");
    pills.forEach(wrapPillText);
    var swirls = $$(".hero-swirl path");
    var arts = $$(".hero-art .art, .hero-art .art-plus");
    var trail = $(".art-trail");
    var sparks = $$(".spark");

    splits.forEach(function (s) { gsap.set(s.lines, { yPercent: 105 }); });
    pills.forEach(function (p) { gsap.set(p, { rotation: readRot(p), scale: 0, y: 30 }); gsap.set($(".pill-mask > span", p), { yPercent: 105 }); });
    gsap.set(swirls, { drawSVG: "0%", strokeWidth: 0 });
    gsap.set(arts, { scale: 0, transformOrigin: "50% 100%", transformBox: "fill-box" });
    gsap.set(trail, { opacity: 0 });
    gsap.set(sparks, { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });

    var tl = gsap.timeline({ paused: true });
    splits.forEach(function (s, i) {
      tl.to(s.lines, { yPercent: 0, duration: 1.1, ease: "power4.out" }, i * 0.12);
    });
    pills.forEach(function (p, i) {
      var t = 0.45 + i * 0.12;
      tl.to(p, { scale: 1, y: 0, duration: 0.75, ease: "back.out(2.2)" }, t)
        .to($(".pill-mask > span", p), { yPercent: 0, duration: 0.6, ease: "power3.out" }, t + 0.18);
    });
    tl.to(swirls, { drawSVG: "100%", strokeWidth: function (i, el) { return isMobile() ? 20 : 26; }, duration: 1.4, ease: "power2.inOut", stagger: 0.1 }, 0.2)
      .to(arts, { scale: 1, duration: 0.9, ease: "back.out(1.8)", stagger: 0.12 }, 0.5)
      .to(trail, { opacity: 1, duration: 0.4 }, 1)
      .to(sparks, { scale: 1, duration: 0.6, ease: "back.out(3)", stagger: 0.1 }, 1.1)
      .add(idle, 1.6);

    function idle() {
      gsap.to(".art-plane", { y: -14, rotation: 3, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".art-phone", { y: 8, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".art-mega", { rotation: -3, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".art-plus", { scale: 1.12, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".art-mega .sl", { opacity: 0.2, duration: 0.5, stagger: 0.15, yoyo: true, repeat: -1 });
      gsap.to(trail, { strokeDashoffset: -44, duration: 1.2, ease: "none", repeat: -1 });
      gsap.to(sparks, { scale: 0.6, rotation: 45, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.3 });
    }
    onLoaderDone(function () { tl.play(); });
  }

  /* =========================================================
     RIBBON — orange stroke draws in, text loops along the curve
     ========================================================= */
  function initRibbon() {
    var bg = $(".ribbon-bg"), mask = $(".ribbon-mask-path"), tp = $(".ribbon-tp"), unit = $(".ribbon-unit");
    var group = $(".ribbon-text-group");
    if (!bg || !tp) return;
    gsap.set([bg, mask], { drawSVG: "100% 100%" });
    var len = unit ? unit.getComputedTextLength() : 1600;
    gsap.to(tp, { attr: { startOffset: -len }, duration: len / 75, ease: "none", repeat: -1 });
    gsap.to([bg, mask], {
      drawSVG: "0% 100%", duration: 1.3, ease: "power2.out",
      scrollTrigger: { trigger: ".ribbon", start: "top 85%", once: true },
      onComplete: function () { group.removeAttribute("mask"); }
    });
  }

  /* =========================================================
     ABOUT — pinned; characters sweep pale → orange → ink,
     pills pop at milestones
     ========================================================= */
  function initAbout() {
    var text = $(".about-text");
    if (!text) return;
    var split = SplitText.create(text, { type: "words,chars", charsClass: "ch" });
    var chars = split.chars;
    var pills = $$(".about-pill");
    pills.forEach(function (p) { wrapPillText(p); gsap.set(p, { rotation: readRot(p), scale: 0 }); });
    gsap.set(chars, { color: "#F8B996" });

    var tl = gsap.timeline({
      scrollTrigger: { trigger: ".about-pin", start: "top top", end: function () { return "+=" + window.innerHeight * (isMobile() ? 1.4 : 1.8); }, pin: true, scrub: 0.8, anticipatePin: 1 }
    });
    var step = 0.04;
    chars.forEach(function (c, i) {
      tl.to(c, { color: "#FF5C00", scale: 1.08, duration: 0.12, ease: "power2.out" }, i * step)
        .to(c, { color: "#0C0C0D", scale: 1, duration: 0.2, ease: "power2.inOut" }, i * step + 0.12);
    });
    var total = chars.length * step;
    pills.forEach(function (p, i) {
      tl.to(p, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, total * (0.2 + i * 0.3));
    });
  }

  /* =========================================================
     DUAL HEADINGS — orange copy behind, drifts 1–4px from cursor
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
      clone.classList.add("dual-shadow");
      clone.setAttribute("aria-hidden", "true");
      wrap.insertBefore(clone, h);
      gsap.set(clone, { opacity: 0 });
      ScrollTrigger.create({ trigger: wrap, start: "top 80%", once: true, onEnter: function () { gsap.to(clone, { opacity: 1, duration: 0.5, delay: 0.8 }); } });
      shadows.push({ x: gsap.quickTo(clone, "x", { duration: 0.6, ease: "power3" }), y: gsap.quickTo(clone, "y", { duration: 0.6, ease: "power3" }) });
    });
    shadows.forEach(function (s) { s.x(3); s.y(3); });
    if (!canHover) return;
    window.addEventListener("pointermove", function (e) {
      var nx = (e.clientX / window.innerWidth) * 2 - 1, ny = (e.clientY / window.innerHeight) * 2 - 1;
      var mag = 1 + 3 * Math.min(1, Math.hypot(nx, ny));
      var a = Math.atan2(ny, nx) + Math.PI;
      shadows.forEach(function (s) { s.x(Math.cos(a) * mag); s.y(Math.sin(a) * mag); });
    });
  }

  /* ---------- Line-by-line heading reveals ---------- */
  function initSplitHeadings() {
    $$("[data-split]").forEach(function (h) {
      if (h.classList.contains("footer-title")) return;
      SplitText.create(h, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 110, duration: 1, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: h, start: "top 85%", once: true } });
        }
      });
    });
  }

  /* =========================================================
     PROJECTS — clip mask grows from 15% with 3D tilt; hover draws
     a brush stroke then reveals a colour panel through a mask
     ========================================================= */
  function initProjects() {
    var cards = $$(".project");
    cards.forEach(function (card) {
      var media = $(".project-media", card);
      var mask = document.createElement("div");
      mask.className = "project-mask";
      media.parentNode.insertBefore(mask, media);
      mask.appendChild(media);
      gsap.set(mask, { clipPath: "inset(42.5% 42.5% 42.5% 42.5% round 36px)" });
      gsap.set(media, { scale: 1.45, rotationX: 18, rotationY: -12, transformPerspective: 1200 });
      gsap.set($(".project-meta", card), { opacity: 0, y: 20 });

      var pf = $(".pf-path", card), pm = $(".pm-path", card), label = $(".project-hover", card), arrow = $(".project-arrow", card);
      gsap.set([pf, pm], { drawSVG: "0%" });
      var hover = gsap.timeline({ paused: true });
      hover.to(pf, { drawSVG: "100%", duration: 0.45, ease: "power2.in" })
        .to(pm, { drawSVG: "100%", duration: 0.55, ease: "power2.out" }, "-=0.15")
        .to(pf, { opacity: 0, duration: 0.2 }, "-=0.2")
        .to(label, { opacity: 1, y: 0, duration: 0.3 }, "-=0.25");
      gsap.set(label, { y: 20 });
      if (canHover) {
        card.addEventListener("mouseenter", function () {
          hover.timeScale(1).play();
          gsap.fromTo(arrow, { rotation: 0 }, { rotation: -45, duration: 0.25, ease: "power2.out", onComplete: function () { gsap.to(arrow, { rotation: 0, duration: 0.9, ease: "elastic.out(1.2, 0.3)" }); } });
        });
        card.addEventListener("mouseleave", function () { hover.timeScale(2).reverse(); });
      }
    });
    ScrollTrigger.batch(".project-mask", {
      start: "top 90%", once: true,
      onEnter: function (masks) {
        gsap.to(masks, { clipPath: "inset(0% 0% 0% 0% round 20px)", duration: 1.25, ease: "power3.out", stagger: 0.12 });
        gsap.to(masks.map(function (m) { return m.firstElementChild; }), { scale: 1, rotationX: 0, rotationY: 0, duration: 1.25, ease: "power3.out", stagger: 0.12 });
        gsap.to(masks.map(function (m) { return $(".project-meta", m.parentNode); }), { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5, stagger: 0.12 });
      }
    });
  }

  function initProjectsEnd() {
    var end = $(".projects-end");
    if (!end) return;
    var title = $(".projects-end-title", end);
    var split = SplitText.create(title, { type: "lines", mask: "lines" });
    var pills = $$(".pe-pill", end);
    var btn = $(".talk", end);
    pills.forEach(function (p) { wrapPillText(p); gsap.set(p, { rotation: readRot(p), scale: 0 }); });
    gsap.set(split.lines, { yPercent: 110 });
    gsap.set(btn, { scale: 0 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: end, start: "top 75%", once: true } });
    tl.to(split.lines, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.12 })
      .to(pills, { scale: 1, duration: 0.6, ease: "back.out(2.5)", stagger: 0.12 }, 0.5)
      .to(btn, { scale: 1, duration: 0.6, ease: "back.out(2.5)" }, 0.8);
  }

  /* =========================================================
     SERVICES — the line draws as you scroll; each service's icon
     expands from zero width (pushing the words apart) and its
     description bubble pops in when the line reaches it
     ========================================================= */
  function initServices() {
    var dark = $(".sp-dark");
    var layers = $$(".service");
    gsap.set(dark, { drawSVG: "0%" });
    layers.forEach(function (li) {
      var icon = $(".service-svg", li), para = $(".service-para", li);
      icon.dataset.w = icon.getBoundingClientRect().width;
      gsap.set(icon, { width: 0, scale: 0, opacity: 0 });
      gsap.set(para, { scale: 0, rotation: 0, opacity: 0, transformOrigin: "20% 0%" });
    });
    var tl = gsap.timeline({
      scrollTrigger: { trigger: ".services-stage", start: "top 70%", end: "bottom 70%", scrub: 1.2, invalidateOnRefresh: true }
    });
    tl.to(dark, { drawSVG: "100%", ease: "none", duration: 1 }, 0);
    var n = layers.length;
    layers.forEach(function (li, i) {
      var icon = $(".service-svg", li), para = $(".service-para", li);
      var t = Math.max(0, (i + 0.5) / n - 0.04);
      tl.to(icon, { width: function () { return parseFloat(icon.dataset.w) || 60; }, scale: 1, opacity: 1, duration: 0.14, ease: "back.out(3.5)" }, t)
        .to(para, { scale: 1, rotation: -5, opacity: 1, duration: 0.14, ease: "back.out(3.5)" }, t + 0.02);
    });
  }

  /* Position each service on the path at an even share of its length. */
  function placeServices() {
    var stage = $(".services-stage"), path = $(".sp-dark");
    if (!stage || !path || !path.getTotalLength) return;
    var layers = $$(".service");
    var W = stage.clientWidth, H = stage.clientHeight;
    var L = path.getTotalLength();
    var g = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.25;
    layers.forEach(function (li, i) {
      var pt = path.getPointAtLength(L * (i + 0.5) / layers.length);
      var x = pt.x / 1000 * W, y = pt.y / 2400 * H;
      var block = $(".service-block", li), para = $(".service-para", li);
      var icon = $(".service-svg", li);
      var bw = block.scrollWidth + (icon && icon.style.width === "0px" ? parseFloat(icon.dataset.w || 0) : 0);
      var pw = para ? para.offsetWidth : 0;
      var left = bw / 2 + g;
      var right = W - Math.max(bw / 2, bw * 0.05 + pw * (isMobile() ? 0.65 : 1)) - g;
      x = Math.min(Math.max(x, left), Math.max(left, right));
      li.style.left = x + "px";
      li.style.top = y + "px";
    });
  }

  /* =========================================================
     PRINCIPLES DECK — stacked, tilted cards; the top card flies
     up and slides back under the pile
     ========================================================= */
  function initDeck(anim) {
    var panel = $(".deck-panel"), deck = $(".deck");
    if (!deck) return;
    var cards = $$(".deck-card", deck);
    var ticksWrap = $(".deck-ticks");
    var rots = [0, -5, 6, -9, 4, -3];
    var order = cards.map(function (_, i) { return i; });
    var busy = false;

    var ticks = cards.map(function (c, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-label", "Card " + (i + 1));
      b.addEventListener("click", function (e) { e.stopPropagation(); goTo(i); });
      ticksWrap.appendChild(b);
      return b;
    });

    function layout(instant) {
      order.forEach(function (ci, pos) {
        var c = cards[ci];
        c.style.zIndex = String(cards.length - pos);
        c.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
        var r = rots[pos % rots.length];
        if (anim && !instant) gsap.to(c, { rotation: r, y: 0, duration: 0.6, ease: "power3.out" });
        else if (anim) gsap.set(c, { rotation: r, y: 0 });
        else c.style.transform = "rotate(" + r + "deg)";
      });
      ticks.forEach(function (t, i) { t.setAttribute("aria-selected", String(i === order[0])); });
    }

    function next() {
      if (busy) return;
      var top = cards[order[0]];
      if (!anim) { order.push(order.shift()); layout(true); return; }
      busy = true;
      gsap.timeline({ onComplete: function () { busy = false; } })
        .to(top, { yPercent: -115, rotation: gsap.utils.random(-12, 12), duration: 0.45, ease: "power2.in" })
        .add(function () { order.push(order.shift()); layout(); top.style.zIndex = "0"; })
        .to(top, { yPercent: 0, duration: 0.6, ease: "power3.out" });
    }
    function prev() {
      if (busy) return;
      var bottom = cards[order[order.length - 1]];
      if (!anim) { order.unshift(order.pop()); layout(true); return; }
      busy = true;
      gsap.timeline({ onComplete: function () { busy = false; } })
        .to(bottom, { yPercent: 115, rotation: gsap.utils.random(-12, 12), duration: 0.45, ease: "power2.in" })
        .add(function () { order.unshift(order.pop()); layout(); bottom.style.zIndex = String(cards.length + 1); })
        .to(bottom, { yPercent: 0, rotation: 0, duration: 0.6, ease: "power3.out" });
    }
    function goTo(i) {
      if (order[0] === i || busy) return;
      var target = cards[i];
      if (!anim) { order.splice(order.indexOf(i), 1); order.unshift(i); layout(true); return; }
      busy = true;
      gsap.timeline({ onComplete: function () { busy = false; } })
        .to(target, { yPercent: 115, duration: 0.4, ease: "power2.in" })
        .add(function () { order.splice(order.indexOf(i), 1); order.unshift(i); layout(); target.style.zIndex = String(cards.length + 1); })
        .to(target, { yPercent: 0, rotation: 0, duration: 0.6, ease: "power3.out" });
    }

    layout(true);
    panel.addEventListener("click", function (e) { if (!e.target.closest("a")) next(); });
    $(".deck-next").addEventListener("click", function (e) { e.stopPropagation(); next(); });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    });
    var sy = null;
    panel.addEventListener("touchstart", function (e) { sy = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener("touchend", function (e) {
      if (sy === null) return;
      var dy = e.changedTouches[0].clientY - sy; sy = null;
      if (Math.abs(dy) > 30) { dy < 0 ? next() : prev(); }
    });

    if (anim) {
      gsap.from(cards, { y: 120, opacity: 0, rotation: 0, duration: 1, ease: "back.out(1.4)", stagger: 0.08, scrollTrigger: { trigger: panel, start: "top 75%", once: true }, onComplete: function () { layout(); } });
      gsap.from(".deck-next", { scale: 0, duration: 0.6, ease: "back.out(3)", scrollTrigger: { trigger: panel, start: "top 85%", once: true } });
    }
  }

  /* =========================================================
     FAQ — chat bubbles. Question shrinks and gets an outline,
     the answer bubble grows from the bottom-right with the logo.
     One item is always open.
     ========================================================= */
  function initFaq(anim) {
    var items = $$(".faq-item");
    var active = null;
    function openW() { return window.innerWidth < 992 ? "75%" : "50%"; }

    function open(item, instant) {
      var q = $(".faq-q-btn", item), a = $(".faq-a", item), p = $("p", a), logo = $(".faq-logo", a);
      item.classList.add("is-open");
      q.setAttribute("aria-expanded", "true");
      if (!anim) { a.style.height = "auto"; return; }
      var d = instant ? 0 : 1;
      gsap.timeline()
        .to(q, { width: openW(), duration: 0.5 * d, ease: "power3.inOut" })
        .to(a, { height: "auto", duration: 0.5 * d, ease: "power3.out" }, 0.1 * d)
        .fromTo(p, { scale: 0 }, { scale: 1, duration: 0.6 * d, ease: "back.out(1.6)" }, 0.1 * d)
        .fromTo(logo, { scale: 0 }, { scale: 1, duration: 0.5 * d, ease: "back.out(3)" }, 0.3 * d)
        .fromTo(p, { color: "rgba(12,12,13,0)" }, { color: "rgba(12,12,13,1)", duration: 0.4 * d }, 0.45 * d);
    }
    function close(item) {
      var q = $(".faq-q-btn", item), a = $(".faq-a", item), p = $("p", a), logo = $(".faq-logo", a);
      item.classList.remove("is-open");
      q.setAttribute("aria-expanded", "false");
      if (!anim) { a.style.height = "0px"; return; }
      gsap.timeline()
        .to(p, { color: "rgba(12,12,13,0)", duration: 0.15 })
        .to([p, logo], { scale: 0, duration: 0.35, ease: "power3.in" }, 0.1)
        .to(a, { height: 0, duration: 0.4, ease: "power3.inOut" }, 0.2)
        .to(q, { width: "100%", duration: 0.45, ease: "power3.inOut" }, 0.25);
    }

    items.forEach(function (item, i) {
      var q = $(".faq-q-btn", item);
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", function () {
        if (active === item) return;           // one always stays open
        if (active) close(active);
        open(item); active = item;
      });
    });
    if (items[0]) { open(items[0], true); active = items[0]; }
    window.addEventListener("resize", debounce(function () { if (active && anim) gsap.set($(".faq-q-btn", active), { width: openW() }); }, 150));

    if (anim) {
      ScrollTrigger.batch(".faq-item", { start: "top 92%", once: true, onEnter: function (els) { gsap.from(els, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }); } });
      gsap.from(".faq-art .faq-bot", { y: 80, opacity: 0, duration: 1, ease: "back.out(1.6)", scrollTrigger: { trigger: ".faq-art", start: "top 90%", once: true } });
      gsap.from(".faq-art .faq-q", { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box", duration: 0.7, ease: "back.out(3)", stagger: 0.15, delay: 0.4, scrollTrigger: { trigger: ".faq-art", start: "top 90%", once: true } });
      gsap.to(".faq-art .faq-q", { y: -10, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.4 });
      gsap.to(".faq-art .eye", { scaleY: 0.1, duration: 0.12, yoyo: true, repeat: -1, repeatDelay: 2.6 });
    }
  }

  /* =========================================================
     FOOTER — heading bounces up line by line; the giant wordmark
     stretches with scroll and springs back at the bottom
     ========================================================= */
  function initFooter() {
    var title = $(".footer-title");
    if (title) {
      var s = SplitText.create(title, { type: "lines", mask: "lines" });
      gsap.from(s.lines, { yPercent: 110, duration: 1.1, ease: "back.out(1.6)", stagger: 0.12, scrollTrigger: { trigger: ".footer", start: "top 70%", once: true } });
    }
    var mark = $(".footer-mark");
    if (!mark) return;
    gsap.set(mark, { scaleY: 0.15 });
    var setY = gsap.quickTo(mark, "scaleY", { duration: 0.5, ease: "power3" });
    var settled = false;
    ScrollTrigger.create({
      trigger: ".footer", start: "top bottom", end: "bottom bottom",
      onUpdate: function (self) {
        if (self.progress > 0.985) {
          if (!settled) { settled = true; gsap.to(mark, { scaleY: 1, duration: 1.4, ease: "elastic.out(1, 0.3)", overwrite: true }); }
          return;
        }
        if (settled && self.progress > 0.9) return;
        settled = false;
        setY(0.15 + 1.2 * self.progress);
      }
    });
  }

  /* ---------- Kinetic letter hover (footer and contact links) ---------- */
  function initKineticLinks() {
    if (!canHover) return;
    $$(".f-link, .contact-link").forEach(function (link) {
      var s = SplitText.create(link, { type: "chars", charsClass: "ch" });
      link.addEventListener("mouseenter", function () {
        gsap.to(s.chars, {
          keyframes: [
            { y: -6, rotation: function () { return gsap.utils.random(-14, 14); }, scale: 1.18, duration: 0.18, ease: "power2.out" },
            { y: 0, rotation: 0, scale: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" }
          ],
          stagger: 0.02, overwrite: true
        });
      });
    });
  }

  /* =========================================================
     MAGNETIC "LET'S TALK" — orange fill grows from the dot,
     button follows the cursor, springs back on leave
     ========================================================= */
  function initMagnetic() {
    if (!canHover) return;
    $$(".magnetic").forEach(function (btn) {
      var fill = $(".talk-fill", btn), dot = $(".talk-dot svg", btn), text = $(".talk-text", btn);
      var bx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" }), by = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
      var tx = gsap.quickTo(text, "x", { duration: 0.5, ease: "power3" }), ty = gsap.quickTo(text, "y", { duration: 0.5, ease: "power3" });
      var rect = null, loop = null;
      btn.addEventListener("mouseenter", function () {
        rect = btn.getBoundingClientRect();
        gsap.to(fill, { scale: (rect.width / fill.offsetWidth) * 2.4, duration: 0.55, ease: "power3.out" });
        loop = gsap.timeline({ repeat: -1, repeatDelay: 0.3 })
          .to(dot, { rotation: 45, duration: 0.35, ease: "back.out(3)" })
          .to(dot, { rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }, "+=0.2");
      });
      btn.addEventListener("mousemove", function (e) {
        if (!rect) rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2 - (gsap.getProperty(btn, "x") || 0);
        var cy = rect.top + rect.height / 2 - (gsap.getProperty(btn, "y") || 0);
        var dx = e.clientX - cx, dy = e.clientY - cy;
        bx(dx * 0.3); by(dy * 0.45); tx(dx * 0.1); ty(dy * 0.1);
      });
      btn.addEventListener("mouseleave", function () {
        rect = null;
        if (loop) { loop.kill(); loop = null; }
        gsap.to(dot, { rotation: 0, duration: 0.4 });
        gsap.to([btn, text], { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)", overwrite: "auto" });
        gsap.to(fill, { scale: 0, duration: 0.45, ease: "power3.inOut" });
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMenu(anim) {
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
        if (anim) {
          gsap.fromTo(menu, { clipPath: "circle(0% at 95% 3%)" }, { clipPath: "circle(150% at 95% 3%)", duration: 0.8, ease: "power3.inOut" });
          gsap.fromTo($$(".menu-links a, .menu .talk", menu), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.06, delay: 0.25 });
        }
      } else {
        var hide = function () { menu.hidden = true; if (lenis) lenis.start(); };
        if (anim) gsap.to(menu, { clipPath: "circle(0% at 95% 3%)", duration: 0.6, ease: "power3.inOut", onComplete: hide });
        else hide();
      }
    }
    toggle.addEventListener("click", function () { set(!open); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { if (open) set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) set(false); });
    document.addEventListener("contact:open", function () { if (open) set(false); });
  }

  /* =========================================================
     CONTACT OVERLAY — orange stroke expands to fill the screen,
     then the content pops in; Esc / Close reverses it
     ========================================================= */
  function initContact(anim) {
    var modal = $(".contact");
    if (!modal) return;
    var wipe = $(".contact-wipe path", modal), closeBtn = $(".contact-close", modal);
    var items = $$(".contact-logo, .contact-close, .contact-title, .contact-copy, .contact-h, .contact-link, .contact-pills .pill, .contact-art", modal);
    var lastFocus = null, isOpen = false, tl = null;
    if (!anim) modal.style.background = "var(--orange)";

    function openIt() {
      if (isOpen) return; isOpen = true;
      document.dispatchEvent(new Event("contact:open"));
      lastFocus = document.activeElement;
      modal.hidden = false;
      if (lenis) lenis.stop(); else document.body.style.overflow = "hidden";
      if (anim) {
        if (tl) tl.kill();
        tl = gsap.timeline()
          .fromTo(wipe, { drawSVG: "0%", strokeWidth: 0 }, { drawSVG: "100%", strokeWidth: 1700, duration: 1, ease: "power3.inOut" })
          .fromTo(items, { y: 60, opacity: 0, rotation: function () { return gsap.utils.random(-5, 5); } }, { y: 0, opacity: 1, rotation: 0, duration: 0.7, ease: "back.out(1.6)", stagger: 0.045 }, "-=0.4");
      }
      setTimeout(function () { closeBtn.focus(); }, anim ? 600 : 0);
    }
    function closeIt() {
      if (!isOpen) return; isOpen = false;
      var done = function () { modal.hidden = true; if (lenis) lenis.start(); else document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
      if (!anim) return done();
      if (tl) tl.kill();
      tl = gsap.timeline({ onComplete: done })
        .to(items, { opacity: 0, duration: 0.25, stagger: 0.01 })
        .to(wipe, { drawSVG: "100% 100%", duration: 0.8, ease: "power3.inOut" }, "-=0.1");
    }
    document.addEventListener("click", function (e) { if (e.target.closest(".cta-btn")) { e.preventDefault(); openIt(); } });
    closeBtn.addEventListener("click", closeIt);
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") closeIt();
      if (e.key === "Tab") {
        var f = $$("a, button", modal), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Smooth anchor links ---------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2 || !lenis) return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === "#top" ? 0 : -20, duration: 1.6 });
      });
    });
  }

  /* ---------- Helpers ---------- */
  function readRot(el) { return parseFloat(getComputedStyle(el).getPropertyValue("--r")) || 0; }
  function wrapPillText(p) {
    if ($(".pill-mask", p)) return;
    var m = document.createElement("span"); m.className = "pill-mask";
    var s = document.createElement("span"); s.textContent = p.textContent;
    p.textContent = ""; m.appendChild(s); p.appendChild(m);
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
})();
