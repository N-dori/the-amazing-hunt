"use client";

import { useState } from "react";
import ScreenHeader from "@/components/protocol/ScreenHeader";
import ActionButton from "@/components/ui/ActionButton";
import StatusTag from "@/components/ui/StatusTag";
import { prototypeNote, teamScreen } from "@/lib/game/screens";
import type { TeamId } from "@/lib/game/types";
import ListTeam from "./ListTeam";
import styles from "./IndexTeam.module.scss";

type IndexTeamProps = {
  selected: TeamId | null;
  onBack: () => void;
  onJoin: (teamId: TeamId) => void;
};

// Team selection: pick a team (changeable), then join. Seats are mock occupancy.
export default function IndexTeam({ selected, onBack, onJoin }: IndexTeamProps) {
  const [choice, setChoice] = useState<TeamId | null>(selected);

  return (
    <main className={styles.screen}>
      <div className={styles.inner}>
        <ScreenHeader
          onBack={onBack}
          step={2}
          total={4}
          aside={<span className={styles.session}>{teamScreen.sessionLabel.text}</span>}
        />

        <div className={styles.intro}>
          <h1 className={styles.heading} tabIndex={-1} data-screen-heading>
            {teamScreen.heading.text}
          </h1>
          <p className={styles.lede}>{teamScreen.intro.text}</p>
        </div>

        <ListTeam choice={choice} onChoose={setChoice} />
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionInner}>
          <ActionButton icon="arrowForward" block disabled={!choice} onClick={() => choice && onJoin(choice)}>
            {teamScreen.continue.text}
          </ActionButton>
          <p className={styles.note}>
            {prototypeNote.text}
            <StatusTag status={prototypeNote.status} />
          </p>
        </div>
      </div>
    </main>
  );
}
