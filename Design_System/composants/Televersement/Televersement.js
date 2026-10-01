import { html, attributs, classes, formater } from "../../fondations/rendu.js";
import { Media } from "../Media/Media.js";
import { Message } from "../Message/Message.js";

/**
 * Types acceptés par nature. Le SVG est exclu : il peut porter du script.
 * Ce sont des constantes techniques, pas du contenu.
 */
export const TYPES_ACCEPTES = {
  image: ["image/png", "image/jpeg", "image/webp"],
  video: ["video/mp4", "video/webm"],
  document: ["application/pdf"],
};

/**
 * Televersement — déposer, choisir, prévisualiser, suivre, remplacer.
 * L'affichage du média reste le travail de Media ; ce composant porte l'action.
 *
 * @param {object} p
 * @param {string} p.id
 * @param {"image"|"video"|"document"} [p.accepte]
 * @param {object|null} [p.media]                 média actuel (aperçu)
 * @param {{progression?:number|null, erreur?:string, succes?:string}} [p.etat]
 * @param {{choisir:string, remplacer:string, deposer:string, aide?:string, progression:string}} p.libelles
 */
export function Televersement({ id, accepte = "image", media = null, etat = {}, libelles }) {
  const enCours = typeof etat.progression === "number";
  return html`<div${attributs({ class: classes("televersement", enCours && "est-en-cours", etat.erreur && "est-en-erreur"), "data-televersement": true, "aria-busy": enCours ? "true" : null })}>${media ? html`<div class="televersement__apercu">${Media({ media, cadre: "detail", ajustement: accepte === "document" ? "contenir" : "recadrer" })}</div>` : ""}<label class="televersement__zone"${attributs({ for: id })}><span class="televersement__action">${media ? libelles.remplacer : libelles.choisir}</span><span class="televersement__consigne">${libelles.deposer}</span>${libelles.aide ? html`<span class="televersement__aide">${libelles.aide}</span>` : ""}</label><input${attributs({ id, type: "file", class: "televersement__fichier", accept: TYPES_ACCEPTES[accepte].join(","), disabled: enCours })}>${enCours ? html`<progress${attributs({ max: 100, value: etat.progression, "aria-label": formater(libelles.progression, { pourcentage: etat.progression }) })}></progress>` : ""}${etat.erreur ? Message({ type: "erreur", texte: etat.erreur }) : ""}${etat.succes ? Message({ type: "succes", texte: etat.succes }) : ""}</div>`;
}

/** Navigateur : choix au clic ou au clavier, et dépôt par glisser. Rappel avec le fichier. */
export function activerTeleversement(racine, surFichier) {
  const zone = racine.querySelector(".televersement__zone");
  const champ = racine.querySelector(".televersement__fichier");
  champ?.addEventListener("change", () => champ.files[0] && surFichier(champ.files[0]));
  zone?.addEventListener("dragover", (evenement) => { evenement.preventDefault(); zone.classList.add("est-survole"); });
  zone?.addEventListener("dragleave", () => zone.classList.remove("est-survole"));
  zone?.addEventListener("drop", (evenement) => {
    evenement.preventDefault();
    zone.classList.remove("est-survole");
    const fichier = evenement.dataTransfer?.files?.[0];
    if (fichier) surFichier(fichier);
  });
}
