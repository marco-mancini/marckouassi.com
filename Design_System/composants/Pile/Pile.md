# Pile

**Responsabilité** : empiler des éléments verticalement, ou les aligner en rangée qui se replie, avec un espace pris dans les jetons.

Sert aussi de barre d'actions dans le back-office.

## Props (5)

| Prop | Type | Défaut | Rôle |
|---|---|---|---|
| `elements` | HTML[] | — | Contenu. |
| `direction` | `colonne` \| `ligne` | `colonne` | Axe. |
| `espace` | jeton | `var(--space-4)` | Espacement. |
| `alignement` | `debut` \| `centre` \| `fin` \| `ecarte` | `debut` | Alignement. |
| `balise` | chaîne | `div` | `ul`/`ol` pour une liste. |
