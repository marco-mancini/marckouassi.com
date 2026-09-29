import type { HTMLAttributes, ReactNode } from "react";
import "./Universal_planche.css";

type ProprietesPlanche = HTMLAttributes<HTMLDivElement> & {
  /** Fond de la planche. "creme" par defaut, "olive" pour les planches sombres. */
  fond?: "creme" | "olive";
  children: ReactNode;
};

export function Universal_planche({
  fond = "creme",
  className = "",
  children,
  ...proprietes
}: ProprietesPlanche) {
  const classes = ["artboard", fond === "olive" ? "artboard--olive" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...proprietes}>
      {children}
    </div>
  );
}
