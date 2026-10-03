# Assistant

Assemblage V1 de MarcoS : `Modale` + `Conversation` + formulaire + états.

## Activation

Le gabarit ne rend rien si `assistant.active` est faux ou si `ASSISTANT_URL` n'est pas fournie au build.

## Contraintes

- aucune présence flottante ;
- aucun avatar en V1 ;
- aucune clé côté navigateur ;
- conversation en `sessionStorage` uniquement ;
- réponses affichées comme texte ;
- liens uniquement issus du Worker et internes ;
- trois fichiers maximum pour le composant/gabarit ;
- tous les textes d'interface viennent des dictionnaires ;
- contenu éditorial MarcoS vient de `content/site.json`.
