import ActionButton from "@/components/ui/ActionButton";
import StatusTag from "@/components/ui/StatusTag";
import type { Copy } from "@/lib/game/types";
import styles from "./PreviewDiscoveryReflect.module.scss";

export type DiscoveryReflectView = {
  number: number;
  label: string;
  heading: string;
  prompt: string;
  note: Copy;
  finish: string;
  skip: string;
};

type PreviewDiscoveryReflectProps = {
  view: DiscoveryReflectView;
  value: string;
  onChange: (value: string) => void;
  onFinish: () => void;
};

// An optional personal reflection. Never graded and never saved: the text lives only in this
// screen's state, so finishing or skipping both just end the mission.
export default function PreviewDiscoveryReflect({ view: v, value, onChange, onFinish }: PreviewDiscoveryReflectProps) {
  return (
    <section className={styles.question}>
      <h1 className={styles.title} tabIndex={-1} data-screen-heading>
        {v.heading}
      </h1>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          onFinish();
        }}
      >
        <p className={styles.stepLabel}>
          <span className={styles.stepNumber}>{v.number}</span>
          {v.label}
        </p>
        <label htmlFor="discoveryReflection" className={styles.prompt}>
          {v.prompt}
        </label>
        <p id="discoveryReflectionNote" className={styles.caption}>
          {v.note.text}
          <StatusTag status={v.note.status} />
        </p>
        <textarea
          id="discoveryReflection"
          className={styles.textArea}
          rows={4}
          maxLength={600}
          value={value}
          aria-describedby="discoveryReflectionNote"
          onChange={(e) => onChange(e.target.value)}
        />
        {/* One action either way: it reads "Skip" until something is written. */}
        <ActionButton type="submit" icon="arrowForward" block>
          {value.trim().length === 0 ? v.skip : v.finish}
        </ActionButton>
      </form>
    </section>
  );
}
