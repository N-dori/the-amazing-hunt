import ActionButton from "@/components/ui/ActionButton";
import type { GatewayView } from "@/lib/amazing-shuk/gateway-view";
import type { WaterReward } from "@/lib/amazing-shuk/water-performance";
import type { MissionDiscovery, MissionVictoryCopy } from "@/lib/amazing-shuk/mission-completion";
import PreviewMissionVictory from "./PreviewMissionVictory";
import PreviewMissionDiscovery from "./PreviewMissionDiscovery";
import styles from "./PreviewGatewayTask.module.scss";
type Props = { view: GatewayView; victory: MissionVictoryCopy; discovery: MissionDiscovery; onExplore: () => void; year: string; inscription: string; question: string; hints: readonly {title:string;text:string;notation?:string}[];
  hasMoreHints: boolean; reward: WaterReward | null; feedback: string; onChange: (value:string) => void; onSubmit: () => void; onReset: () => void; onHint: () => void };
export default function PreviewGatewayTask({view,victory,discovery,onExplore,year,inscription,question,hints,hasMoreHints,reward,feedback,onChange,onSubmit,onReset,onHint}: Props) {
  if (view.stage === "completed") return <PreviewMissionVictory {...victory} reward={reward} onExplore={onExplore}><PreviewMissionDiscovery {...discovery} /></PreviewMissionVictory>;
  return <section className={styles.task} aria-labelledby="gateway-year-title">
    <h3 id="gateway-year-title">{question}</h3>
    <>
      <p>Three languages confirmed</p>
      <p>Year notation: <span className="rtl" lang="he">{inscription}</span></p>
      <form onSubmit={event => {event.preventDefault(); if(view.canSubmit && !view.busy && year.length === 4) onSubmit();}}>
        <label htmlFor="gateway-year">Gregorian year</label>
        <input id="gateway-year" inputMode="numeric" autoComplete="off" pattern="[0-9]{4}" maxLength={4} value={year}
          disabled={view.busy || !view.canSubmit} onChange={event => {if(/^[0-9]{0,4}$/.test(event.target.value)) onChange(event.target.value);}} />
        {view.canSubmit ? <ActionButton type="submit" block disabled={view.busy || year.length !== 4}>Submit Our Answer</ActionButton>
          : <p>Talk it over. Your answer-submitter or guide submits the group&apos;s answer.</p>}
      </form>
      {feedback ? <p role="status">{feedback}</p> : null}
      {hints.map(hint => <div key={hint.title}><h4>{hint.title}</h4>{hint.notation ? <p><span className="rtl" lang="he">{hint.notation}</span></p> : null}<p>{hint.text}</p></div>)}
      {hasMoreHints ? <ActionButton variant="quiet" disabled={view.busy} onClick={onHint}>Need a hint?</ActionButton> : null}
      <ActionButton variant="quiet" disabled={view.busy} onClick={onReset}>Clear answer</ActionButton>
    </>
  </section>;
}
