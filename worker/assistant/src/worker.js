/**
 * POINT D'ENTRÉE DU WORKER DÉPLOYÉ.
 *
 * Il n'existe que pour une raison : importer le prompt système comme module
 * texte, ce que Wrangler sait faire (règle `Text` de wrangler.jsonc) et que
 * Node ne sait pas. Toute la logique vit dans index.js, qui reste donc
 * testable sous Node, sans wrangler, sans réseau et sans clé.
 *
 * Aucun secret ici : `MISTRAL_CLE` arrive par `env`, et ne traverse que
 * l'en-tête `Authorization` de mistral.js.
 */
import modeleSysteme from "../prompt/systeme.fr.md";
import { servir } from "./index.js";

export default {
  fetch(request, env, ctx) {
    return servir({ request, env, ctx, modeleSysteme });
  },
};
