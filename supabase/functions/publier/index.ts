/**
 * Edge Function « publier » — seul point d'écriture des publications.
 *
 *   POST { action: "publier" }   (jeton de session d'un administrateur)
 *     1. vérifie la session ET l'appartenance aux administrateurs ;
 *     2. fige le brouillon (4 documents) en un instantané numéroté ;
 *     3. déclenche le flux GitHub « publier » (repository_dispatch).
 *
 *   POST { action: "statut", version, statut, message }   (en-tête x-publication-secret)
 *     appelé par le flux GitHub à la fin du build : en_ligne ou echec.
 *     Une mise en ligne marque « remplacee » les versions plus anciennes en attente.
 *
 * Secrets (supabase secrets set …) : GITHUB_DEPOT (« propriétaire/dépôt »),
 * GITHUB_JETON (jeton à portée fine : Contents en écriture sur ce seul dépôt),
 * PUBLICATION_SECRET (partagé avec le flux GitHub), ORIGINE_ADMIN (ex. https://marckouassi.com).
 * SUPABASE_URL, SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY sont fournis par Supabase.
 * La clé secrète ne quitte jamais cette fonction.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const DOCUMENTS = ["site", "sections", "projets", "cv"];
const STATUTS_FINAUX = ["en_ligne", "echec"];

const env = (nom: string) => Deno.env.get(nom) ?? "";
const origine = env("ORIGINE_ADMIN") || "*";
const entetes = {
  "Access-Control-Allow-Origin": origine,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const reponse = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut, headers: entetes });

/** Comparaison à temps constant (le secret partagé ne doit pas fuir par la durée). */
function egal(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

Deno.serve(async (requete) => {
  if (requete.method === "OPTIONS") return new Response(null, { headers: entetes });
  if (requete.method !== "POST") return reponse({ erreur: "methode" }, 405);

  const serveur = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  let corps: Record<string, unknown>;
  try { corps = await requete.json(); } catch { return reponse({ erreur: "corps" }, 400); }

  // --- Retour du flux GitHub ------------------------------------------
  if (corps.action === "statut") {
    if (!egal(requete.headers.get("x-publication-secret") ?? "", env("PUBLICATION_SECRET"))) return reponse({ erreur: "secret" }, 401);
    const version = Number(corps.version);
    const statut = String(corps.statut);
    if (!Number.isInteger(version) || !STATUTS_FINAUX.includes(statut)) return reponse({ erreur: "parametres" }, 400);
    const { error } = await serveur.from("publications")
      .update({ statut, message: corps.message ? String(corps.message).slice(0, 2000) : null, termine_le: new Date().toISOString() })
      .eq("version", version);
    if (error) return reponse({ erreur: "base" }, 500);
    if (statut === "en_ligne") {
      await serveur.from("publications").update({ statut: "remplacee" }).lt("version", version).in("statut", ["en_attente", "en_ligne"]);
    }
    return reponse({ version, statut });
  }

  if (corps.action !== "publier") return reponse({ erreur: "action" }, 400);

  // --- Publication demandée depuis le back-office ---------------------
  const jeton = (requete.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: utilisateur, error: erreurSession } = await serveur.auth.getUser(jeton);
  if (erreurSession || !utilisateur?.user) return reponse({ erreur: "session" }, 401);
  const { data: admin } = await serveur.from("administrateurs").select("user_id").eq("user_id", utilisateur.user.id).maybeSingle();
  if (!admin) return reponse({ erreur: "droits" }, 403);

  const { data: documents, error: erreurDocuments } = await serveur.from("documents").select("cle, contenu");
  if (erreurDocuments) return reponse({ erreur: "base" }, 500);
  const instantane = Object.fromEntries((documents ?? []).map((d) => [d.cle, d.contenu]));
  const manquants = DOCUMENTS.filter((cle) => !instantane[cle]);
  if (manquants.length) return reponse({ erreur: "incomplet", manquants }, 422);

  // Numéro suivant ; la contrainte d'unicité protège de deux clics simultanés.
  const { data: derniere } = await serveur.from("publications").select("version").order("version", { ascending: false }).limit(1).maybeSingle();
  const version = (derniere?.version ?? 0) + 1;
  const { error: erreurInsertion } = await serveur.from("publications").insert({ version, instantane, cree_par: utilisateur.user.id });
  if (erreurInsertion) return reponse({ erreur: erreurInsertion.code === "23505" ? "concurrence" : "base" }, 409);

  const declenchement = await fetch(`https://api.github.com/repos/${env("GITHUB_DEPOT")}/dispatches`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("GITHUB_JETON")}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "portfolio-publier" },
    body: JSON.stringify({ event_type: "publier", client_payload: { version } }),
  });
  if (!declenchement.ok) {
    await serveur.from("publications").update({ statut: "echec", message: `GitHub ${declenchement.status}`, termine_le: new Date().toISOString() }).eq("version", version);
    return reponse({ erreur: "declenchement", version }, 502);
  }
  return reponse({ version });
});
