# Conversation

Journal d'échanges accessible pour MarcoS.

## Contrat

- `echanges` : tableau des tours `visiteur|assistant`.
- `etiquette` : nom accessible du journal.
- `libelles` : étiquettes des deux rôles.
- `vide` : contenu HTML d'accueil.

Maximum 4 props. Aucun texte éditorial en dur. Aucun fond ou style métier par rôle.

Rendu : `<div role="log" aria-live="polite" aria-relevant="additions">` qui
enveloppe un `<ol class="conversation__tours">`.

Le rôle `log` porte sur l'**enveloppe**, jamais sur la liste. Posé sur le
`<ol>`, il écrase la sémantique de liste et laisse les `<li>` orphelins —
axe-core le relève en « serious » (règle `listitem`). L'annonce aux lecteurs
d'écran est identique ; la liste reste une liste.
