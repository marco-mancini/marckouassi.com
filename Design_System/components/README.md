# Composants

Un dossier par composant. Chacun réunit sa feuille de style `.css` et son
gabarit React `.tsx`, sous le même nom que le dossier.

```
components/
  Universal_planche/     le cadre de planche, 7 usages
  Universal_topline/     la ligne de crédit en tête de planche, 6 usages
  Universal_surtitre/    le sur-titre en capitales mono, 5 usages
  Universal_pointtitre/  le point doré de fin de titre, 7 usages
  Universal_relief/      le fragment doré dans un texte courant, 2 planches
  Universal_carte/       la carte jalon numérotée, 2 planches
  Bouton/                exemple de départ, pas encore employé dans la page
```

Un composant entre ici quand il sert sur **plusieurs planches**. Ce qui n'existe
qu'à un seul endroit reste dans `Design_System/styles/Layout.css`.

## Ce qui est vivant, ce qui ne l'est pas

Les `.css` sont **réellement chargés** : `Design_System/styles/Index.css` les
importe, et ce sont eux qui habillent la page publique.

Les `.tsx` ne sont **pas compilés**. Le site est un document HTML statique et le
dépôt n'a ni React ni TypeScript installés. Ils décrivent l'interface du
composant — ses propriétés, ses variantes, son balisage — et serviront de point
de départ si une interface React est introduite. Le balisage de référence est
donc celui écrit en tête de chaque `.css`.

## Règle de style

Aucune valeur en dur dans ces fichiers : tout passe par les jetons de
`Design_System/styles/Tokens.css`.
