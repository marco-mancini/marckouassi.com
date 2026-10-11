/**
 * Empreinte des ressources (#197) : une page neuve ne doit jamais se charger
 * avec d'anciennes feuilles ou d'anciens modules restés en cache.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { calculerEmpreinte, versionnerCss, versionnerJs } from "../tools/empreinte.mjs";

test("les @import d'une feuille reçoivent l'empreinte, et rien d'autre ne bouge", () => {
  const css = '@import url("../a/A.css");\n@import url(\'../b/B.css\');\n.x { background: url("img.png"); }';
  assert.equal(versionnerCss(css, "abc"), '@import url("../a/A.css?v=abc");\n@import url(\'../b/B.css?v=abc\');\n.x { background: url("img.png"); }');
  // Une adresse déjà versionnée n'est pas versionnée deux fois.
  assert.equal(versionnerCss('@import url("A.css?v=1");', "abc"), '@import url("A.css?v=1");');
});

test("les imports relatifs d'un module reçoivent l'empreinte, pas les autres", () => {
  const js = 'import { a } from "./a.js";\nimport "../b.js";\nconst c = await import("./c.js");\nimport { d } from "node:fs";\nconst t = "./texte.js";';
  assert.equal(versionnerJs(js, "abc"), 'import { a } from "./a.js?v=abc";\nimport "../b.js?v=abc";\nconst c = await import("./c.js?v=abc");\nimport { d } from "node:fs";\nconst t = "./texte.js";');
});

test("l'empreinte suit le contenu des ressources, et lui seul", async () => {
  const racine = await fs.mkdtemp(path.join(os.tmpdir(), "empreinte-"));
  await fs.mkdir(path.join(racine, "Design_System/x"), { recursive: true });
  await fs.mkdir(path.join(racine, "Frontend"), { recursive: true });
  await fs.writeFile(path.join(racine, "Design_System/x/A.css"), ".a{}");
  await fs.writeFile(path.join(racine, "Design_System/x/A.md"), "doc");
  await fs.writeFile(path.join(racine, "Frontend/site.js"), "1");
  await fs.writeFile(path.join(racine, "Frontend/mesure.js"), "2");
  const avant = await calculerEmpreinte(racine);
  assert.match(avant, /^[0-9a-f]{10}$/);
  assert.equal(await calculerEmpreinte(racine), avant, "stable sans changement");
  await fs.writeFile(path.join(racine, "Design_System/x/A.md"), "autre doc");
  assert.equal(await calculerEmpreinte(racine), avant, "la documentation n'est pas une ressource");
  await fs.writeFile(path.join(racine, "Design_System/x/A.css"), ".a{color:red}");
  assert.notEqual(await calculerEmpreinte(racine), avant, "une feuille modifiée change l'empreinte");
  await fs.rm(racine, { recursive: true, force: true });
});
