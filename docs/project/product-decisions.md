# The Amazing Shuk — Product Decisions

**Purpose:** Owner-approved decisions that govern implementation. Updated 24 Oct 2026.

## Approved: one shared group

**Decision (24 Oct 2026):** The first playable version contains exactly one group. Everyone moves together with the guide and sees the same progress. Do not implement team-count selection, competing teams, individual scoring, or multiple simultaneous game groups.

- Each participant logs in on their own phone.
- The guide manages participant roles and approves task completions.
- One participant is navigator and one is answer-submitter; the same person may hold both roles; everyone else is a follower.
- The group chooses its route among available tasks.
- Correct completions earn shared points and food tokens; redemption is guide-controlled at the market.

**Reason:** One coherent family experience with shared progress and guide oversight, rather than parallel competition.

**Supersedes:** Earlier 1/2/3-team brainstorming and the team-count selection behavior in `design/prototypes/amazing-shuk-team-format/`. Preserve that prototype as an isolated experiment; never integrate its selector into the Shuk app.

## Other current owner directions

- Intended access is the owner and seven friends on the existing VPS and host behind Caddy; do not treat the app as private until the actual app and proxy gates are verified.
- **Self-hosted magic-link login (approved, deferred):** use Auth.js/NextAuth email sign-in for individual participant phones, with access limited to the intended owner, guide and seven friends. No OAuth provider is requested. Self-hosted local JSON storage on the VPS is approved for authentication and game data, but is deferred and not yet implemented or validated for durability or concurrency. Email delivery, allowlisted enrollment/reset, `AUTH_SECRET`, and the separately protected Shuk app boundary must be configured before login can be called functional. Do not put credentials in the repository.
- Do not permanently store player photos in the app/VPS. Do not send photos to an API until consent, endpoint behavior, provider retention and failure handling are reviewed. `store: false` does not mean zero provider retention.
- Do not display the Rachmo photos in the game; the group can see the place from outside.
- Mural reuse and alteration rights remain unresolved; do not build a mural image task until cleared.

## Conflict priority

Follow current owner instructions first, then these approved decisions, then verified implementation constraints, current roadmap/design specs, and finally historical brainstorming. Record conflicts and update outdated plans; do not silently reverse a decision. Propose alternatives, but get owner approval before changing fundamental product direction.


## Current delivery priority (24 Oct 2026)

- **Immediate:** make The Amazing Shuk playable: one shared group, map and tasks, deterministic server-side answers, shared rewards, guide controls and four onboarding screens, using researched content without inventing claims or prices.
- **Temporary access:** predefined fictional participants and role switching are for local development only. Require explicit opt-in and loopback access; never expose unprotected game-state modification or guide controls in production.
- **First task slice:** digital cup simulation for existing idea #24. The real-world cistern is not used. Reward values remain pending owner approval.

The current implementation order supersedes earlier auth-first roadmap wording. Build the playable local simulation now; keep the VPS JSON and magic-link plan for before inviting real participants.


## Approved MVP content target

Start with six independently verified, playable tasks; ten is the ideal target if verified content, route time and group play support it. Claude's existing research and topic indexes are the discovery starting point. Ideas and dated research are not approved task copy or field verification.