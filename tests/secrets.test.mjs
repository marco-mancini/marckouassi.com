/**
 * Aucune clé ni aucun jeton dans les fichiers suivis par Git : clés
 * Supabase (JWT, sb_secret_, sb_publishable_) et jetons GitHub (ghp_,
 * github_pat_, gho_). Le jeton du CMS vit dans le navigateur de Marc,
 * jamais dans le dépôt.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const MOTIF = /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}|sb_secret_[a-zA-Z0-9_-]{20,}|sb_publishable_[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{20,}|gho_[a-zA-Z0-9]{20,}|github_pat_[a-zA-Z0-9_]{20,}/;
const TEXTE = /\.(m?js|ts|json|ya?ml|toml|md|html|css|sql|txt|svg)$/;

test("aucune clé ni aucun jeton dans les fichiers texte suivis par Git", () => {
  const fichiers = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter((f) => TEXTE.test(f) && f !== "package-lock.json" && fs.existsSync(f));
  assert.ok(fichiers.length > 100, `trop peu de fichiers examinés (${fichiers.length})`);
  const trouves = fichiers.filter((f) => MOTIF.test(fs.readFileSync(f, "utf8")));
  assert.deepEqual(trouves, []);
});
