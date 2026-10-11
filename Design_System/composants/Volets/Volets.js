import { html, attributs } from "../../fondations/rendu.js";

/**
 * Volets — des éléments titrés dont un seul est ouvert à la fois.
 *
 * Sur une colonne, c'est un accordéon : chaque titre ouvre son volet juste
 * dessous. Sur deux colonnes (la feuille en décide, pas le script), les
 * titres forment une liste à gauche et le volet ouvert s'affiche à droite.
 * Sans script, tout est ouvert et lisible. Décision de Marc : #199.
 *
 * @param {object} p
 * @param {{id:string, titre:*, contenu:*}[]} p.elements
 * @param {string} p.etiquette          nom de l'ensemble (dictionnaire)
 * @param {string} [p.id]               préfixe des identifiants
 * @param {number} [p.ouvert]           rang ouvert au départ
 */
export function Volets({ elements, etiquette, id = "volets", ouvert = 0 }) {
  return html`<div${attributs({ class: "volets", "data-volets": "", "data-ouvert": String(ouvert), role: "group", "aria-label": etiquette, style: `--volets-nombre: ${elements.length}` })}>${elements.map((element, rang) => {
    const onglet = `${id}-${element.id}`, panneau = `${onglet}-volet`;
    return html`<h3 class="volets__titre"><button${attributs({ class: "volets__onglet", type: "button", id: onglet, "aria-controls": panneau, "aria-expanded": "true", style: `--i: ${rang}` })}><span class="volets__rang" aria-hidden="true">${String(rang + 1).padStart(2, "0")}</span><span class="volets__libelle">${element.titre}</span><span class="volets__signe" aria-hidden="true"></span></button></h3><div${attributs({ class: "volets__panneau", id: panneau, role: "region", "aria-labelledby": onglet })}>${element.contenu}</div>`;
  })}</div>`;
}

/* ------------------------------------------------------------------ */
/* Comportement — navigateur uniquement.                              */
/* ------------------------------------------------------------------ */

/**
 * Un seul volet ouvert. Sur deux colonnes, il y en a toujours un (un clic
 * sur l'ouvert ne le referme pas) et le survol d'un titre l'ouvre, si le
 * pointeur sait survoler. Sur une colonne, un clic referme l'ouvert.
 */
export function activerVolets(racine = document) {
  racine.querySelectorAll("[data-volets]").forEach((volets) => {
    const onglets = [...volets.querySelectorAll(".volets__onglet")];
    if (!onglets.length) return;
    const panneaux = onglets.map((o) => volets.querySelector(`#${CSS.escape(o.getAttribute("aria-controls"))}`));
    // La disposition est lue dans la feuille : deux colonnes = côte à côte.
    const coteACote = () => getComputedStyle(volets).gridTemplateColumns.trim().split(/\s+/).length > 1;
    let ouvert = Math.min(Number(volets.dataset.ouvert) || 0, onglets.length - 1);
    const montrer = (rang) => {
      ouvert = rang;
      onglets.forEach((o, k) => o.setAttribute("aria-expanded", String(k === rang)));
      panneaux.forEach((p, k) => { p.hidden = k !== rang; });
      volets.dataset.ouvert = String(rang);
    };
    volets.classList.add("est-actif");
    montrer(ouvert);
    const survol = window.matchMedia("(hover: hover)");
    onglets.forEach((onglet, rang) => {
      onglet.addEventListener("click", () => {
        if (rang !== ouvert) return montrer(rang);
        if (!coteACote()) montrer(-1);
      });
      onglet.addEventListener("mouseenter", () => { if (survol.matches && coteACote() && rang !== ouvert) montrer(rang); });
      onglet.addEventListener("keydown", (e) => {
        const pas = { ArrowDown: 1, ArrowUp: -1 }[e.key];
        if (!pas) return;
        e.preventDefault();
        const suivant = (rang + pas + onglets.length) % onglets.length;
        onglets[suivant].focus();
        if (coteACote()) montrer(suivant);
      });
    });
    // En repassant sur deux colonnes, un volet doit rester ouvert.
    window.addEventListener("resize", () => { if (ouvert < 0 && coteACote()) montrer(0); });
  });
}
