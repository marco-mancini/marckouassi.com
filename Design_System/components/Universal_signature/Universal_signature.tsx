/**
 * Universal_signature
 *
 * Gabarit d'interface du composant. Il n'est PAS compile : le site est un
 * document HTML statique et le depot n'a ni React ni TypeScript installes.
 * Il sert de reference de structure et de nommage, le rendu vivant etant
 * porte par Universal_signature.css.
 */

type ProprietesSignature = {
  /** La salutation manuscrite, posee en cursive au-dessus des deux mots. */
  salutation: string;
  /** Le mot accentue, en dore. */
  motAccent: string;
  /** Le second mot, dans la couleur du texte. */
  mot: string;
  /** Niveau de titre reel de la planche. */
  niveau?: "h1" | "h2";
  /** Alignement contre le bord droit. */
  droite?: boolean;
  /** Point colore de fin de titre, comme sur les autres planches. */
  point?: boolean;
  id?: string;
};

export function Universal_signature({
  salutation,
  motAccent,
  mot,
  niveau = "h2",
  droite = false,
  point = true,
  id,
}: ProprietesSignature) {
  const Titre = niveau;
  return (
    <Titre
      id={id}
      className={`Universal_signature${droite ? " Universal_signature--droite" : ""}`}
    >
      <span className="Universal_signature-salut">{salutation}</span>
      <span className="Universal_signature-mot Universal_signature-mot--accent">
        {motAccent}
      </span>
      <span className="Universal_signature-mot">
        {mot}
        {point && (
          <b className="title-dot" aria-hidden="true">
            .
          </b>
        )}
      </span>
    </Titre>
  );
}
