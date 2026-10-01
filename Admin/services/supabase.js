/**
 * Service Supabase du back-office. C'est le SEUL fichier qui connaît
 * Supabase : les écrans parlent à l'interface commune (voir demo.js).
 *
 * Sécurité : seule la clé PUBLIQUE est utilisée ici. Les droits réels
 * sont portés par les politiques RLS (administrateurs uniquement) ; la
 * publication passe par l'Edge Function « publier », qui vérifie de
 * nouveau l'administrateur côté serveur.
 *
 * Les erreurs remontent avec un code (« identifiants », « nonAdmin »,
 * « reseau », « conflit », « envoi ») : le texte affiché vient du dictionnaire.
 */
const SEAU = "medias";

function erreur(code, cause) {
  const e = new Error(code);
  e.code = code;
  e.cause = cause;
  return e;
}

export function creerServiceSupabase({ url, clePublique }) {
  const client = window.supabase.createClient(url, clePublique, { auth: { persistSession: true, autoRefreshToken: true } });

  async function estAdmin() {
    const { data, error } = await client.rpc("est_admin");
    if (error) throw erreur("reseau", error);
    return data === true;
  }

  return {
    demo: false,

    async session() {
      const { data } = await client.auth.getSession();
      if (!data.session) return null;
      if (!(await estAdmin())) { await client.auth.signOut(); return null; }
      return { courriel: data.session.user.email };
    },

    async connecter(courriel, motdepasse) {
      const { data, error } = await client.auth.signInWithPassword({ email: courriel, password: motdepasse });
      if (error) throw erreur(error.status === 400 || error.status === 401 ? "identifiants" : "reseau", error);
      if (!(await estAdmin())) { await client.auth.signOut(); throw erreur("nonAdmin"); }
      return { courriel: data.user.email };
    },

    async deconnecter() {
      await client.auth.signOut();
    },

    /** Brouillon : { cle: { contenu, revision } } ; un document absent vaut null. */
    async charger() {
      const { data, error } = await client.from("documents").select("cle, contenu, revision");
      if (error) throw erreur("reseau", error);
      return Object.fromEntries(data.map((d) => [d.cle, { contenu: d.contenu, revision: d.revision }]));
    },

    /** Enregistre si personne n'a écrit entre-temps (révision attendue), sinon « conflit ». */
    async enregistrer(cle, contenu, revision) {
      if (revision == null) {
        const { error } = await client.from("documents").insert({ cle, contenu, revision: 1 });
        if (error) throw erreur(error.code === "23505" ? "conflit" : "reseau", error);
        return 1;
      }
      const { data, error } = await client.from("documents").update({ contenu, revision: revision + 1 }).eq("cle", cle).eq("revision", revision).select("revision");
      if (error) throw erreur("reseau", error);
      if (!data.length) throw erreur("conflit");
      return data[0].revision;
    },

    async publications() {
      const { data, error } = await client.from("publications").select("version, statut, cree_le, message").order("version", { ascending: false }).limit(20);
      if (error) throw erreur("reseau", error);
      return data;
    },

    async publier() {
      const { data, error } = await client.functions.invoke("publier", { body: { action: "publier" } });
      if (error || !data?.version) throw erreur("publication", error);
      return { version: data.version };
    },

    /**
     * Envoi d'un fichier au seau « medias », sous un nom aléatoire (jamais
     * le nom d'origine). XMLHttpRequest plutôt que le client : il donne la
     * progression. Renvoie la référence stockée dans le contenu.
     */
    async televerser(fichier, surProgression = () => {}) {
      const { data } = await client.auth.getSession();
      const extension = (fichier.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const nom = `${crypto.randomUUID()}.${extension}`;
      await new Promise((resoudre, rejeter) => {
        const requete = new XMLHttpRequest();
        requete.open("POST", `${url}/storage/v1/object/${SEAU}/${nom}`);
        requete.setRequestHeader("Authorization", `Bearer ${data.session?.access_token}`);
        requete.setRequestHeader("apikey", clePublique);
        requete.setRequestHeader("Content-Type", fichier.type);
        requete.setRequestHeader("x-upsert", "false");
        requete.upload.onprogress = (e) => e.lengthComputable && surProgression(Math.round((e.loaded / e.total) * 100));
        requete.onload = () => (requete.status < 300 ? resoudre() : rejeter(erreur("envoi", requete.responseText)));
        requete.onerror = () => rejeter(erreur("envoi"));
        requete.send(fichier);
      });
      await client.from("medias").insert({ chemin: `${SEAU}/${nom}`, nom_original: fichier.name, type: fichier.type, taille: fichier.size });
      return `stockage:${SEAU}/${nom}`;
    },

    /** Adresse publique d'un média du stockage, pour l'aperçu. */
    urlMedia(src) {
      return src.startsWith("stockage:") ? `${url}/storage/v1/object/public/${src.slice("stockage:".length)}` : null;
    },
  };
}
