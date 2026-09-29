import type { ReactNode } from "react";
import "./Universal_carte.css";

type ProprietesCarte = {
  /** Numero affiche en filigrane, deux chiffres. */
  rang: string;
  /** Libelle de la carte. */
  libelle: ReactNode;
  /** Fond de la planche qui porte la carte. */
  surOlive?: boolean;
  /** Balise racine : li dans une frise, article dans une grille. */
  balise?: "li" | "article" | "div";
  /** Balise du libelle : h3 quand c'est un vrai titre. */
  baliseLibelle?: "span" | "h3";
};

export function Universal_carte({
  rang,
  libelle,
  surOlive = false,
  balise: Racine = "article",
  baliseLibelle: Libelle = "span",
}: ProprietesCarte) {
  const classes = ["Universal_carte", surOlive ? "Universal_carte--sur-olive" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Racine className={classes} data-rang={rang}>
      <span className="Universal_carte-reflet" aria-hidden="true" />
      <span className="Universal_carte-point" aria-hidden="true" />
      <Libelle className="Universal_carte-libelle">{libelle}</Libelle>
    </Racine>
  );
}
