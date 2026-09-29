import "./Universal_pointtitre.css";

/**
 * Point dore qui ferme un titre de planche. Masque aux technologies
 * d'assistance : il ferme le titre a l'oeil, il ne s'ajoute pas a ce qui est
 * annonce.
 */
export function Universal_pointtitre() {
  return (
    <b className="title-dot" aria-hidden="true">
      .
    </b>
  );
}
