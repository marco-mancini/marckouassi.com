# Jalon (gabarit)

**Responsabilité** : une étape du parcours, avec sa période (une `Pastille`), son intitulé, son récit et son lieu.

## Données

`{ annees: { debut, fin }, titre, texte, lieu }`. Les textes sont traduisibles, les années communes.

La période affichée (« 2025 — 2026 ») est **calculée** avec le format du dictionnaire ; une année seule s'affiche seule.

## Adaptation aux écrans

- Au-dessus de 850 px : trois colonnes (période, récit, lieu), la colonne des périodes à largeur fixe.
- En dessous : la période et le lieu sur la première ligne, le récit sous eux.
