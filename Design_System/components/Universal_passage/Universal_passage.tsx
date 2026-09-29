import "./Universal_passage.css";

type ProprietesPassage = {
  /** Ce que la planche suivante apporte au recit. */
  promesse: string;
  /** Numero et nom de la planche visee, « 02 / A propos ». */
  destination: string;
  /** Ancre de la planche visee. */
  href: string;
  /** Planche olive : le composant y lit des textes clairs. */
  surOlive?: boolean;
};

export function Universal_passage({ promesse, destination, href, surOlive = false }: ProprietesPassage) {
  const classes = ["board-passage", surOlive ? "ilot-olive" : ""].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <p className="board-passage-promesse">{promesse}</p>
      <a className="board-passage-lien" href={href}>
        {destination} <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}
