// Domain types for The Memory Protocol, Prototype 01
// (docs/DORI_Memory_Protocol_Approved_Build_Spec_v1.md). Pure types: no runtime code here, so
// every module can `import type` from it under Node's type stripping as well as under Next.

export type TeamId = "A" | "B";

// How far a piece of content has been checked. The app shows anything that isn't "approved"
// with a visible label, so a fixture can never pass for verified content.
//   approved:  taken from an approved document (Story V1, the build spec) without change
//   draft:     written for the prototype from approved facts; wording still needs approval
//   fixture:   a development stand-in for a missing asset, location or answer
export type ContentStatus = "approved" | "draft" | "fixture";

// Evidence labels from the content rules: never mixed in one statement.
export type ClaimType = "historicalFact" | "interpretation" | "attributedTradition" | "fiction";

export type Copy = { text: string; status: ContentStatus };

// ---- Places and the map ----------------------------------------------------------------

export type SiteId = "library" | "pictureInStone" | "synagogue" | "borekas";

export type Site = {
  id: SiteId;
  name: Copy;
  // Position on the illustrated map image, in image pixels (Leaflet CRS.Simple: [y, x]).
  mapPoint: { x: number; y: number };
  // Verified geographic position, stored separately from the map. Null until field-verified;
  // with null, arrival can only be confirmed by observation or by the guide.
  geo: { lat: number; lon: number; status: "verified" } | null;
  // Arrival thresholds in metres. The spec's proposed test values; field-test before relying on them.
  nearMeters: number;
  uncertainMeters: number;
  clue: Copy;
  hints: Copy[];
};

export type NavMode = "independent" | "hint" | "external";
export type ArrivalMethod = "gps" | "observation" | "guide";

export type Arrival = {
  siteId: SiteId;
  method: ArrivalMethod;
  navMode: NavMode;
  points: number;
  // For GPS only: the server-computed distance and the reported accuracy. Raw coordinates
  // are never stored.
  distanceMeters?: number;
  accuracyMeters?: number;
  at: string;
};

// ---- Questions ---------------------------------------------------------------------------

export type ChoiceQuestion = {
  kind: "choice";
  id: string;
  prompt: Copy;
  options: { id: string; label: Copy }[];
  correct: string[]; // one id for single choice, several for multi-select
  multiple: boolean;
  points: number;
};

export type TextQuestion = {
  kind: "text";
  id: string;
  prompt: Copy;
  // Accepted answers, compared after normalising case, spaces and dashes. Empty means the
  // question is open: it must be answered but is not auto-scored.
  accepted: string[];
  points: number;
};

export type Question = ChoiceQuestion | TextQuestion;

// ---- Archive tracks -----------------------------------------------------------------------

export type ArchiveSource = {
  id: string;
  referenceCode: string; // e.g. IL-INL-YBZ-0024-009
  systemId: string;
  url: string;
  title: Copy;
  // Rights not cleared means the app shows a labelled placeholder, never the photo.
  rightsCleared: boolean;
  datedAs: Copy;
};

export type ArchiveTrack = {
  teamId: TeamId;
  title: Copy;
  intro: Copy;
  // A flagged alternate track (e.g. Team B while no second portrait is verified) says so on screen.
  alternateReason: Copy | null;
  sourceIds: string[];
  questions: Question[];
};

// ---- Crises and HARMONY -------------------------------------------------------------------

export type Crisis = {
  teamId: TeamId;
  title: Copy;
  scenario: Copy;
  inspiration: Copy;
  considerations: Copy[];
};

export type HarmonyReply = {
  addressed: string;
  overlooked: string;
  reflection: string;
  source: "ai" | "scripted";
  hiddenByGuide: boolean;
  at: string;
};

export type Proposal = {
  text: string;
  stakeholders: string;
  tradeoffs: string;
  at: string;
};

export type RubricMarks = {
  stakeholders: number;
  consequences: number;
  practicality: number;
  sourceConnection: number;
};

// ---- Session state ------------------------------------------------------------------------

export type Stage =
  | "briefing"          // 00A: Library exterior, guide-led briefing, then the transmission
  | "timeline"          // 00B: the historical timeline, 1946 (both teams)
  | "discovery"         // 00C: the team's parallel discovery (A: Traveler's Prayer, B: Broken Time)
  | "archive"           // 00D: the team's archive track
  | "toPictureInStone"  // navigate + arrive
  | "pictureInStone"    // conditional stop (skippable while unverified)
  | "toSynagogue"       // navigate + arrive at Hesed VeRahamim
  | "reconstruction"    // reconstruct the historical story
  | "crisis"            // the team's contemporary dilemma + proposal
  | "awaitingReveal"    // proposal in; waiting for the other team and the guide
  | "rewards";          // shared restoration, novel and tasting

export type TeamState = {
  id: TeamId;
  devices: string[];
  stage: Stage;
  hintsUsed: Partial<Record<SiteId, number>>;
  externalNavUsed: Partial<Record<SiteId, boolean>>;
  // An observation typed at an unverified site, waiting for the guide to confirm arrival.
  pendingObservation: Partial<Record<SiteId, string>>;
  arrivals: Arrival[];
  answers: Record<string, string[]>;
  points: Record<string, number>; // per scored item id
  pictureInStone: "skipped" | "completed" | null;
  proposal: Proposal | null;
  harmony: HarmonyReply | null;
  rubric: RubricMarks | null;
  rewardRedeemed: boolean;
};

export type DossierEntry = {
  id: string;
  teamId: TeamId;
  sourceId: string | null; // archive source or null for a site observation
  evidenceType: "archivalPhoto" | "catalogRecord" | "siteObservation";
  claimType: ClaimType;
  summary: string;
  at: string;
};

export type AuditEntry = {
  at: string;
  actor: "guide" | "system";
  action: string;
  teamId?: TeamId;
  detail: string;
};

export type SessionState = {
  code: string;
  createdAt: string;
  briefingComplete: boolean;
  revealed: boolean;
  teams: Record<TeamId, TeamState>;
  dossier: DossierEntry[];
  audit: AuditEntry[];
};

// ---- Actions ------------------------------------------------------------------------------

export type GpsReading = { lat: number; lon: number; accuracy: number; timestamp: number };

export type TeamAction =
  | { type: "joinTeam"; teamId: TeamId }
  | { type: "submitTimeline"; answer: string }
  // The 00C answer only; Team A's personal reflection is never sent.
  | { type: "submitDiscovery"; answer: string }
  | { type: "submitArchive"; answers: Record<string, string[]> }
  | { type: "useHint"; siteId: SiteId }
  | { type: "useExternalNav"; siteId: SiteId }
  | { type: "verifyGps"; siteId: SiteId; reading: GpsReading }
  | { type: "submitObservation"; siteId: SiteId; text: string }
  | { type: "skipPictureInStone" }
  | { type: "submitPictureInStone"; answer: string }
  | { type: "submitReconstruction"; answers: Record<string, string[]> }
  | { type: "submitProposal"; proposal: Omit<Proposal, "at">; reply: Omit<HarmonyReply, "at" | "hiddenByGuide"> };

export type GuideAction =
  | { type: "completeBriefing" }
  | { type: "confirmArrival"; teamId: TeamId; siteId: SiteId; reason: string }
  | { type: "bypassStage"; teamId: TeamId; reason: string }
  | { type: "scoreRubric"; teamId: TeamId; marks: RubricMarks }
  | { type: "hideHarmonyReply"; teamId: TeamId; reason: string }
  | { type: "triggerReveal" }
  | { type: "redeemReward"; teamId: TeamId };
