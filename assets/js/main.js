/* Del Sauce — shared site behavior: nav, reveal-on-scroll, lightbox, appliance modal. */
(function () {
  "use strict";

  var html = document.documentElement;
  var openOverlays = 0;

  function lockScroll() {
    openOverlays++;
    html.classList.add("no-scroll");
  }

  function unlockScroll() {
    openOverlays = Math.max(0, openOverlays - 1);
    if (openOverlays === 0) html.classList.remove("no-scroll");
  }

  /* ---------------- Navigation ---------------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;

    var toggle = nav.querySelector(".nav__toggle");
    var links = nav.querySelector(".nav__links");
    var scrim = document.querySelector(".nav__scrim");
    var closeBtn = document.querySelector(".nav__close");
    var navLinkEls = links ? links.querySelectorAll("a") : [];

    function openMenu() {
      links.classList.add("is-open");
      scrim && scrim.classList.add("is-open");
      closeBtn && closeBtn.classList.add("is-open");
      toggle && toggle.setAttribute("aria-expanded", "true");
      lockScroll();
    }

    function closeMenu() {
      links.classList.remove("is-open");
      scrim && scrim.classList.remove("is-open");
      closeBtn && closeBtn.classList.remove("is-open");
      toggle && toggle.setAttribute("aria-expanded", "false");
      unlockScroll();
    }

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        if (links.classList.contains("is-open")) closeMenu();
        else openMenu();
      });
    }

    closeBtn && closeBtn.addEventListener("click", closeMenu);
    scrim && scrim.addEventListener("click", closeMenu);
    navLinkEls.forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) closeMenu();
    });

    if (nav.classList.contains("is-home")) {
      var onScroll = function () {
        if (window.scrollY > 60) nav.classList.add("is-solid");
        else nav.classList.remove("is-solid");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 70 + "ms";
      observer.observe(el);
    });
  }

  /* ---------------- Lightbox (fotos) ---------------- */
  function initLightbox() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var lightbox = document.querySelector(".lightbox");
    if (!items.length || !lightbox) return;

    var imgEl = lightbox.querySelector("img");
    var captionEl = lightbox.querySelector("figcaption");
    var closeBtn = lightbox.querySelector(".lightbox__close");
    var prevBtn = lightbox.querySelector(".lightbox__prev");
    var nextBtn = lightbox.querySelector(".lightbox__next");
    var current = 0;

    function visibleItems() {
      return items.filter(function (el) {
        return !el.closest(".is-hidden");
      });
    }

    function show(index) {
      var list = visibleItems();
      if (!list.length) return;
      current = (index + list.length) % list.length;
      var target = list[current];
      var img = target.querySelector("img");
      imgEl.src = img.src;
      imgEl.alt = img.alt || "";
      captionEl.textContent = target.getAttribute("data-caption") || img.alt || "";
    }

    function open(index) {
      show(index);
      lightbox.classList.add("is-open");
      lockScroll();
    }

    function close() {
      lightbox.classList.remove("is-open");
      imgEl.src = "";
      unlockScroll();
    }

    items.forEach(function (el, i) {
      el.addEventListener("click", function () {
        open(visibleItems().indexOf(el));
      });
    });

    closeBtn && closeBtn.addEventListener("click", close);
    prevBtn && prevBtn.addEventListener("click", function () {
      show(current - 1);
    });
    nextBtn && nextBtn.addEventListener("click", function () {
      show(current + 1);
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------------- Gallery filters (fotos) ---------------- */
  function initGalleryFilters() {
    var buttons = document.querySelectorAll(".gallery-filters button");
    var items = document.querySelectorAll(".gallery__item");
    if (!buttons.length || !items.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");

        var filter = btn.getAttribute("data-filter");
        items.forEach(function (item) {
          var matches = filter === "all" || item.getAttribute("data-category") === filter;
          item.classList.toggle("is-hidden", !matches);
        });
      });
    });
  }

  /* ---------------- Appliance modal (artefactos) ---------------- */
  function initApplianceModal() {
    var cards = document.querySelectorAll("[data-modal-target]");
    var modal = document.querySelector(".modal");
    if (!cards.length || !modal) return;

    var body = modal.querySelector(".modal__body");
    var closeBtn = modal.querySelector(".modal__close");

    function open(targetId) {
      var template = document.getElementById(targetId);
      if (!template) return;
      body.innerHTML = "";
      body.appendChild(template.content.cloneNode(true));
      modal.classList.add("is-open");
      lockScroll();
      closeBtn.focus();
    }

    function close() {
      modal.classList.remove("is-open");
      unlockScroll();
      var videos = body.querySelectorAll("video");
      videos.forEach(function (v) {
        v.pause();
      });
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        open(card.getAttribute("data-modal-target"));
      });
    });

    closeBtn && closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initLightbox();
    initGalleryFilters();
    initApplianceModal();
  });
})();
