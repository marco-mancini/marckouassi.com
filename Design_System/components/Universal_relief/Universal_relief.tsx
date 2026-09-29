import type { ReactNode } from "react";
import "./Universal_relief.css";

type ProprietesRelief = {
  /** Fond sur lequel le fragment est pose : le dore change avec lui. */
  fond?: "olive" | "creme";
  children: ReactNode;
};

export function Universal_relief({ fond = "olive", children }: ProprietesRelief) {
  return <b className={fond === "olive" ? "about-relief" : "board-relief"}>{children}</b>;
}
