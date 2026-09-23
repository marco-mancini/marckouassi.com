import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const classes = ["ds-button", `ds-button--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...props} />;
}
