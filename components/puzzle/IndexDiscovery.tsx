"use client";

import { useEffect, useRef, useState } from "react";
import ScreenHeader from "@/components/protocol/ScreenHeader";
import StatusTag from "@/components/ui/StatusTag";
import {
  checkDiscoveryAnswer, discoveryHelp, discoveryLabels as L, discoveryMissions, discoverySteps,
  type DiscoveryMission, type DiscoveryResult, type DiscoveryStep,
} from "@/lib/game/discovery";
import { prototypeNote } from "@/lib/game/screens";
import type { TeamId } from "@/lib/game/types";
import PreviewDiscoveryAnswer, { type DiscoveryAnswerView } from "./PreviewDiscoveryAnswer";
import PreviewDiscoveryReflect, { type DiscoveryReflectView } from "./PreviewDiscoveryReflect";
import PreviewDiscoveryReveal, { type DiscoveryRevealView } from "./PreviewDiscoveryReveal";
import PreviewDiscoveryStep, { type DiscoveryStepView } from "./PreviewDiscoveryStep";
import PreviewPuzzleBrief from "./PreviewPuzzleBrief";
import styles from "./IndexDiscovery.module.scss";

type IndexDiscoveryProps = {
  teamId: TeamId;
  // Set once the team has solved this mission; reopening lands on the reveal.
  result: DiscoveryResult | null;
  onExit: () => void;
  onSolved: (result: DiscoveryResult) => void;
};

type WalkStep = "clue" | "find" | "observe" | "read";

// The numbered steps players see (the brief is HARMONY's, unnumbered).
const stepNumber = (steps: DiscoveryStep[], step: DiscoveryStep) => steps.indexOf(step);

function walkView(m: DiscoveryMission, step: WalkStep, number: number): DiscoveryStepView {
  const base = { title: m.title.text, number, label: L.steps[step].text, textSource: null, photo: null, notes: [], link: null, hint: null };
  switch (step) {
    case "clue":
      return { ...base, text: m.clue.text.text, photo: { src: m.clue.photo.src, alt: m.clue.photo.alt.text, caption: m.clue.photo.caption, framed: true }, action: m.clue.action.text };
    case "find":
      return {
        ...base,
        text: m.find.where.text,
        textSource: m.find.whereSource?.text ?? null,
        notes: m.find.gap ? [m.find.gap] : [],
        hint: { label: L.hint.text, text: m.find.hint.text },
        action: m.find.action.text,
      };
    case "observe":
      return { ...base, text: m.observe.text.text, action: m.observe.action.text };
    case "read":
      return {
        ...base,
        text: m.read.text.text,
        notes: m.read.notes,
        link: m.read.link ? { href: m.read.link.href, label: m.read.link.label.text, note: m.read.link.note } : null,
        action: m.read.action.text,
      };
  }
}

function revealView(m: DiscoveryMission, result: DiscoveryResult, hasReflect: boolean): DiscoveryRevealView {
  const r = m.reveal;
  return {
    kicker: L.steps.reveal.text,
    heading: r.heading,
    guideSolved: result.solvedBy === "guide" ? L.guideSolved.text : null,
    photo: { src: r.photo.src, alt: r.photo.alt.text, caption: r.photo.caption },
    record: r.record ? { lines: r.record.lines.map((l) => l.text), claim: r.record.claim, source: r.record.source.text } : null,
    documented: r.documented,
    documentedSource: r.documentedSource,
    documentedNote: r.documentedNote,
    message: r.message,
    yourReading: r.showYourReading && result.answer.trim() ? { label: L.yourReading.text, text: result.answer.trim() } : null,
    harmony: r.harmony,
    sourcesLabel: L.sources.text,
    sources: r.sources.map((s) => ({ id: s.id, title: s.title.text, url: s.url, note: s.note })),
    continueLabel: hasReflect ? L.continue.text : L.finish.text,
  };
}

// Mission 00C for one team: HARMONY's brief → clue → find → observe → read → answer → reveal
// (→ an optional reflection for Team A). One idea and one main action per screen. Local state
// only; the result goes up so the Library screen and the map can show it.
export default function IndexDiscovery({ teamId, result, onExit, onSolved }: IndexDiscoveryProps) {
  const mission = discoveryMissions[teamId];
  const steps = discoverySteps(mission);
  const [step, setStep] = useState<DiscoveryStep>(result ? "reveal" : "brief");
  const [briefIndex, setBriefIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState(false);
  // Personal and ungraded: kept in this screen only and dropped when the mission closes.
  const [reflection, setReflection] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Same focus rule as the rest of the flow: each new step starts at the top, on its heading.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    rootRef.current?.querySelector<HTMLElement>("[data-screen-heading]")?.focus({ preventScroll: true });
  }, [step]);

  const index = steps.indexOf(step);
  const goTo = (offset: number) => setStep(steps[index + offset]);

  const solve = (solved: DiscoveryResult) => {
    onSolved(solved);
    setStep("reveal");
  };

  const check = () => {
    if (checkDiscoveryAnswer(teamId, answer)) {
      solve({ answer: answer.trim(), solvedBy: "players" });
      return;
    }
    setMisses((m) => m + 1);
    setFeedback(true);
  };

  // Before the answer, back walks one step back. Once solved, back leaves the mission rather
  // than reopening the question.
  const back = () => {
    if (step === "brief") {
      if (briefIndex > 0) setBriefIndex((i) => i - 1);
      else onExit();
    } else if (step === "clue") {
      setBriefIndex(mission.brief.length - 1);
      setStep("brief");
    } else if (step === "reveal") onExit();
    else goTo(-1);
  };

  const help = discoveryHelp(mission, misses);
  const dark = step === "brief";
  const solved = result ?? { answer: "", solvedBy: "players" as const };

  const answerView: DiscoveryAnswerView = {
    title: mission.title.text,
    number: stepNumber(steps, "answer"),
    label: L.steps.answer.text,
    prompt: mission.answer.prompt.text,
    long: mission.answer.long,
    check: L.check.text,
    guideConfirm: L.guideConfirm.text,
  };

  const reflectView: DiscoveryReflectView | null = mission.reflect
    ? {
        number: stepNumber(steps, "reflect"),
        label: L.steps.reflect.text,
        heading: mission.reflect.heading.text,
        prompt: mission.reflect.prompt.text,
        note: mission.reflect.note,
        finish: L.reflectFinish.text,
        skip: L.reflectSkip.text,
      }
    : null;

  return (
    <main ref={rootRef} className={`${styles.screen} ${dark ? styles.dark : ""} ${teamId === "B" ? styles.teamB : ""}`}>
      <div className={styles.inner}>
        <ScreenHeader
          onBack={back}
          step={index + 1}
          total={steps.length}
          tone={dark ? "dark" : "light"}
          aside={
            <span className={styles.code}>
              <span className={styles.teamDot} aria-hidden="true" />
              {mission.code.text}
            </span>
          }
        />
      </div>

      <div key={step} className={styles.stage}>
        {step === "brief" && (
          <PreviewPuzzleBrief
            title={mission.title.text}
            lines={mission.brief}
            shown={briefIndex + 1}
            nextLabel={L.briefNext.text}
            startLabel={L.briefStart.text}
            onNext={() => setBriefIndex((i) => Math.min(i + 1, mission.brief.length - 1))}
            onStart={() => setStep("clue")}
          />
        )}
        {(step === "clue" || step === "find" || step === "observe" || step === "read") && (
          <PreviewDiscoveryStep view={walkView(mission, step, stepNumber(steps, step))} onAction={() => goTo(1)} />
        )}
        {step === "answer" && (
          <PreviewDiscoveryAnswer
            view={answerView}
            answer={answer}
            feedback={feedback ? mission.answer.wrong.text : null}
            hint={help.hint?.text ?? null}
            showGuide={help.guide}
            onAnswerChange={(value) => {
              setAnswer(value);
              setFeedback(false);
            }}
            onCheck={check}
            onGuideConfirm={() => solve({ answer: answer.trim(), solvedBy: "guide" })}
          />
        )}
        {step === "reveal" && (
          <PreviewDiscoveryReveal view={revealView(mission, solved, reflectView !== null)} onContinue={() => (reflectView ? setStep("reflect") : onExit())} />
        )}
        {step === "reflect" && reflectView && <PreviewDiscoveryReflect view={reflectView} value={reflection} onChange={setReflection} onFinish={onExit} />}
      </div>

      <p className={styles.note}>
        {prototypeNote.text}
        <StatusTag status={prototypeNote.status} tone={dark ? "dark" : "light"} />
      </p>
    </main>
  );
}
