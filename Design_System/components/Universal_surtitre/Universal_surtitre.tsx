import type { ReactNode } from "react";
import "./Universal_surtitre.css";

export function Universal_surtitre({ children }: { children: ReactNode }) {
  return <p className="board-label">{children}</p>;
}
