"use client";

import { useEffect, useRef, useState } from "react";
import ScreenHeader from "@/components/protocol/ScreenHeader";
import StatusTag from "@/components/ui/StatusTag";
import { firstKeepers, firstKeepersHelp, investigationViews, isFirstKeepersYear, libraryMission, unlockScreen } from "@/lib/game/library";
import { prototypeNote } from "@/lib/game/screens";
import type { TeamId } from "@/lib/game/types";
import PreviewInvestigations from "./PreviewInvestigations";
import PreviewPuzzleBrief from "./PreviewPuzzleBrief";
import PreviewPuzzleQuestion from "./PreviewPuzzleQuestion";
import PreviewPuzzleReveal from "./PreviewPuzzleReveal";
import styles from "./IndexPuzzle.module.scss";

export type PuzzleStage = "brief" | "find" | "reveal" | "unlocked";
const STAGES: PuzzleStage[] = ["brief", "find", "reveal", "unlocked"];

// The mission after 00C, named once the visitor's team has finished its investigation.
const archive = libraryMission("00D");

type IndexPuzzleProps = {
  teamId: TeamId | null;
  // Reopening a finished mission lands on the unlocked investigations.
  initialStage?: PuzzleStage;
  // Teams that have finished their Mission 00C investigation.
  discoveryDone: TeamId[];
  devTools: boolean;
  onExit: () => void;
  onSolved: () => void;
  onStartDiscovery: (teamId: TeamId) => void;
};

// Mission 00B, The First Memory Keepers: HARMONY's brief → find the timeline → answer one
// question → reveal → the two Mission 00C investigations unlock. Local state only.
export default function IndexPuzzle({ teamId, initialStage = "brief", discoveryDone, devTools, onExit, onSolved, onStartDiscovery }: IndexPuzzleProps) {
  const [stage, setStage] = useState<PuzzleStage>(initialStage);
  const [briefIndex, setBriefIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState(false);
  const [solvedBy, setSolvedBy] = useState<"players" | "guide" | null>(initialStage === "unlocked" ? "players" : null);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Same focus rule as the flow: each new stage starts at the top, focused on its heading.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    rootRef.current?.querySelector<HTMLElement>("[data-screen-heading]")?.focus({ preventScroll: true });
  }, [stage]);

  const solve = (by: "players" | "guide") => {
    setSolvedBy(by);
    setStage("reveal");
    onSolved();
  };

  const check = () => {
    if (isFirstKeepersYear(answer)) {
      solve("players");
      return;
    }
    setMisses((m) => m + 1);
    setFeedback(true);
  };

  const back = () => {
    if (stage === "brief" && briefIndex > 0) setBriefIndex((i) => i - 1);
    else if (stage === "find") setStage("brief");
    else onExit();
  };

  const help = firstKeepersHelp(misses);
  const dark = stage === "brief";

  return (
    <main ref={rootRef} className={`${styles.screen} ${dark ? styles.dark : ""}`}>
      <div className={styles.inner}>
        <ScreenHeader
          onBack={back}
          step={STAGES.indexOf(stage) + 1}
          total={STAGES.length}
          tone={dark ? "dark" : "light"}
          aside={<span className={styles.code}>{firstKeepers.code.text}</span>}
        />
      </div>

      <div key={stage} className={styles.stage}>
        {stage === "brief" && (
          <PreviewPuzzleBrief
            title={firstKeepers.title.text}
            lines={firstKeepers.brief}
            shown={briefIndex + 1}
            nextLabel={firstKeepers.briefNext.text}
            startLabel={firstKeepers.briefStart.text}
            onNext={() => setBriefIndex((i) => Math.min(i + 1, firstKeepers.brief.length - 1))}
            onStart={() => setStage("find")}
          />
        )}
        {stage === "find" && (
          <PreviewPuzzleQuestion
            content={firstKeepers}
            answer={answer}
            feedback={feedback ? firstKeepers.wrong.text : null}
            hint={help.hint?.text ?? null}
            showGuide={help.guide}
            onAnswerChange={(value) => {
              setAnswer(value);
              setFeedback(false);
            }}
            onCheck={check}
            onGuideConfirm={() => solve("guide")}
          />
        )}
        {stage === "reveal" && <PreviewPuzzleReveal content={firstKeepers} solvedBy={solvedBy ?? "players"} onContinue={() => setStage("unlocked")} />}
        {stage === "unlocked" && (
          <PreviewInvestigations
            items={investigationViews(teamId, discoveryDone)}
            next={teamId && discoveryDone.includes(teamId) ? { label: archive.label.text, title: archive.title.text, note: unlockScreen.nextNotBuilt } : null}
            devTools={devTools}
            onBegin={onStartDiscovery}
            onToMap={onExit}
          />
        )}
      </div>

      <p className={styles.note}>
        {prototypeNote.text}
        <StatusTag status={prototypeNote.status} tone={dark ? "dark" : "light"} />
      </p>
    </main>
  );
}
