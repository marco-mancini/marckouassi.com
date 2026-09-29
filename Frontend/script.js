(function () {
  "use strict";

  /* ---------------------------------------------------------------- */
  /* Données des projets — seule source à modifier pour ajouter,      */
  /* renommer ou retirer une réalisation. Aucune carte n'est écrite   */
  /* à la main dans le HTML : tout est généré à partir de ce tableau. */
  /* ---------------------------------------------------------------- */
  var DIMENSIONS = {
    "Projet_ANACADI_09.png": [3066, 2170],
    "Projet_FIFA26_01.png": [3604, 2030],
    "Projet_FIFA26_02.png": [3604, 2030],
    "Projet_LaBeninoise_01.png": [3072, 1728],
    "Projet_LaBeninoise_02.png": [1184, 1482],
    "Projet_LaBeninoise_03.png": [1184, 1482],
    "Projet_LaBeninoise_04.png": [1184, 1482],
    "Projet_LaBeninoise_05.png": [1184, 1482],
    "Projet_LaBeninoise_06.png": [1184, 1482],
    "Projet_LaBeninoise_07.png": [1184, 1482],
    "Projet_LaBeninoise_08.png": [3066, 2304],
    "Projet_Velanova_01.png": [3066, 2402],
    "Projet_WoldCola_01.png": [3596, 1860],
    "Projet_WoldCola_02.png": [2796, 2108],
    "Projet_WoldCola_03.png": [1400, 1734],
    "Projet_WoldCola_04.png": [1184, 1496],
    "Projet_WoldCola_05.png": [1176, 1496],
    "Projet_AUREX_06.png": [2788, 1962],
    "Projet_AUREX_07.png": [2788, 1962],
    "Projet_AUREX_08.png": [2788, 1962],
    "Projet_AUREX_09.png": [1181, 831],
    "Projet_FEROV_01.png": [2724, 2046],
    "Projet_FEROV_03.png": [1224, 1285],
    "Projet_FEROV_04.png": [1312, 1199],
    "Projet_FEROV_05.png": [1312, 1199],
    "Projet_VOON_01.png": [2784, 2481],
    "Projet_VOON_02.png": [1448, 1086],
    "Projet_VOON_03.png": [1672, 941],
    "Projet_TP_Solution 01.png": [1181, 917],
    "Projet_TP_Solution 02.png": [1181, 802],
    "Projet_TP_Solution 06.png": [1181, 847]
  };

  function visuels(prefixe, total, description, largeur, hauteur) {
    return Array.from({ length: total }, function (_, index) {
      var numero = String(index + 1).padStart(2, "0");
      var nom = prefixe + numero + ".png";
      var dimensions = DIMENSIONS[nom] || [largeur, hauteur];
      return {
        src: "Public/images/" + nom,
        alt: description + " — vue " + numero + ".",
        width: dimensions[0],
        height: dimensions[1]
      };
    });
  }

  function visuelsTP() {
    return ["01", "02", "04", "05", "06", "07", "08"].map(function (numero) {
      return {
        src: "Public/images/Projet_TP_Solution " + numero + ".png",
        alt: "Support de communication et présentation de TP Solutions — vue " + numero + ".",
        width: (DIMENSIONS["Projet_TP_Solution " + numero + ".png"] || [1672, 941])[0],
        height: (DIMENSIONS["Projet_TP_Solution " + numero + ".png"] || [1672, 941])[1]
      };
    });
  }

  function visuelsCEELI() {
    var numeros = Array.from({ length: 25 }, function (_, index) { return index + 1; }).concat([27, 28, 29, 30, 31]);
    return numeros.map(function (numero) {
      var nom = String(numero).padStart(2, "0") + ".png";
      return {
        src: "Public/images/Charte_Graphique/" + nom,
        alt: "Planche " + String(numero).padStart(2, "0") + " de la charte graphique CEELI Group.",
        width: 2796,
        height: 1974
      };
    });
  }

  var PROJECTS = [
    {
      id: "fifa26", grid: "campagnes", category: "Campagne publicitaire · sport",
      title: "Orange Sénégal · FIFA 26", year: "2026",
      context: "À l’approche de la Coupe du monde 2026, Orange Sénégal prend la parole comme sponsor dans un moment où le football dépasse le terrain : il rassemble, fait vibrer et crée des souvenirs partagés.",
      role: "Direction artistique · réflexion · conception de campagne",
      disciplines: "Concept publicitaire · univers visuel · déclinaisons de campagne",
      idea: "J’ai construit une prise de parole qui place l’énergie du tournoi au cœur de l’expérience Orange. Les codes du football deviennent une matière visuelle vivante : rythme, mouvement et intensité donnent à la campagne une présence immédiatement reconnaissable.",
      value: "L’enjeu était de faire exister le rôle de sponsor dans l’imaginaire des supporters, avec une campagne pensée comme un ensemble cohérent plutôt qu’une image isolée. Les déclinaisons réunissent la marque et l’événement autour d’une même promesse d’émotion collective.",
      images: visuels("Projet_FIFA26_", 13, "Campagne Orange Sénégal autour de la Coupe du monde FIFA 2026", 3596, 2024)
    },
    {
      id: "world-cola", grid: "campagnes", category: "Campagne de marque · Ramadan",
      title: "World Cola · Ramadan", year: "2024–2025",
      context: "Au Bénin, World Cola est la boisson gazeuse pétillante aux arômes de cola de SOBEBRA. Pour le Ramadan, la campagne l’installe dans les moments de partage, les gestes familiers et les retrouvailles qui donnent à cette période toute sa chaleur.",
      role: "Direction artistique · réflexion · conception de campagne",
      disciplines: "Concept · création publicitaire · supports de campagne",
      idea: "Plutôt que de montrer seulement une boisson, j’ai placé la convivialité au premier plan. Les créations rapprochent le produit de la table, des instants de pause et de la joie d’être ensemble, tout en gardant l’énergie pétillante propre à World Cola.",
      value: "Le fil créatif relie le produit à une expérience culturelle concrète : celle d’un moment attendu et partagé. Une idée simple, déclinable sur plusieurs supports, qui permet à la marque d’entrer dans le récit du Ramadan sans perdre sa personnalité.",
      images: visuels("Projet_WoldCola_", 5, "Campagne World Cola pour le Ramadan au Bénin", 2796, 2108)
    },
    {
      id: "beninoise", grid: "campagnes", category: "Campagne de marque · bière",
      title: "La Béninoise · La bière du Bénin", year: "2024–2025",
      context: "Bière blonde de type lager, La Béninoise est une marque emblématique et populaire au Bénin, associée à la signature « La bière du Bénin ». La campagne devait faire vivre cette proximité à travers des prises de parole visibles, festives et immédiatement liées à la marque.",
      role: "Direction artistique · réflexion · conception de campagne",
      disciplines: "Territoire visuel · créations publicitaires · déclinaisons",
      idea: "J’ai travaillé autour de ce qui fait la force d’une marque populaire : sa capacité à rassembler. Les compositions mettent le produit en scène avec assurance et donnent à la signature « La bière du Bénin » une place naturelle dans l’expression de la campagne.",
      value: "La cohérence entre le produit, les codes de la marque et les différents formats transforme chaque visuel en point de contact reconnaissable. L’intention est de célébrer une marque familière avec la considération due à son histoire et à son public.",
      images: visuels("Projet_LaBeninoise_", 8, "Créations de campagne pour La Béninoise", 1184, 1482)
    },
    {
      id: "anacadi", grid: "campagnes", category: "Campagne événementielle · supports",
      title: "ANACADI · Journée d’excellence du Gbêkê", year: "2025",
      context: "La Journée d’excellence de la Région du Gbêkê célèbre les parcours et les réussites qui font avancer le territoire. Pour ANACADI, la communication devait donner à cet événement une présence digne de sa portée et lisible sur des supports variés.",
      role: "Direction artistique · réflexion · conception de campagne",
      disciplines: "Univers de campagne · emballages · supports de communication",
      idea: "J’ai pensé la campagne comme un langage visuel capable de passer du message à l’objet. Les emballages et les supports reprennent une même intention graphique pour que l’événement soit reconnaissable, qu’on le découvre sur une affiche ou qu’on le tienne en main.",
      value: "Le projet relie visibilité et expérience : les supports ne se contentent pas d’annoncer un rendez-vous, ils prolongent la célébration et rendent son identité présente dans l’espace. ANACADI est ici une campagne événementielle autonome, distincte de la charte CEELI Group.",
      images: visuels("Projet_ANACADI_", 11, "Emballages et supports de la campagne ANACADI pour la Journée d’excellence du Gbêkê", 3066, 2304)
    },
    {
      id: "ceeli", grid: "identite", category: "Identité de marque · charte complète",
      title: "CEELI Group · construire un système de marque", year: "2023",
      context: "Une marque solide doit rester juste dans toutes ses expressions. Pour CEELI Group, le travail a pris la forme d’une charte graphique complète : un cadre commun pour rendre l’identité claire, cohérente et durable à travers ses usages.",
      role: "Direction artistique · réflexion · conception de l’identité",
      disciplines: "Système de marque · logotype · couleurs · typographie · règles d’usage",
      idea: "J’ai abordé la charte comme un outil de décision autant que comme un objet de présentation. Elle formalise les éléments fondateurs, explique leurs relations et montre comment préserver la personnalité de la marque lorsqu’elle change de support ou de contexte.",
      value: "Le résultat est un référentiel visuel qui aide à faire vivre la marque sans la dénaturer : principes, variantes, règles de composition et exemples d’application sont réunis dans un document de référence. Ce projet de branding est indépendant de la campagne ANACADI.",
      images: visuelsCEELI()
    },
    {
      id: "velanova", grid: "identite", category: "Identité de lancement · sport",
      title: "VELANOVA · donner forme à un projet sportif", year: "Février 2025",
      context: "Un entrepreneur prépare le lancement d’une activité d’équipements sportifs. Au moment où une idée devient un projet concret, l’identité doit apporter un premier repère : une présence claire, crédible et assez souple pour accompagner la suite.",
      role: "Direction artistique · réflexion · conception de l’univers",
      disciplines: "Identité visuelle · logotype · principes graphiques · applications",
      idea: "J’ai cherché une expression qui évoque le mouvement et l’ambition sans enfermer VELANOVA dans une seule discipline sportive. Le système visuel pose une base de marque capable de se décliner sur les produits et les supports au fil du lancement.",
      value: "À ce stade, l’identité joue un rôle de fondation : elle donne au projet un visage et une cohérence pour commencer à se présenter au public. La proposition accompagne une intention entrepreneuriale encore en construction, sans prétendre raconter des résultats commerciaux.",
      images: visuels("Projet_Velanova_", 11, "Études et applications de l’identité VELANOVA pour un projet d’équipements sportifs", 3066, 2192)
    },
    {
      id: "aurex", grid: "identite", category: "Identité de marque · charte graphique",
      title: "AUREX · un signe qui prend sa place", year: "2023",
      context: "Les pièces présentées montrent une identité pensée pour vivre au-delà du logo : charte, supports de campagne et applications sur différents formats. L’enjeu est de garder la marque identifiable dans des contextes très différents.",
      role: "Direction artistique · réflexion · conception graphique",
      disciplines: "Logotype · charte · supports de communication · applications",
      idea: "Le X devient le point d’ancrage du système. Son contraste et son énergie structurent les compositions, tandis que les règles de la charte assurent la continuité entre les supports imprimés, les véhicules et les visuels de campagne.",
      value: "En donnant un rôle constant au signe et à ses codes, le système peut changer d’échelle sans perdre sa force. La marque se lit aussi bien dans une présentation de référence que dans une application concrète.",
      images: visuels("Projet_AUREX_", 9, "Charte, identité et applications de la marque AUREX", 2724, 1948)
    },
    {
      id: "ferov", grid: "identite", category: "Identité de marque · mode",
      title: "FEROV · une signature assumée", year: "2023",
      context: "Les visuels FEROV explorent une identité de marque associée au vêtement et à son expression. Il fallait donner au nom une présence forte, capable de vivre sur le textile comme dans les supports de présentation.",
      role: "Direction artistique · réflexion · conception de l’identité",
      disciplines: "Logotype · univers visuel · déclinaisons",
      idea: "Le travail s’appuie sur une signature typographique franche et une palette contrastée. Le vêtement devient un support d’expression à part entière ; l’identité s’y inscrit avec suffisamment de caractère pour être remarquée, sans multiplier les signes.",
      value: "Une direction resserrée permet à la marque d’être reconnaissable et de garder une ligne cohérente entre le logo, les portraits et ses différentes présentations.",
      images: visuels("Projet_FEROV_", 5, "Identité visuelle et applications de la marque FEROV", 2724, 2038)
    },
    {
      id: "voon", grid: "identite", category: "Identité de marque · accessoires",
      title: "VOON · faire du nom un signe", year: "2022",
      context: "Pour VOON, les images montrent une signature destinée à s’exprimer sur des accessoires et des supports de marque. Le défi est de créer un signe assez distinctif pour être reconnu, même à petite échelle.",
      role: "Direction artistique · réflexion · conception de l’identité",
      disciplines: "Logotype · déclinaisons · applications de marque",
      idea: "Les deux O s’entrelacent pour former un signe compact, facile à retenir et à appliquer. Cette construction donne au nom une dimension visuelle propre, tout en laissant l’identité respirer sur des fonds et des matières différents.",
      value: "Le projet montre comment un détail typographique peut devenir le principe organisateur d’une marque : la signature reste lisible, reproductible et cohérente de la présentation au produit.",
      images: visuels("Projet_VOON_", 3, "Signature et applications de la marque VOON", 1672, 1488)
    },
    {
      id: "tp-solutions", grid: "campagnes", category: "Édition · communication d’entreprise",
      title: "TP Solutions · rendre l’offre lisible", year: "2023",
      context: "Présenter une entreprise, ses services et ses partenaires demande plus qu’une accumulation d’informations. Les supports TP Solutions organisent le discours pour accompagner une découverte rapide, puis une lecture plus détaillée.",
      role: "Direction artistique · réflexion · conception graphique",
      disciplines: "Brochure · supports éditoriaux · communication imprimée",
      idea: "J’ai articulé les contenus autour d’une hiérarchie claire : une identité visible, des rubriques faciles à repérer et des mises en page qui laissent respirer l’information. Le système accompagne le lecteur du premier regard jusqu’aux détails de l’offre.",
      value: "La cohérence entre les documents transforme plusieurs supports en une seule expérience de présentation. L’entreprise peut expliquer ce qu’elle fait avec clarté et donner à ses échanges commerciaux une base visuelle plus structurée.",
      images: visuelsTP()
    },
    {
      id: "ci20-connect", grid: "numerique", category: "Expérience numérique · UX/UI",
      title: "CI20 Connect · relier les ambitions", year: "2025–2026",
      context: "CI20 Connect veut rapprocher les entrepreneurs des ressources qui peuvent les faire avancer : réseau, formation, mentorat et opportunités. L’expérience doit rendre ces possibilités compréhensibles et aider chacun à identifier sa prochaine étape.",
      role: "Direction visuelle · conception UX/UI",
      disciplines: "Interface · parcours numériques · communication digitale",
      idea: "J’ai abordé l’expérience comme un chemin à rendre plus simple. Les contenus et les points d’entrée donnent une place concrète aux besoins des entrepreneurs : apprendre, rencontrer, progresser. La direction visuelle met en scène cette ambition sans perdre de vue la lisibilité.",
      value: "Le projet traduit une promesse de mise en relation en une expérience numérique à explorer. Les visuels réunissent l’interface et sa communication pour montrer comment le service se présente et comment il peut accompagner une communauté entrepreneuriale.",
      images: [
        { src: "Public/images/Projet_Ci20_03.jpg", alt: "Visuel de communication de CI20 Connect dans un espace de travail.", width: 5906, height: 4927 },
        { src: "Public/images/Projet_Ci20_01.png", alt: "Interface de CI20 Connect présentant les services de la plateforme.", width: 1181, height: 663 },
        { src: "Public/images/Projet_Ci20_02.jpg", alt: "Présentation de CI20 Connect sur ordinateur.", width: 5906, height: 5906 }
      ]
    }
  ];

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
  /* Sommaire de projets composé d’aperçus courts et d’études détaillées. */
  /* ---------------------------------------------------------------- */
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function addImage(container, asset, className) {
    var figure = element("figure", className || "case-image");
    var image = document.createElement("img");
    image.src = asset.src;
    image.alt = asset.alt;
    image.width = asset.width;
    image.height = asset.height;
    image.loading = "lazy";
    figure.appendChild(image);
    container.appendChild(figure);
  }

  function renderProjectShowcases() {
    var grid = document.querySelector("[data-project-grid]");
    if (!grid) return;

    PROJECTS.forEach(function (project, projectIndex) {
      var number = String(projectIndex + 1).padStart(2, "0");
      var card = element("article", "project-card");
      var preview = element("div", "project-gallery-preview");
      var previewCount = Math.min(project.images.length, 6);
      preview.dataset.count = String(previewCount);
      project.images.slice(0, previewCount).forEach(function (asset, imageIndex) {
        addImage(preview, asset, imageIndex === 0 ? "project-image project-image--lead" : "project-image project-image--thumb");
      });
      var open = element("button", "project-enter", "↗");
      open.type = "button";
      open.dataset.projectOpen = project.id;
      open.setAttribute("aria-haspopup", "dialog");
      open.setAttribute("aria-label", "Entrer dans le projet " + project.title + " pour voir l’étude complète et toutes ses images");
      preview.appendChild(open);
      card.appendChild(preview);

      var heading = element("header", "project-card-heading");
      heading.appendChild(element("span", "project-card-number", number));
      var name = element("div", "project-card-name");
      name.appendChild(element("h3", "", project.title));
      name.appendChild(element("p", "", project.category + " · " + project.year));
      heading.appendChild(name);
      card.appendChild(heading);
      grid.appendChild(card);
    });
  }

  function fillProjectDialog(project, index) {
    document.getElementById("dialog-counter").textContent = "Projet " + String(index + 1).padStart(2, "0") + " / " + String(PROJECTS.length).padStart(2, "0");
    document.getElementById("dialog-category").textContent = project.category;
    document.getElementById("dialog-title").textContent = project.title;
    document.getElementById("dialog-context").textContent = project.context;
    document.getElementById("dialog-idea").textContent = project.idea;
    document.getElementById("dialog-value").textContent = project.value;

    var meta = document.getElementById("dialog-meta");
    meta.innerHTML = "";
    [["Mon rôle", project.role], ["Disciplines", project.disciplines], ["Période", project.year]].forEach(function (pair) {
      var item = element("div", "project-meta-item");
      item.appendChild(element("span", "project-meta-label", pair[0]));
      item.appendChild(element("p", "", pair[1]));
      meta.appendChild(item);
    });

    var documentLink = document.getElementById("dialog-document");
    documentLink.hidden = !project.document;
    documentLink.removeAttribute("href");
    if (project.document) {
      documentLink.href = project.document.src;
      documentLink.textContent = project.document.label + " ↗";
      documentLink.target = "_blank";
      documentLink.rel = "noreferrer";
    }

    var gallery = document.getElementById("dialog-gallery");
    gallery.innerHTML = "";
    project.images.forEach(function (asset, imageIndex) {
      addImage(gallery, asset, imageIndex === 0 ? "project-detail-image project-detail-image--lead" : "project-detail-image");
    });
  }

  function setupProjectDialog() {
    var dialog = document.getElementById("project-dialog");
    if (!dialog) return;
    var opened = false;
    var lastTrigger = null; // la carte d'ou l'on vient, pour y rendre le focus
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest ? event.target.closest("[data-project-open]") : null;
      if (trigger) {
        var index = PROJECTS.findIndex(function (project) { return project.id === trigger.dataset.projectOpen; });
        if (index < 0) return;
        fillProjectDialog(PROJECTS[index], index);
        lastTrigger = trigger;
        dialog.showModal();
        opened = true;
        lockScroll();
        return;
      }
      if (event.target.closest && event.target.closest("[data-dialog-close]") && dialog.open) dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      if (opened) { opened = false; unlockScroll(); }
      /* Le focus repart sur la carte d'ou l'on venait. Sans cela il
         retombe sur <body> et la navigation au clavier recommence en
         haut de page, quelle que soit la facon dont le dialogue a ete
         ferme : croix, Echap ou clic sur le fond. */
      if (lastTrigger && lastTrigger.isConnected) {
        lastTrigger.focus({ preventScroll: true });
      }
      lastTrigger = null;
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

  renderProjectShowcases();
  setupProjectDialog();

  var items = document.querySelectorAll(".artboard");
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
