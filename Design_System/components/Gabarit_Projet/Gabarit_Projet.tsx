import "./Gabarit_Projet.css";

/**
 * Gabarit_Projet — la reference React du gabarit.
 *
 * Le site publie est statique : c'est Frontend/script.js qui construit les
 * onze cartes et remplit le dialogue a partir du tableau PROJECTS. Ce
 * fichier decrit le meme balisage, pour qu'une migration ulterieure parte
 * du gabarit et non d'une relecture du script.
 */

type Visuel = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type Projet = {
  /** Identifiant, porte par le bouton d'ouverture. */
  id: string;
  /** Rubrique, au-dessus du titre dans l'etude. */
  category: string;
  title: string;
  year: string;
  context: string;
  role: string;
  disciplines: string;
  /** L'intention creative. */
  idea: string;
  /** La valeur du projet. */
  value: string;
  images: Visuel[];
  /** Document a telecharger, quand le projet en porte un. */
  document?: { src: string; label: string };
};

/** Nombre d'images de l'apercu. Au-dela de six, la carte n'en montre pas plus. */
const APERCU_MAX = 6;

function Image({ visuel, className }: { visuel: Visuel; className: string }) {
  return (
    <figure className={className}>
      <img src={visuel.src} alt={visuel.alt} width={visuel.width} height={visuel.height} loading="lazy" />
    </figure>
  );
}

/** La carte du sommaire. */
export function Gabarit_Projet_carte({ projet, rang }: { projet: Projet; rang: number }) {
  const apercu = projet.images.slice(0, APERCU_MAX);
  const numero = String(rang).padStart(2, "0");

  return (
    <article className="project-card">
      <div className="project-gallery-preview" data-count={String(apercu.length)}>
        {apercu.map((visuel, index) => (
          <Image
            key={visuel.src}
            visuel={visuel}
            className={index === 0 ? "project-image project-image--lead" : "project-image project-image--thumb"}
          />
        ))}
        <button
          className="project-enter"
          type="button"
          data-project-open={projet.id}
          aria-haspopup="dialog"
          aria-label={`Entrer dans le projet ${projet.title} pour voir l’étude complète et toutes ses images`}
        >
          ↗
        </button>
      </div>
      <header className="project-card-heading">
        <span className="project-card-number">{numero}</span>
        <div className="project-card-name">
          <h3>{projet.title}</h3>
          <p>{`${projet.category} · ${projet.year}`}</p>
        </div>
      </header>
    </article>
  );
}

/** L'etude ouverte. Un seul dialogue sert les onze projets. */
export function Gabarit_Projet_etude({ projet, rang, total }: { projet: Projet; rang: number; total: number }) {
  const deuxChiffres = (valeur: number) => String(valeur).padStart(2, "0");

  return (
    <dialog className="project-dialog" id="project-dialog" aria-labelledby="dialog-title">
      <div className="project-dialog-header">
        <p id="dialog-counter">{`Projet ${deuxChiffres(rang)} / ${deuxChiffres(total)}`}</p>
        <button className="project-dialog-close" type="button" data-dialog-close aria-label="Fermer l’étude du projet">
          ×
        </button>
      </div>
      <div className="project-dialog-body">
        <div className="project-detail-copy">
          <p className="board-label" id="dialog-category">{projet.category}</p>
          <h2 id="dialog-title">{projet.title}</h2>
          <p className="project-context" id="dialog-context">{projet.context}</p>
          <div className="project-meta" id="dialog-meta">
            {[["Mon rôle", projet.role], ["Disciplines", projet.disciplines], ["Période", projet.year]].map(
              ([libelle, valeur]) => (
                <div className="project-meta-item" key={libelle}>
                  <span className="project-meta-label">{libelle}</span>
                  <p>{valeur}</p>
                </div>
              )
            )}
          </div>
          <p className="project-copy-label">L’intention créative</p>
          <p className="project-idea" id="dialog-idea">{projet.idea}</p>
          <p className="project-copy-label">La valeur du projet</p>
          <p className="project-value" id="dialog-value">{projet.value}</p>
          {projet.document ? (
            <a className="project-document" id="dialog-document" href={projet.document.src} target="_blank" rel="noreferrer">
              {`${projet.document.label} ↗`}
            </a>
          ) : null}
        </div>
        <div className="project-detail-gallery" id="dialog-gallery" aria-label="Images du projet">
          {projet.images.map((visuel, index) => (
            <Image
              key={visuel.src}
              visuel={visuel}
              className={index === 0 ? "project-detail-image project-detail-image--lead" : "project-detail-image"}
            />
          ))}
        </div>
      </div>
    </dialog>
  );
}
