# Assistant

Un seul export de rendu, `Assistant`, et une seule racine d'état : la présence
flottante et le panneau sont le même objet (D-40).

**Deux socles, et pourquoi.** Le buste est `position: absolute; bottom: 100 %`
de son socle : il est **posé** sur son porteur, jamais devant ni derrière. Or
le porteur change — la barre quand c'est fermé, le panneau quand c'est ouvert.
Il faut donc un buste par socle, et un seul est visible à la fois. Un buste
unique qu'on déplacerait devrait changer de parent en cours d'animation.

Voir [AI_UX.md](../../../Docs/AI_UX.md) « La présence flottante et ses états »
pour le parcours complet, et [DECISIONS.md](../../../Docs/DECISIONS.md) → D-40
pour les écarts assumés avec la maquette d'interaction.

## Props (3)

| Prop | Type | Rôle |
|---|---|---|
| `assistant` | objet | `content/site.json` → `assistant` : `active`, `accueil`, `exemples`, `confidentialite`, `avatar.etats`. |
| `ctx` | contexte | `t` pour les libellés, `c` et `l` pour les textes de Marc. |
| `endpoint` | chaîne \| `null` | adresse du Worker, issue de `ASSISTANT_URL` au build. |

## Activation

Le gabarit ne rend **rien** si `assistant.active` est faux ou si `endpoint` est
absent. Tant que Marc n'a pas écrit l'accueil dans Paramètres, MarcoS n'existe
pas pour le visiteur (D-9).

Un exemple dont aucune langue n'est renseignée est ignoré : il ne doit pas
devenir un bouton sans fonction. Le cas se produit quand Marc ajoute une ligne
dans le CMS sans la remplir.

Le bloc `assistant` **n'est pas amorcé dans `content/site.json`** : il est
déclaré facultatif dans `tools/cms.mjs`, donc proposé dans Paramètres même
absent des données. Y poser des valeurs vides les ferait effacer à
l'enregistrement (`omit_empty_optional_fields`), et le champ disparaîtrait de
l'éditeur au build suivant.

## Comportement

`activerAssistant(racine)` est séparé du rendu, comme les études de projet.

Les libellés dont le navigateur a besoin voyagent dans `data-libelles`, à la
manière de `data-frequence` d'Intro et `data-compteur` de Projet_etude : aucun
texte n'est écrit dans le script. Sans ces libellés, le comportement ne
s'active pas, plutôt que d'afficher du texte en dur.

La conversation vit dans `sessionStorage`, pour l'onglet courant seulement.
Lorsque ce stockage est refusé — navigation privée, site bloqué — elle tient en
mémoire le temps de l'onglet : le refus n'interrompt jamais MarcoS. Une valeur
stockée illisible est effacée au lieu de faire échouer l'activation.

« Réessayer » renvoie la **même** question : elle n'est jamais perdue.

### Le pilote d'état

`pilote(lanceur)` est le **seul** système d'état. Il pose `data-etat` sur
`.lanceur` et bascule l'image du buste dans le même geste : c'est ce qui garde
les deux cohérents. Un état sans image déclarée retombe sur celle du repos —
MarcoS ne disparaît jamais.

Une suite programmée (`{ puis, delai }`) est toujours annulable : un nouvel état
posé entre-temps l'emporte, et la file ne s'empile pas. C'est ce qui permet
`reponse → fin → repos` sans jamais figer MarcoS dans un état transitoire.

Les délais sont des constantes exportées (`DELAIS`) : `fin` 1,4 s avant le
retour à `open`, `frappe` 18 ms par caractère. L'écoute ne l'emporte jamais sur
`thinking` ni `responding` — l'état réel bat la frappe.

`data-ouvert` ne se déduit PAS du nom de l'état : il suit l'attribut `open` du
`<dialog>`. C'est ce qui évite le défaut de la maquette, où `end` refermait le
panneau avant que le visiteur ait lu la réponse.

### Deux pièges rencontrés, et leur raison

- **« Effacer » vit dans la barre, donc HORS de `[data-assistant]`.** Il est
  résolu depuis la racine. Il est **désactivé**, pas masqué : la barre garde
  ses trois emplacements et ne change pas de largeur.
- **Les deux socles portent chacun le jeu complet d'expressions.** Une Map
  « nom → image » n'en gardait qu'une, et le buste de la barre ne changeait
  jamais d'expression. Le pilote groupe par nom.

## Contraintes

- le buste et l'onde sont décoratifs (`aria-hidden`, `alt=""`) : aucune information ne passe par l'avatar seul ;
- le nom accessible vit sur le bouton (`aria-label`), jamais écrit deux fois dans l'arbre ;
- aucun chemin de fichier d'avatar dans le gabarit : les expressions viennent de `site.assistant.avatar.etats` ;
- une seule expression chargée au premier affichage ; les autres portent `hidden` et n'arrivent qu'avec leur état ;
- aucune clé ni nom de modèle dans le navigateur ;
- `sessionStorage` uniquement, jamais `localStorage`, jamais de stockage serveur ;
- réponses insérées comme texte ;
- liens uniquement ceux du Worker, s'ils commencent par `/` **et** s'ils ont de quoi se nommer : le Worker renvoie `{id, href}`, le composant affiche `libelle || id`. Sans ce garde-fou, un lien sortait en ancre vide de 2 px, sans nom accessible (WCAG 2.4.4) ;
- tous les textes d'interface viennent des dictionnaires (clé `assistant`) ;
- les textes éditoriaux viennent de `content/site.json` et sont écrits par Marc ;
- aucune valeur en dur : les mesures passent par les jetons.

## Dépendances

`Modale` (variante `ancre`, `modal: false`), `Conversation`, `Saisie`, `Bouton`, `rendu.js`.
