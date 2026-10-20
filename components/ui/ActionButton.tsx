import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "@/components/icons";
import styles from "./ActionButton.module.scss";

type ActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  // primary: the one main action on a screen. quiet: secondary text action.
  // light: primary action on a dark (Ink) surface.
  variant?: "primary" | "quiet" | "light";
  icon?: IconName;
  // Full width on phones; natural width from 48rem up.
  block?: boolean;
  className?: string;
};

export default function ActionButton({ variant = "primary", icon, block, className, children, type = "button", ...rest }: ActionButtonProps) {
  const classes = [styles.button, styles[variant], block ? styles.block : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      <span>{children}</span>
      {icon ? <Icon name={icon} className={styles.icon} /> : null}
    </button>
  );
}
