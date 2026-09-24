(function () {
  "use strict";

  /* ---------------------------------------------------------------- */
  /* Données des projets — seule source à modifier pour ajouter,      */
  /* renommer ou retirer une réalisation. Aucune carte n'est écrite   */
  /* à la main dans le HTML : tout est généré à partir de ce tableau. */
  /* ---------------------------------------------------------------- */
  var PROJECTS = [
    {
      id: "identite-01", grid: "identite",
      category: "Identité de marque", title: "Projet à renseigner",
      year: "Année à confirmer", context: "Client et contexte à confirmer avec vous.",
      role: "Rôle à confirmer", disciplines: "Disciplines à confirmer",
      idea: "Visuel fourni, projet et partis pris créatifs à documenter.",
      image: "Public/images/Image_01.jpg", imageAlt: "Visuel fourni pour le portfolio, projet à identifier.", imageWidth: 1181, imageHeight: 787
    },
    {
      id: "campagnes-01", grid: "campagnes",
      category: "Campagne & image", title: "Projet à renseigner",
      year: "Année à confirmer", context: "Client et contexte à confirmer avec vous.",
      role: "Rôle à confirmer", disciplines: "Disciplines à confirmer",
      idea: "Visuel fourni, projet et partis pris créatifs à documenter.",
      image: "Public/images/Image_02.jpg", imageAlt: "Visuel fourni pour le portfolio, projet à identifier.", imageWidth: 1181, imageHeight: 807
    },
    {
      id: "edition-01", grid: "edition",
      category: "Édition & digital", title: "Projet à renseigner",
      year: "Année à confirmer", context: "Client et contexte à confirmer avec vous.",
      role: "Rôle à confirmer", disciplines: "Disciplines à confirmer",
      idea: "Visuel fourni, projet et partis pris créatifs à documenter.",
      image: "Public/images/Image_03.jpg", imageAlt: "Visuel fourni pour le portfolio, projet à identifier.", imageWidth: 1181, imageHeight: 1181
    }
  ];

  var CATEGORY_LABELS = {
    identite: "Identité de marque — contexte à préciser.",
    campagnes: "Campagne — contexte à préciser.",
    edition: "Édition et numérique — contexte à préciser."
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- */
  /* Utilitaires de focus partagés par le menu mobile et le dialogue. */
  /* ---------------------------------------------------------------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusable(container) {
    return Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return el.getClientRects().length > 0;
    });
  }

  function trapTab(container, event) {
    if (event.key !== "Tab") return;
    var focusable = getFocusable(container);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  var page = document.getElementById("page");
  var openDialogsCount = 0;

  function lockScroll() {
    openDialogsCount++;
    document.documentElement.classList.add("has-overlay");
  }
  function unlockScroll() {
    openDialogsCount = Math.max(0, openDialogsCount - 1);
    if (openDialogsCount === 0) document.documentElement.classList.remove("has-overlay");
  }

  /* ---------------------------------------------------------------- */
  /* Menu mobile.                                                      */
  /* ---------------------------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navMobile = document.getElementById("nav-mobile");
  var navLastFocus = null;

  function openNav() {
    if (!navMobile) return;
    navLastFocus = document.activeElement;
    navMobile.removeAttribute("inert");
    navMobile.classList.add("is-open");
    if (navToggle) { navToggle.classList.add("is-active"); navToggle.setAttribute("aria-expanded", "true"); }
    if (page) page.setAttribute("inert", "");
    lockScroll();
    var closeBtn = navMobile.querySelector(".nav-mobile-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeNav() {
    if (!navMobile || !navMobile.classList.contains("is-open")) return;
    navMobile.classList.remove("is-open");
    navMobile.setAttribute("inert", "");
    if (navToggle) { navToggle.classList.remove("is-active"); navToggle.setAttribute("aria-expanded", "false"); }
    if (page) page.removeAttribute("inert");
    unlockScroll();
    if (navLastFocus && typeof navLastFocus.focus === "function") navLastFocus.focus();
    else if (navToggle) navToggle.focus();
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (navMobile.classList.contains("is-open")) closeNav(); else openNav();
    });
  }
  if (navMobile) {
    navMobile.querySelectorAll("[data-nav-close]").forEach(function (el) {
      el.addEventListener("click", closeNav);
    });
    navMobile.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); closeNav(); }
      else trapTab(navMobile, event);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Rendu des grilles de projets à partir de PROJECTS.                */
  /* ---------------------------------------------------------------- */
  function renderGrids() {
    var grids = document.querySelectorAll("[data-grid]");
    grids.forEach(function (grid) {
      var gridKey = grid.getAttribute("data-grid");
      var more = grid.querySelector("[data-more]");
      var projects = PROJECTS.filter(function (p) { return p.grid === gridKey; });
      projects.forEach(function (project, i) {
        var article = document.createElement("article");
        article.className = "entry reveal";
        article.style.setProperty("--d", String(i));

        var button = document.createElement("button");
        button.type = "button";
        button.className = "entry-image";
        button.setAttribute("data-project", project.id);
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-label", "Voir la présentation du projet : " + project.title);

        var image = document.createElement("img");
        image.src = project.image;
        image.alt = project.imageAlt;
        image.width = project.imageWidth;
        image.height = project.imageHeight;
        image.loading = "lazy";
        button.appendChild(image);

        var badge = document.createElement("span");
        badge.className = "index-badge";
        badge.textContent = i < 9 ? "0" + (i + 1) : String(i + 1);
        button.appendChild(badge);

        var arrow = document.createElement("span");
        arrow.className = "entry-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        button.appendChild(arrow);

        article.appendChild(button);

        var caption = document.createElement("div");
        caption.className = "entry-caption";
        caption.innerHTML =
          '<div><h3 class="entry-title"></h3><p class="entry-meta"></p></div><span class="entry-status"></span>';
        caption.querySelector(".entry-title").textContent = project.title;
        caption.querySelector(".entry-meta").textContent = project.category + " — projet à identifier.";
        caption.querySelector(".entry-status").textContent = project.year;
        article.appendChild(caption);

        if (project.behindTheScenes) {
          var extra = document.createElement("div");
          extra.className = "entry-extra";
          var extraPh = document.createElement("div");
          extraPh.className = "ph-block small";
          var extraSpan = document.createElement("span");
          extraSpan.textContent = "+";
          extraPh.appendChild(extraSpan);
          extra.appendChild(extraPh);
          var extraP = document.createElement("p");
          extraP.textContent = "Certains projets pourront aussi montrer le coulisses de création : croquis, étapes, versions de travail.";
          extra.appendChild(extraP);
          article.appendChild(extra);
        }

        if (more) grid.insertBefore(article, more);
        else grid.appendChild(article);
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Dialogue de présentation de projet.                                */
  /* ---------------------------------------------------------------- */
  var modal = document.getElementById("project-modal");
  var modalBody = document.getElementById("pm-body");
  var modalLastFocus = null;
  var currentIndex = -1;

  function fillModal(index) {
    var project = PROJECTS[index];
    if (!project || !modal) return;
    document.getElementById("pm-index").textContent = (index + 1) + " / " + PROJECTS.length;
    document.getElementById("pm-category").textContent = project.category;
    document.getElementById("pm-title").textContent = project.title;
    document.getElementById("pm-context").textContent = project.context;
    document.getElementById("pm-role").textContent = project.role;
    document.getElementById("pm-disciplines").textContent = project.disciplines;
    document.getElementById("pm-year").textContent = project.year;
    document.getElementById("pm-idea").textContent = project.idea;

    var gallery = document.getElementById("pm-gallery");
    gallery.innerHTML = "";
    var image = document.createElement("img");
    image.src = project.image;
    image.alt = project.imageAlt;
    image.width = project.imageWidth;
    image.height = project.imageHeight;
    image.loading = "lazy";
    gallery.appendChild(image);

    var bts = document.getElementById("pm-bts");
    var btsGrid = document.getElementById("pm-bts-grid");
    bts.hidden = true;
    btsGrid.innerHTML = "";
    modal.querySelector(".project-modal-body").scrollTop = 0;
  }

  function showProject(index, animateSwap) {
    index = ((index % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
    currentIndex = index;
    if (animateSwap && !reduceMotion) {
      modalBody.classList.add("is-swapping");
      window.setTimeout(function () {
        fillModal(currentIndex);
        modalBody.classList.remove("is-swapping");
      }, 180);
    } else {
      fillModal(currentIndex);
    }
  }

  function openProject(id, triggerEl) {
    var index = PROJECTS.findIndex(function (p) { return p.id === id; });
    if (index === -1 || !modal) return;
    modalLastFocus = triggerEl || document.activeElement;
    showProject(index, false);
    modal.removeAttribute("inert");
    modal.classList.add("is-open");
    if (page) page.setAttribute("inert", "");
    lockScroll();
    var closeBtn = modal.querySelector(".project-modal-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeProject() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("inert", "");
    if (page) page.removeAttribute("inert");
    unlockScroll();
    if (modalLastFocus && typeof modalLastFocus.focus === "function") modalLastFocus.focus();
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest ? event.target.closest("[data-project]") : null;
    if (trigger) { openProject(trigger.getAttribute("data-project"), trigger); return; }
    if (event.target.closest && event.target.closest("[data-pm-close]")) { closeProject(); return; }
    if (event.target.closest && event.target.closest("[data-pm-prev]")) { showProject(currentIndex - 1, true); return; }
    if (event.target.closest && event.target.closest("[data-pm-next]")) { showProject(currentIndex + 1, true); return; }
  });

  if (modal) {
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); closeProject(); }
      else if (event.key === "ArrowLeft") { showProject(currentIndex - 1, true); }
      else if (event.key === "ArrowRight") { showProject(currentIndex + 1, true); }
      else trapTab(modal, event);
    });
  }

  /* ---------------------------------------------------------------- */
  /* En-tête, barre de progression, année, révélations au défilement.  */
  /* ---------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  var bar = document.querySelector(".scroll-progress");
  var navLinks = document.querySelectorAll(".nav-link");
  var topSections = document.querySelectorAll("main > section[id], #travaux[id]");

  function onScroll() {
    if (header) {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
    if (bar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = pct + "%";
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if ("IntersectionObserver" in window && navLinks.length && topSections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = document.querySelector('.nav-link[href="#' + entry.target.id + '"]');
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("is-current"); });
            link.classList.add("is-current");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    topSections.forEach(function (section) { navObserver.observe(section); });
  }

  renderGrids();

  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries, activeObserver) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            activeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    items.forEach(function (item) { observer.observe(item); });
  } else {
    items.forEach(function (item) { item.classList.add("is-visible"); });
  }
})();
