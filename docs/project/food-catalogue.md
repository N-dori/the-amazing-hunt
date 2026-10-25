# Food catalogue — iteration 1, 25 Oct 2026

Implemented the owner's approved catalogue/detail slice only. Taste the Market shows one compact shared food-token balance, four provisional tasting entries and a detail screen with Back to Food. The surrounding duplicate balance panel is hidden only on the Food tab. No token actions, deduction, spending ledger, purchase button, transaction, new API or storage migration was added.

## Data and content

`food-catalogue.ts` keeps stable tasting IDs, proposal copy, explicit unknown values, vendor participation, serving, cost, dietary information, availability, location, sources and optional credited photographs. `food-catalogue-view.ts` projects typed display values without mutating data. Null price means “To be confirmed”, never free. All entries remain provisional regardless of balance. Descriptions/UI copy are development proposals marked for owner review in data; no historical stories, live offers or dietary guarantees were invented.

| Entry | Vendor/location position | Still needed before activation |
|---|---|---|
| Tahini tasting | Mill/vendor and meeting point unconfirmed; owner photos #76/#78 indexed but unavailable locally | Vendor agreement, exact serving/accompaniments, token price, verified ingredients/dietary information, availability, meeting point and suitable photo |
| Rugelach | Bakery and meeting point unconfirmed; no participating bakery is implied | Same confirmations, plus pastry variety and quantity |
| Bourekas | Vendor and meeting point unconfirmed; original Hakmat lead remains research, not a participating offer | Same confirmations, plus filling and quantity |
| Etrog Man drink | Named candidate only; participation unconfirmed. HaEgoz Street is a source-backed general location, not navigation | Participation, recipe, cup size, token price, ingredients/dietary information, availability, exact meeting point and cleared photo |

Candidate sources remain the existing [ideas/tasting notes](../../design/inputs/content/Mission_Task_Ideas.md) and photo index. [Etrog Man's own contact page](https://etrogman.com/contact/) was inspected: its map link says HaEgoz 6, while main-branch text says 10. The catalogue deliberately shows no street number and flags the meeting point for confirmation. No opening-hours, health, kashrut, allergy or vendor-agreement claim is inferred.

## Photography: reviewed, not bundled

No third-party photographs are currently used in the live catalogue. Original-file downloads failed: sandbox DNS restriction first, then HTTP 429 from Wikimedia outside the sandbox, including one identifiable-user-agent retry for the small tahini image. Repeated source requests were stopped. No partial image files were retained, remote hotlinks configured, substitute images invented or original owner images reused. All four entries therefore use the approved text-only fallback. This is a visual limitation of the delivered slice, not a claim that the photo-led treatment has been browser-approved.

Reviewed candidates for later acquisition (25 Oct 2026):

| Source record | Author | Licence reviewed | Intended attribution/context |
|---|---|---|---|
| [Tahini.jpg](https://commons.wikimedia.org/wiki/File:Tahini.jpg), 800×544 | Chubbychef | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) selected from the offered licences | Generic illustrative tahini, not the confirmed mill's serving; source describes unidentified additions, so never infer ingredients from it |
| [ChocolateRugelach.JPG](https://commons.wikimedia.org/wiki/File:ChocolateRugelach.JPG), 3072×2304 | Yair rand | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Generic illustrative pastry; no bakery participation or actual serving implied |
| [Potato bourekas](https://commons.wikimedia.org/wiki/File:Potato-Bourekas-11-08-2024_-_Jerusalem,_Israel.jpg), 1153×868 | PeleYoetz | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Source identifies Marzipan. Do not present as Hakmat's product; any use must clearly be illustrative or match the actual vendor |

For CC BY-SA candidates, retain author/source and licence links, identify resizing/cropping/other changes and retain the applicable licence for adapted image contributions. Even CC0 images should retain provenance. Future `FoodPhoto` records require source, author, licence URL, caption and change note. The shared card/detail renderers display these credits next to any supplied photo and must describe generic images as illustrative, not a confirmed vendor serving. A broken image falls back to readable text. Existing Rachmo photos are not used. No vendor was contacted.

## Architecture and navigation

`IndexFood → ListFoodTasting → PreviewFoodTastingCard`, with `PreviewFoodTasting` for details. The existing authenticated Index supplies `view.sharedBalance.foodTokens`; Food does not fetch or write group state. Native button controls open details. A validated optional `foodId` in existing browser history/session navigation supports detail refresh and browser Back without replacing the underlying mission. Unknown IDs fall back to the catalogue. The active Food tab returns to the catalogue.

IndexFood saves catalogue scroll offset and initiating entry ID locally and in session storage. Returning restores scroll and keyboard focus; detail entry focuses its heading. No shared data or tokens are stored in that UI preference. Existing map/mission navigation remains. Layout uses one list column, wrapping text, 48 px minimum controls, inherited IBM Plex/brand tokens and normal document flow. It reuses the measured bottom-nav/safe-area offset for scroll clearance. No new animations or fixed overlay.

## Verified and unverified

- **137/137 Shuk tests** pass; **61/61 Memory Protocol tests** pass.
- TypeScript no-emit/nonincremental, targeted Shuk ESLint, both new/changed Food Sass modules and `git diff --check` pass.
- Full lint retains three existing prototype `no-require-imports` errors and eleven unrelated warnings.
- Final read-only smoke check: existing game page HTTP 200; loopback port 3000 still owned by PID 49156. No authenticated action was sent.
- Static TSX/callback tests cover actual shared balances including zero, no duplicate balance panel, all four catalogue/detail states, unknown prices, pending dietary/vendor data, no checkout/transaction controls, credited image fixtures and broken/missing image fallback, focus/scroll restoration and validated detail history without mission changes. Fixture images are not bundled catalogue images.
- Responsive CSS was inspected/compiled for narrow-width wrapping, single-column list, minimum touch sizes and inherited bottom-nav clearance. No real browser, screenshot, mobile/zoom or assistive-technology acceptance is claimed; repository browser-review rules leave that to the owner.
- No production build over active `.next/`; no route/config/dependency change or new served asset was introduced. No server interruption, `.next` deletion, commit, push or deployment.

No live group JSON was edited or restored. Its hash changed during the active session; this work did not determine the cause and preserved the latest file. Unrelated dirty changes, including visible library-asset moves/deletions and new `public/national-library/` files, were left untouched.

Browser review: Food tab at zero/nonzero balance, all four cards, Back to Food and browser Back, refresh while in a detail, scroll/focus restoration, text-only presentation, live balance changes from another profile, narrow/zoomed phone widths, keyboard and bottom-nav/home-indicator clearance. Content/serving/price/image acceptance remains pending.

## Changed files and next iteration

New: `lib/amazing-shuk/food-catalogue.ts`, `food-catalogue-view.ts`, `food-catalogue-ui.test.ts`; `components/amazing-shuk/IndexFood.tsx`, `ListFoodTasting.tsx`, `PreviewFoodTastingCard.tsx`, `PreviewFoodTasting.tsx`, `PreviewFoodPhotoCredit.tsx`, `FoodTasting.module.scss`.

Updated: `PreviewFoodRewards.tsx`/SCSS; `dev/IndexWaterTask.tsx`; `shuk-navigation.ts` and its tests; `participant-avatar-ui.test.ts`; `mission-arrival-ui.test.ts`; shared decisions/current state/handoff/roadmap and this record. No image assets or backend game files changed in this slice.

Smallest second iteration, after a single tasting has approved participation/serving/cost/availability: a separate guide-only confirmation preview for that tasting, followed by one atomic, permission-checked, idempotent redemption record in the existing store. It must reject insufficient balance/retries/concurrent double-spend and preserve all existing earned rewards. This is a recommendation only; nothing from that iteration is implemented here. Photography acquisition can be completed independently before redemption work.
