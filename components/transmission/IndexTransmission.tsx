"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import ScreenHeader from "@/components/protocol/ScreenHeader";
import ActionButton from "@/components/ui/ActionButton";
import StatusTag from "@/components/ui/StatusTag";
import { mission, transmission } from "@/lib/game/content";
import { prototypeNote, teams, transmissionScreen } from "@/lib/game/screens";
import type { TeamId } from "@/lib/game/types";
import PreviewTransmissionBeat from "./PreviewTransmissionBeat";
import styles from "./IndexTransmission.module.scss";

type IndexTransmissionProps = {
  teamId: TeamId | null;
  onBack: () => void;
  onComplete: () => void;
};

// The six Story V1 beats, one per step, then the mission. Arrow keys also step through.
export default function IndexTransmission({ teamId, onBack, onComplete }: IndexTransmissionProps) {
  const [index, setIndex] = useState(0);
  const total = transmission.length + 1; // the beats, then the mission
  const atMission = index === transmission.length;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, transmission.length)), []);
  const back = useCallback(() => {
    if (index === 0) onBack();
    else setIndex((i) => i - 1);
  }, [index, onBack]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("button, a, input, textarea")) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  // Keep focus with the story as it advances (not on the first render: the flow focuses it).
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  // The mission's first sentence is its title; the rest is the brief. Same words as Story V1.
  const [missionTitle, ...missionRest] = mission.text.split(/(?<=\.)\s+/);

  return (
    <main className={styles.screen}>
      <div className={styles.rings} aria-hidden="true" />
      <div className={styles.inner}>
        <ScreenHeader
          onBack={back}
          step={3}
          total={4}
          tone="dark"
          aside={
            <span className={styles.signal}>
              <Icon name="transmission" className={styles.signalIcon} />
              <span>HARMONY</span>
            </span>
          }
        />

        <div className={styles.meta}>
          <p className={styles.signalLine}>
            {transmissionScreen.signal.text} · {transmissionScreen.source.text}
          </p>
          <ol className={styles.progress} aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <li key={i} className={`${styles.segment} ${i <= index ? styles.segmentOn : ""}`} />
            ))}
          </ol>
        </div>

        <div className={styles.stage}>
          {atMission ? (
            <section key="mission" className={styles.mission}>
              <p className={styles.kicker}>{transmissionScreen.missionHeading.text}</p>
              <h1 ref={headingRef} className={styles.missionTitle} tabIndex={-1} data-screen-heading>
                {missionTitle}
              </h1>
              <p className={styles.missionBody}>{missionRest.join(" ")}</p>
              {teamId ? (
                <p className={`${styles.team} ${teamId === "B" ? styles.teamB : ""}`}>
                  <span className={styles.teamLetter} aria-hidden="true">
                    {teamId}
                  </span>
                  {teams[teamId].name.text} · {teams[teamId].track.text}
                </p>
              ) : null}
            </section>
          ) : (
            <PreviewTransmissionBeat
              key={index}
              headingRef={headingRef}
              number={index + 1}
              count={transmission.length}
              heading={transmission[index].heading.text}
              body={transmission[index].body.text}
            />
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlsInner}>
          {atMission ? (
            <ActionButton variant="light" icon="arrowForward" block onClick={onComplete}>
              {transmissionScreen.toMap.text}
            </ActionButton>
          ) : (
            <>
              <ActionButton variant="light" icon="arrowForward" block onClick={next}>
                {transmissionScreen.next.text}
              </ActionButton>
              <ActionButton variant="quiet" onClick={() => setIndex(transmission.length)}>
                {transmissionScreen.skip.text}
              </ActionButton>
            </>
          )}
          <p className={styles.note}>
            {prototypeNote.text}
            <StatusTag status={prototypeNote.status} tone="dark" />
          </p>
        </div>
      </div>
    </main>
  );
}
