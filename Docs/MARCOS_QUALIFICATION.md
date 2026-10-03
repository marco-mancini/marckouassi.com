# MarcoS — contrat de qualification commerciale

Statut : spécification issue de PM-109, à appliquer aux phases PM-110 à PM-114.
La qualification complète un échange conversationnel ; elle ne remplace pas le
mode de réponse publique de MarcoS.

## Sources et limites

Les contextes proposés correspondent aux offres réellement publiées dans
`content/sections.json`, section `type: prestations`, propriété `offres` :
identité de marque, direction artistique, design UX/UI et édition & supports.
Cette source reste seule maîtresse des offres et de leurs intitulés. La matrice
ci-dessous définit les besoins de qualification, pas une seconde liste
d'offres à afficher. Une demande qui ne correspond pas clairement à une offre
reste « autre / à préciser » jusqu'à clarification ; ne pas inventer une
prestation.

Les règles métier de ce contrat :

- MarcoS est l'assistant ; Marc est désigné « M. Kouassi ».
- Une information déjà donnée n'est pas redemandée. Une question regroupe les
  champs manquants qui vont naturellement ensemble ; pas de questionnaire en
  rafale.
- Distinguer les faits communiqués par le prospect des pistes suggérées par
  MarcoS et des décisions réservées à M. Kouassi.
- Une coordonnée n'est demandée qu'après accord explicite du visiteur pour être
  recontacté. Elle n'est jamais recherchée, déduite ni enrichie ailleurs.
- « Non communiqué » signifie absent de l'échange, pas une valeur à compléter.
  Les champs non pertinents sont marqués « sans objet » ; les champs connus
  restent fidèles aux mots du prospect.
- Ne pas promettre prix, délai, disponibilité ou résultat. Le tarif publié est
  « Sur devis ».

## Socle commun du brief

| Groupe | Champs à recueillir si pertinents | Règle |
|---|---|---|
| Prospect | nom, entreprise/marque, fonction | facultatifs ; seulement fournis volontairement |
| Recontact | accord de recontact, email, téléphone/WhatsApp | accord avant demande ; ne pas exiger plusieurs canaux |
| Demande | nature, contexte/problème, objectif, cible, périmètre | préciser le besoin avant de déclarer le brief exploitable |
| Création | livrables, supports/canaux, direction souhaitée, références, éléments existants à conserver | conserver les préférences comme déclarations, pas comme décisions de M. Kouassi |
| Contraintes | échéance, budget, production/technique, autres contraintes | budget seulement s'il est communiqué ; aucune estimation inventée |
| Qualification | urgence, maturité, décideur, prochaine étape souhaitée | ne retenir que les éléments explicitement établis |
| Synthèse | résumé fidèle, faits importants, manques, choix/hésitations, prochaine action | séparer les faits des suggestions de MarcoS |

Un brief est exploitable pour une première reprise lorsque la nature du projet,
le besoin/contexte, l'objectif et le périmètre ou les livrables sont assez
clairs pour que M. Kouassi comprenne ce qui est demandé. Les coordonnées ne sont
pas une condition de compréhension du brief et ne sont présentes qu'avec accord
de recontact. Sinon, le brief reste « à compléter » et énumère les informations
manquantes, sans déclarer le prospect prêt à être contacté.

## Matrice des contextes

Les titres de contexte ci-dessous sont ceux des offres dans le contenu FR/EN.
Le routage ne doit jamais dépendre d'une comparaison codée en dur avec ces
libellés : le modèle de données doit fournir un identifiant stable à chaque
offre et ses questions/critères de qualification (FR/EN). L'absence de ces
champs signifie que MarcoS utilise le socle commun et demande une précision,
sans deviner une matrice.

| Contexte éditorial | Déclencheur et objectif à clarifier | Questions essentielles, progressivement | Spécifiques optionnels / contraintes | Brief exploitable quand… |
|---|---|---|---|---|
| Identité de marque | demande de créer/revoir une identité ou un logotype ; comprendre marque, enjeu et usage | Quel est le nom et que fait la marque ? Qu'est-ce qui motive la création ou l'évolution ? À qui s'adresse-t-elle ? Quels éléments/livrables sont attendus ? | positionnement, personnalité, usages, supports prioritaires, éléments à conserver, références, décideurs, budget et échéance si communiqués | marque et besoin sont compris, avec objectif et périmètre/livrables identifiables |
| Direction artistique | demande de campagne, d'univers visuel ou de direction de prises de vue ; clarifier message et déploiement | Que faut-il faire comprendre ou retenir ? À qui ? Quelle campagne ou quels contenus sont attendus ? Sur quels supports/canaux ? | concept déjà défini, ton, formats, prises de vue, calendrier, équipe/production, déclinaisons et références | objectif/message, cible, nature de la campagne et livrables/supports sont suffisamment définis |
| Design UX/UI | demande d'expérience numérique, de site ou d'interface ; clarifier utilisateurs et parcours | Quel produit/service et quel problème utilisateur ? Qui l'utilise ? Quel parcours ou résultat doit être amélioré ? Quelles interfaces/livrables sont attendus ? | existant à auditer/conserver, plateforme/intégrations si connues, contenu disponible, composants, contraintes techniques, équipe de développement, échéance | problème/utilisateurs, objectif du parcours et périmètre des écrans/livrables sont clairs |
| Édition & supports | demande de document, support imprimé ou packaging ; clarifier contenu, formats et production | Quel support faut-il produire ? Pour quel usage et quel public ? Le contenu existe-t-il ? Quels formats/quantités ou livrables sont souhaités ? | dimensions, pagination, finitions, imprimeur, quantités, fichiers existants, contraintes de fabrication, livraison et échéance | support, usage, contenu ou état de celui-ci, et livrable/périmètre sont connus |
| Autre / à préciser | demande ne correspondant pas sans ambiguïté aux offres publiées, ou besoin encore flou | Quel résultat cherchez-vous ? Dans quel contexte ? Qu'aimeriez-vous que M. Kouassi prenne en charge ? | reprendre les éléments du socle commun, sans créer de catégorie ni de prestation | la demande réelle et le périmètre sont reformulés et confirmés par le visiteur |

Ces questions sont des exemples de collecte, non un formulaire obligatoire.
Sauter tout champ déjà fourni, non pertinent ou que le visiteur ne souhaite pas
communiquer. Si un champ nécessaire manque, poser la prochaine question utile ;
si le visiteur ne sait pas, noter « non communiqué » et poursuivre sans
insistance.

## Fin de qualification et reprise

Avant de produire le brief, résumer le besoin en peu de mots et demander une
confirmation/correction. La confirmation est une vérification, pas une
autorisation d'inventer les champs vides. Le résultat comporte :

1. les faits du socle commun et du contexte retenu ;
2. les suggestions de MarcoS, clairement séparées des choix du prospect ;
3. les hésitations et choix laissés à M. Kouassi ;
4. chaque champ absent pertinent marqué « non communiqué » ;
5. une prochaine action descriptive, sans prétendre qu'un contact est convenu.

Le brief ne déclenche aucun email à lui seul. L'envoi relève de PM-112 et exige
à la fois un brief suffisamment clair, l'accord de recontact et une coordonnée
fournie volontairement.

## Contrat d'implémentation

Les offres portent maintenant dans `content/sections.json` un `id` stable et
des champs `qualification` traduits (`declencheur`, questions référant aux
champs génériques). Le validateur de contenu refuse un identifiant invalide ou
dupliqué, une question sans champ unique ou sans texte français. L'anglais
utilise le repli/fichier « à traduire » existant ; les offres actuelles ont
toutes leur traduction. `baseQualification()` reprend ces données éditoriales
dans un fichier séparé de la base générale ; le code ne compare pas les libellés
FR/EN et ne contient aucune liste de catégories métier. Le schéma
commun du brief est défini une seule fois dans PM-110 ; le rendu email de
PM-112 le consommera au lieu de le redéfinir.

Le module `worker/assistant/src/qualification.js` porte le schéma commun du
brief et ses contrôles : liste blanche de champs, valeurs limitées à 500
caractères, citations exactes issues des messages `user`, et accord de
recontact explicite avec preuve. Les hésitations, choix du prospect et décisions
laissées à l'expert sont des champs distincts du socle. La confirmation du brief
est séparée du consentement au recontact. Il garde les absences sous forme `null` dans
les données ; le rendu les localise en « non communiqué ». `creerBrief()` ne
déclare le brief exploitable qu'avec nature, contexte, besoin, objectif et
périmètre (ou livrables) ; il produit une synthèse à partir des seuls extraits,
une prochaine action stable et le rôle de reprise `expert`. Le module est pur et
ne persiste rien. `POST /api/assistant` accepte le brief qualifié, le valide
avant l'appel au modèle et renvoie le brief structuré avec la réponse.

La validation de ce modèle est une protection contre les erreurs d'assemblage,
pas une preuve cryptographique de l'historique : l'API reste sans état côté
serveur conformément à D-10. La conservation de l'état compacté entre les
requêtes et son intégration à la conversation font partie du cadrage PM-114.

### Vérifications minimales

- Un scénario par offre réelle, plus une demande ambiguë/hors correspondance.
- Les questions ignorent les informations déjà communiquées.
- Aucun champ absent n'est inventé ; les absences pertinentes sont explicites.
- Les faits, suggestions et décisions laissées à M. Kouassi restent distincts.
- Une coordonnée n'est demandée/transmise qu'après accord explicite de
  recontact ; aucun enrichissement externe.
- Le brief est relu par le visiteur avant la reprise ; une demande incomplète
  n'est pas déclarée exploitable.
- Les mêmes règles s'appliquent en français et en anglais.
