import "./Universal_topline.css";

type ProprietesTopline = {
  /** Numero et nom de la planche, a gauche. */
  rubrique: string;
  /** Mention libre, au centre. */
  mention: string;
  /** Signature, a droite. */
  signature: string;
};

export function Universal_topline({ rubrique, mention, signature }: ProprietesTopline) {
  return (
    <div className="board-topline">
      <span>{rubrique}</span>
      <span>{mention}</span>
      <span>{signature}</span>
    </div>
  );
}
