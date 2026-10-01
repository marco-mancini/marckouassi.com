/**
 * Service de démonstration : même interface que supabase.js, sans réseau.
 * Sert aux tests et à essayer le back-office avant la configuration de
 * Supabase. Le brouillon vit dans ce navigateur (localStorage) ; la
 * publication est simulée. Aucun mot de passe n'est vérifié : ce mode
 * n'est actif que si le build l'a demandé (ADMIN_DEMO=1), et il ne
 * touche à aucune donnée réelle.
 */
const CLE = "mk-admin-demo";

function lire() {
  try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch { return {}; }
}
function ecrire(etat) {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* stockage plein : la démonstration continue en mémoire */ }
}

export function creerServiceDemo() {
  const apercus = new Map();
  return {
    demo: true,
    async session() { return lire().session || null; },
    async connecter(courriel) {
      const etat = lire();
      etat.session = { courriel };
      ecrire(etat);
      return etat.session;
    },
    async deconnecter() { const etat = lire(); delete etat.session; ecrire(etat); },
    async charger() { return lire().documents || {}; },
    async enregistrer(cle, contenu, revision) {
      const etat = lire();
      etat.documents ||= {};
      const actuelle = etat.documents[cle]?.revision ?? null;
      if (actuelle !== (revision ?? null)) { const e = new Error("conflit"); e.code = "conflit"; throw e; }
      etat.documents[cle] = { contenu, revision: (revision ?? 0) + 1 };
      ecrire(etat);
      return etat.documents[cle].revision;
    },
    async publications() { return lire().publications || []; },
    async publier() {
      const etat = lire();
      etat.publications ||= [];
      const version = (etat.publications[0]?.version || 0) + 1;
      etat.publications.unshift({ version, statut: "en_ligne", cree_le: new Date().toISOString() });
      ecrire(etat);
      return { version };
    },
    async televerser(fichier, surProgression = () => {}) {
      const extension = (fichier.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const src = `stockage:medias/demo-${crypto.randomUUID()}.${extension}`;
      for (const pas of [25, 50, 75, 100]) { surProgression(pas); await new Promise((r) => setTimeout(r, 30)); }
      apercus.set(src, URL.createObjectURL(fichier));
      return src;
    },
    urlMedia(src) { return apercus.get(src) || null; },
  };
}
