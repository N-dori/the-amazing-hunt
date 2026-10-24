import { Icon, type IconName } from "@/components/icons";
import type { ShukTab } from "@/lib/amazing-shuk/shuk-navigation";
import styles from "./PreviewShukNav.module.scss";

const TABS: readonly { id: ShukTab; label: string; icon: IconName }[] = [
  { id: "map", label: "Map", icon: "map" },
  { id: "mission", label: "Mission", icon: "puzzle" },
  { id: "food", label: "Food", icon: "food" },
  { id: "group", label: "Group", icon: "team" },
];
type Props = { active: ShukTab; onSelect: (tab: ShukTab) => void };
/** The game's bottom bar: it only chooses what's on screen; actions stay on their own screens. */
export default function PreviewShukNav({ active, onSelect }: Props) {
  return <nav className={styles.bar} aria-label="Game">
    <ul className={styles.list}>
      {TABS.map(tab => <li key={tab.id}>
        <button type="button" className={`${styles.tab} ${tab.id === active ? styles.tabActive : ""}`}
          aria-current={tab.id === active ? "page" : undefined} onClick={() => onSelect(tab.id)}>
          <Icon name={tab.icon} className={styles.icon} />
          <span>{tab.label}</span>
        </button>
      </li>)}
    </ul>
  </nav>;
}
