// Screen copy for the first visual prototype: Welcome, Team selection, the HARMONY
// transmission and the investigation map. Story text is imported from content.ts (approved,
// Story V1). Everything written here is "draft" or "fixture" and the screens label it, so it
// can never pass for approved copy. Replace a string here once the owner approves wording.

import type { Copy, SiteId, TeamId } from "./types.ts";

const approved = (text: string): Copy => ({ text, status: "approved" });
const draft = (text: string): Copy => ({ text, status: "draft" });
const fixture = (text: string): Copy => ({ text, status: "fixture" });

// Shown once per screen: this prototype's wording is draft unless it is Story V1 text.
export const prototypeNote = fixture("Prototype · draft wording awaiting approval");

export const common = {
  back: draft("Back"),
  prototype: fixture("Prototype"),
};

// ---- Welcome ------------------------------------------------------------------------------

export const welcome = {
  // Route names are from the approved mission text (Story V1); the line itself is draft.
  route: draft("National Library · Nahlaot · Mahane Yehuda"),
  format: draft("Six players · two teams of three · one guide"),
  begin: approved("Begin"),
};

// ---- Teams [spec 2] -----------------------------------------------------------------------

export type TeamCopy = { name: Copy; track: Copy; summary: Copy };

export const teamScreen = {
  heading: draft("Choose your team"),
  intro: draft("Two teams of three investigate different evidence, then meet again at the shared reveal."),
  // A development session code; real codes come from the guide's session.
  sessionLabel: fixture("Session JRS-0426 · prototype"),
  continue: draft("Join and continue"),
  full: draft("Team full"),
  you: draft("You"),
};

// Team identity is the letter only until team names are approved. Track titles mirror the
// archive tracks in content.ts.
export const teams: Record<TeamId, TeamCopy> = {
  A: {
    name: approved("Team A"),
    track: draft("Two versions of one scene"),
    summary: draft("Compare a photograph with and without its inscription, and name what was lost."),
  },
  B: {
    name: approved("Team B"),
    track: draft("Reading the catalog record"),
    summary: draft("Read what a catalog record knows that the photograph alone cannot."),
  },
};

// Mock occupancy for the prototype: how many seats are taken before this visitor joins.
export const MOCK_SEATS_TAKEN: Record<TeamId, number> = { A: 1, B: 2 };
export const TEAM_SIZE = 3;

// ---- Transmission -------------------------------------------------------------------------

export const transmissionScreen = {
  signal: draft("Incoming transmission"),
  source: draft("Parallel Earth · reconstructed record"),
  next: draft("Continue"),
  skip: draft("Skip to mission"),
  missionHeading: draft("Your mission"),
  toMap: draft("Open the investigation map"),
};

// ---- Map ----------------------------------------------------------------------------------

export const mapScreen = {
  heading: draft("Investigation map"),
  disclaimer: fixture("Prototype schematic. Not to scale and not geographically accurate."),
  nextLabel: draft("Next"),
  lockedLabel: draft("Locked"),
  conditionalLabel: draft("Optional"),
  completeLabel: draft("Done"),
  close: draft("Close"),
  view: draft("View"),
  clueLabel: draft("Navigation clue"),
  legendHeading: draft("Stops on the route"),
  // Text alternative for the illustration; the stop list below it carries the same content.
  mapAlt: draft("Schematic illustrated map of the investigation route, from the National Library through Nahlaot to Mahane Yehuda Market."),
  // Once Mission 00B is done, the Library card leads back into the chapter.
  continueAction: draft("Continue investigation"),
  // The owner's wording (brief of 16 Oct 2026), shown while geography is unvalidated.
  conceptNotice: approved("Concept map — not for navigation"),
  locationPending: draft("Location awaiting a field check"),
  // The Library card's mission title and progress note come from libraryCard() in library.ts.
  missionLabel: draft("Mission"),
};

// Area names drawn on the map, from the approved mission text. Positions are on the
// schematic map image (same pixel space as Site.mapPoint), not geography.
export const mapAreas: { id: string; name: Copy; x: number; y: number }[] = [
  { id: "nahlaot", name: approved("Nahlaot"), x: 960, y: 820 },
  { id: "mahaneYehuda", name: approved("Mahane Yehuda"), x: 1330, y: 250 },
];

export type DestinationCopy = {
  kicker: Copy;
  summary: Copy;
  action: Copy | null;
  lockedReason: Copy | null;
};

export const destinations: Record<SiteId, DestinationCopy> = {
  library: {
    kicker: draft("Start here"),
    summary: draft("Recover authentic evidence from the Armoza family collection and record its identifying codes."),
    action: draft("Start investigation"),
    lockedReason: null,
  },
  pictureInStone: {
    kicker: draft("Optional stop"),
    summary: draft("A street heritage project in Nahlaot. Its wall and image are still to be field-verified, so this stop can be skipped without penalty."),
    action: null,
    lockedReason: draft("Opens after the archive investigation."),
  },
  synagogue: {
    kicker: draft("Field site"),
    summary: draft("Observe the building from the street and reconstruct how its use changed, and what the sources leave unknown."),
    action: null,
    lockedReason: draft("Opens after the archive investigation."),
  },
  borekas: {
    kicker: draft("Shared reward"),
    summary: draft("A taste of Sephardic culinary memory in Mahane Yehuda Market."),
    action: null,
    lockedReason: draft("Opens only after both teams finish and the guide's shared reveal."),
  },
};

// Destination photos for the card. Only authentic photos of the place itself.
export const destinationPhotos: Partial<Record<SiteId, { src: string; alt: Copy; caption: Copy }>> = {
  library: {
    src: "/library/library-entrance.jpg",
    alt: draft("The entrance of the National Library of Israel: its name in Hebrew, Arabic and English on a concrete wall beside a timber screen."),
    caption: fixture("Owner's site photo, October 2026."),
  },
};

// Development controls on the Investigation Map. Never shown in visitor mode.
export const devMapControls = {
  heading: fixture("Development controls"),
  baseMap: fixture("Map style"),
  simulate: fixture("Simulate: Hesed VeRahamim reconstruction completed"),
  hide: fixture("Hide (visitor view)"),
  show: fixture("Dev"),
};
