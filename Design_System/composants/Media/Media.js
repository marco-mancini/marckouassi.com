import { html, attributs, classes } from "../../fondations/rendu.js";

/**
 * Media — une image, une vidéo ou un emplacement vide, avec dimensions
 * et texte alternatif issus des données.
 *
 * @param {object} p
 * @param {{type?:"image"|"video", src?:string, largeur?:number, hauteur?:number,
 *          alt?:string, poster?:string, lang?:string, pistes?:Array}} p.media
 *        `lang` : langue du texte alternatif quand il vient d'une autre langue que la page
 * @param {"recadrer"|"contenir"} [p.ajustement]
 * @param {"aucun"|"arrondi"|"vignette"|"detail"|"passe-partout"} [p.cadre]
 * @param {boolean} [p.zoom]        léger agrandissement au survol
 * @param {boolean} [p.priorite]    image visible au chargement : pas de chargement différé
 */
export function Media({ media = {}, ajustement = "recadrer", cadre = "aucun", zoom = false, priorite = false }) {
  const classe = classes("media", `media--${ajustement}`, `media--${cadre}`, zoom && "media--zoom", !media.src && "media--absent");
  // Média absent : l'emplacement est conservé, décrit s'il a un texte, sans image cassée.
  if (!media.src) {
    return html`<figure${attributs({ class: classe, role: media.alt ? "img" : null, "aria-label": media.alt || null, "aria-hidden": media.alt ? null : "true" })}></figure>`;
  }
  if (media.type === "video") {
    return html`<figure class="${classe}"><video${attributs({
      controls: true, playsinline: true, preload: "metadata", poster: media.poster || null,
      width: media.largeur || null, height: media.hauteur || null, "aria-label": media.alt || null, lang: media.lang || null,
    })}><source${attributs({ src: media.src, type: media.mime || "video/mp4" })}>${(media.pistes || []).map((piste) => html`<track${attributs({ kind: piste.type || "captions", src: piste.src, srclang: piste.langue, label: piste.libelle })}>`)}</video></figure>`;
  }
  return html`<figure class="${classe}"><img${attributs({
    src: media.src, alt: media.alt ?? "", width: media.largeur || null, height: media.hauteur || null,
    loading: priorite ? "eager" : "lazy", decoding: "async", fetchpriority: priorite ? "high" : null, lang: media.lang || null,
  })}></figure>`;
}
