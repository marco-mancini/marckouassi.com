/**
 * MESURE D'AUDIENCE — Google Analytics 4 (décision de Marc, sans bandeau).
 *
 * L'identifiant vient de la page (<meta name="mesure-ga4">, tiré de
 * content/site.json → mesure.ga4) : rien n'est écrit ici. La mesure ne part
 * que depuis l'adresse publique du site (celle de l'adresse canonique) :
 * ni les aperçus, ni le poste local, ni les tests ne gonflent l'audience.
 *
 * @param {Document} document
 * @returns {boolean} vrai si la mesure est lancée
 */
export function activerMesure(document) {
  const id = document.querySelector('meta[name="mesure-ga4"]')?.content;
  const canonique = document.querySelector('link[rel="canonical"]')?.href;
  if (!id || !canonique || new URL(canonique).origin !== document.location.origin) return false;
  const fenetre = document.defaultView;
  fenetre.dataLayer = fenetre.dataLayer || [];
  // gtag attend l'objet « arguments » tel quel, pas un tableau.
  fenetre.gtag = function gtag() { fenetre.dataLayer.push(arguments); };
  fenetre.gtag("js", new Date());
  fenetre.gtag("config", id);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(script);
  return true;
}
