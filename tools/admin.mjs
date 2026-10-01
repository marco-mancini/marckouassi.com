/**
 * ADMIN — assemble le back-office dans _site/admin.
 *
 *   Admin/ (script, services)  → _site/admin/
 *   gabarit PageAdmin          → _site/admin/index.html (textes du dictionnaire)
 *   configuration PUBLIQUE     → _site/admin/config.js
 *   client supabase-js (UMD)   → _site/admin/vendor/supabase.js
 *   contenu du dépôt           → _site/admin/amorce/*.json (premier import)
 *
 * Aucune clé secrète n'est jamais écrite : seules l'adresse du projet et
 * la clé publique (protégée par les règles RLS) le sont.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { creerContexte } from "../Design_System/i18n/langue.js";
import { PageAdmin } from "../Design_System/gabarits/Admin/Ecrans.js";
import { DOCUMENTS } from "../Design_System/gabarits/donnees.js";

/**
 * Vrai pour une clé secrète Supabase : nouvelle clé « sb_secret_… », ou
 * ancienne clé JWT dont le rôle (encodé dans la clé) est « service_role ».
 */
export function estCleSecrete(cle) {
  if (!cle) return false;
  if (cle.startsWith("sb_secret_")) return true;
  const [, charge] = cle.split(".");
  if (!charge) return false;
  try { return JSON.parse(Buffer.from(charge, "base64url").toString("utf8")).role === "service_role"; } catch { return false; }
}

export async function construireAdmin({ racine, sortie, env, contenu, sprite }) {
  const source = path.join(racine, "Admin");
  try { await fs.access(source); } catch { return; }
  const cible = path.join(sortie, "admin");
  await fs.cp(source, cible, { recursive: true, filter: (chemin) => !chemin.endsWith(".md") });

  const fr = JSON.parse(await fs.readFile(path.join(racine, "Design_System/i18n/admin.fr.json"), "utf8"));
  const ctx = creerContexte({ langue: "fr", langueParDefaut: "fr", dictionnaires: { fr } });
  const nom = contenu.site.identite.nom?.fr ?? contenu.site.identite.nom;
  await fs.writeFile(path.join(cible, "index.html"), String(PageAdmin({ ctx, nom, sprite })));

  const config = {
    supabaseUrl: env.ADMIN_SUPABASE_URL || env.SUPABASE_URL || null,
    supabaseClePublique: env.ADMIN_SUPABASE_CLE_PUBLIQUE || env.SUPABASE_CLE_PUBLIQUE || null,
    demo: env.ADMIN_DEMO === "1",
  };
  if (estCleSecrete(config.supabaseClePublique)) throw new Error("Clé secrète refusée dans la configuration publique du back-office : utilisez la clé publique (anon ou sb_publishable_).");
  await fs.writeFile(path.join(cible, "config.js"), `/* Généré au build : configuration PUBLIQUE du back-office. */\nexport const CONFIG = ${JSON.stringify(config, null, 2)};\n`);

  await fs.mkdir(path.join(cible, "amorce"), { recursive: true });
  for (const cle of DOCUMENTS) await fs.writeFile(path.join(cible, "amorce", `${cle}.json`), JSON.stringify(contenu[cle]));

  await fs.mkdir(path.join(cible, "vendor"), { recursive: true });
  await fs.copyFile(path.join(racine, "node_modules/@supabase/supabase-js/dist/umd/supabase.js"), path.join(cible, "vendor", "supabase.js"));
}
