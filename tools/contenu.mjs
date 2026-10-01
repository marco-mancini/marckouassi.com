/**
 * CONTENU — chargement et validation des données éditoriales.
 *
 * Source par défaut : les fichiers de content/. Source « publication » :
 * le dernier instantané publié depuis le back-office (voir
 * chargerPublication), quand le build tourne dans le flux de publication.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { DOCUMENTS } from "../Design_System/gabarits/donnees.js";

export async function chargerFichiers(racine) {
  const contenu = {};
  for (const nom of DOCUMENTS) contenu[nom] = JSON.parse(await fs.readFile(path.join(racine, "content", `${nom}.json`), "utf8"));
  return contenu;
}

/**
 * Publication du back-office (lecture publique, autorisée par la règle
 * « publications : lecture publique du publié »). Seule la clé publique
 * est utilisée : aucune clé secrète dans le build.
 * `version` : celle que le flux a reçue ; sinon la plus récente.
 * Renvoie null s'il n'existe encore aucune publication.
 */
export async function chargerPublication({ url, cle, version = null }) {
  const filtre = version ? `version=eq.${Number(version)}` : "statut=in.(en_attente,en_ligne)&order=version.desc&limit=1";
  const reponse = await fetch(`${url}/rest/v1/publications?select=id,version,instantane&${filtre}`, {
    headers: { apikey: cle, Authorization: `Bearer ${cle}` },
  });
  if (!reponse.ok) throw new Error(`Publication illisible : ${reponse.status} ${await reponse.text()}`);
  const [publication] = await reponse.json();
  if (!publication) {
    if (version) throw new Error(`Publication n° ${version} introuvable.`);
    return null;
  }
  return { contenu: publication.instantane, version: publication.version, id: publication.id };
}

export { valider, referencesMedias, DOCUMENTS } from "../Design_System/gabarits/donnees.js";
