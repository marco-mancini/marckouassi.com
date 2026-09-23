# marckouassi.com

Portfolio personnel de Marc Kouassi — directeur artistique.

## Structure

```text
Backend/              Futur backend/API (aucun backend nécessaire aujourd’hui)
Deploy/               Notes sur la publication
Design_System/        Tokens et règles visuelles partagées
Docs/                 Documentation éditoriale et consignes de mise à jour
Frontend/             Page, styles et interactions du site
Public/images/        Emplacement des visuels locaux
.github/workflows/    Workflow GitHub Pages (doit rester ici pour être exécuté)
```

Le site est une page statique, sans framework ni dépendance à installer. Le workflow assemble les fichiers de `Frontend/`, `Design_System/` et `Public/` dans un dossier de publication.

## Contenus provisoires

Les projets, leurs dates, le parcours, le portrait et les coordonnées sont indiqués comme provisoires dans la page. La liste complète des éléments à remplacer est dans [Docs/CONTENT_CHECKLIST.md](Docs/CONTENT_CHECKLIST.md).

## GitHub Pages

Le workflow `.github/workflows/pages.yml` publie à chaque mise à jour de `main`. Dans **Settings → Pages → Build and deployment**, choisissez **GitHub Actions** comme source pour activer la publication.