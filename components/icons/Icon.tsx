import { iconPaths, type IconName } from "./iconPaths";
import styles from "./Icon.module.scss";

type IconProps = {
  name: IconName;
  className?: string;
  // Only for an icon that stands alone and carries meaning (an icon-only button should put
  // its label on the button instead). The text must come from approved copy.
  label?: string;
};

// One line icon from the game's set. Decorative by default: hidden from assistive tech and
// coloured by the surrounding text. Size it from the parent's module with `className`.
export default function Icon({ name, className, label }: IconProps) {
  const classes = className ? `${styles.icon} ${className}` : styles.icon;
  return (
    <svg
      className={classes}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {iconPaths[name]}
    </svg>
  );
}
