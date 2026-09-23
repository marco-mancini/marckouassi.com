import type { ButtonHTMLAttributes } from "react";
import "./Bouton.css";

type ProprietesBouton = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "principal" | "contour";
};

export function Bouton({
  variante = "principal",
  className = "",
  ...proprietes
}: ProprietesBouton) {
  const classes = ["bouton-systeme", `bouton-systeme--${variante}`, className]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...proprietes} />;
}
