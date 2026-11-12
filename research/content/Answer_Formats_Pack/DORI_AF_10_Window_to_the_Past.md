# Window to the Past: Tilt-to-Look Historical Views

**Status:** research synthesis, 4 Nov 2026. Owner idea: a fake-3D scene that moves as the phone moves and shows the place as it was. Pending decision. Proposed ID: `ANS-WINDOW`, a reveal mode paired with a looking task.

## Bottom line

**Technically feasible in a mobile web app,** with no native app needed. The phone's motion sensor turns a historical scene as the player turns the phone. True live-camera AR is **not** available in iPhone browsers, so the view is a "magic window", not an overlay.

The real costs are **content and honesty**. Every pixel beyond the archival photo is invented and must be labelled.

Immersion raises excitement but can **lower learning**. Keep it short and stationary, and pair it with a task: "what's gone, what's still here?"

## Four versions, cheapest first

| Version | What players see | Source material | Invented content | Effort |
|---|---|---|---|---|
| **A. Then/now fade** | Archival photo fades into today at the same spot | 1 archival photo | None | Low; shares the rephotography spot (Run 10b) |
| **B. Parallax photo (2.5D)** | The archival photo splits into depth layers that shift as the phone tilts | 1 archival photo plus a depth map | Small: edges filled in where layers separate | Low–medium |
| **C. 360° look-around** | Turn around and the whole past street surrounds you | Full reconstruction (artist or AI) | **Most of it** | High |
| **D. Walkable 3D model** | Move through the old street | 3D model | Most | Very high; out of scope |

**INFERRED:**
- **B is the closest match to the idea** at reasonable cost, and it fits the archival photos already identified, such as the Matson collection (public domain; see Run 10b).
- **C** is what Timelooper and Lithodomos did.
- **A** is the honest baseline.

## Technical facts

| Fact | Label |
|---|---|
| iPhone Safari needs `DeviceOrientationEvent.requestPermission()` called **from a tap**, over HTTPS. Android grants motion access automatically | OBSERVED: [OpenReplay](https://blog.openreplay.com/understanding-device-orientation-api/); [WebKit bug 201676](https://bugs.webkit.org/show_bug.cgi?id=201676) |
| Motion can be measured relative to the start position or as an absolute compass heading. The compass can be disturbed by nearby electronics | OBSERVED: [OpenReplay](https://blog.openreplay.com/understanding-device-orientation-api/) |
| One study estimated an iPhone's compass accuracy at 10–15° | OBSERVED (one device, estimate only): [EAI 2018](https://eudl.eu/pdf/10.4108/eai.21-6-2018.2276641) |
| iPhone Safari has **no WebXR AR**; Apple routes AR through Quick Look | OBSERVED: [Born, 2026](https://born-website.pages.dev/insights/webxr-standards-2026/) |
| A single photo can be turned into a 3D camera move: estimate depth → point cloud → fill revealed gaps | OBSERVED: [Niklaus et al. 2019, Adobe Research](https://research.adobe.com/publication/3d-ken-burns-effect-from-a-single-image) |
| AI 360° panoramas: Skybox AI lists commercial licensing only on Business ($112–140/month); API from Standard | OBSERVED: [Blockade Labs plans](https://skybox.blockadelabs.com/plans), read 4 Nov 2026 |

**Design reading (INFERRED):**
- **Don't rely on the compass.** Put a stand-here marker on the ground, show "face the green door, then tap Start", and use relative motion from that tap. That tap also gives iPhone its required permission gesture.
- **Fallback:** drag with a finger, and the plain then/now fade if motion is denied.
- Version B only needs a limited tilt range (about ±15°). Beyond that, the invented edge-fill shows.

## Competitor and precedent scan

| Product | What it does | Label |
|---|---|---|
| **Streetmuseum** (Museum of London, 2010) | Free; GPS finds the site; "3D View" lays the archival photo over the live camera | OBSERVED: [PetaPixel](https://petapixel.com/2010/05/24/museum-of-london-releases-augmented-reality-app-for-historical-photos) |
| **Timelooper** (2016) | 360° videos that move with the phone; unlocked only on site; reconstructed with actors, green screen and effects; London and Ephesus | OBSERVED: [GeekDad](https://geekdad.com/2016/03/timelooper-app/) |
| **Lithodomos Ancient Jerusalem** (2017) | 360° first-century reconstruction from the same spot at the Western Wall; built from excavation records and site plans; $1.99–2.99 | OBSERVED: [Live Science](https://livescience.com/58566-ancient-jerusalem-reconstructed-in-virtual-reality-app.html) |
| **Mughrabi Quarter 3D** (Open Jerusalem, 2023) | Phone app to walk the lost quarter; reconstruction sources not stated in coverage | OBSERVED: [TechXplore](https://techxplore.com/news/2023-06-3d-app-uncovers-lost-mughrabi.pdf) |
| Anything like this in Mahane Yehuda or Nachlaot | None found | UNKNOWN (search not exhaustive) |

**Honest negative:** most of these precedents are from 2010–2017. No evidence was found that any became a lasting commercial product. Novelty fades.

## Learning and safety evidence

| Finding | Label |
|---|---|
| Headset VR gave **more presence (d = 1.30) but less learning (d = 0.80)** and higher cognitive load than a desktop version | OBSERVED (52 students, science lab simulation): [Makransky et al. 2019](https://imotions.com/blog/adding-immersive-virtual-reality-to-a-science-lab-simulation-causes-more-presence-but-less-learning) |
| AR meta-analysis: medium learning gain, d = 0.68 (64 studies, mostly formal education) | OBSERVED: [Garzón & Acevedo 2019](https://learntechlib.org/p//209849) |
| Cybersickness rises in headsets compared with ordinary screens; better quality reduces it | OBSERVED (abstract): [Saeed & Park 2022](https://scholarworks.sogang.ac.kr/item/28a0ef5c-cd24-45db-ac20-6db1a2b99810) |
| ~1,500 US emergency-room visits in 2010 from walking while using a phone; rising; likely undercounted | OBSERVED: [Nasar & Troyer 2013](https://engineering.osu.edu/news/2013/06/distracted-walking-injuries-soar-pedestrians-phones) |
| Comparing different-looking examples teaches the underlying idea | OBSERVED: Gentner & Namy 1999 (see 09) |
| Handheld tilt-views helping families learn on site | UNKNOWN |

**Design reading (INFERRED):**
- **Stationary only.** "Stop at the marker" comes first; the view pauses if the player starts walking. The market is crowded.
- **Short:** 10–30 seconds, then the phone goes down and players look at the real street.
- **Pair it with a task:** "find 3 things that are gone and 1 that's still here". This turns spectacle into comparison.
- **No narration while looking around** (see 05). Narrate before or after.
- **Show what is real:** "Archival photo, 1930s" vs "Reconstruction: details imagined". Keep the original photo one tap away. This follows the DORI fact/legend/interpretation principle and the owner's AI-openness rule.

## Links to other directions

- **Souvenir:** a then/now morph with the family (Run 10b owner direction).
- **Collections (09):** "a lion used to be here" can be a find.
- **Ordering (04):** then, middle and now as three windows.

## Unknown, with the cheapest test

| Question | Test |
|---|---|
| Does a parallax photo (B) beat a flat then/now pair (A) for recall of what changed? | A/B at one stop; next-day "what was different?" |
| How many iPhone users drop off at the motion-permission prompt? | Prototype; count taps vs grants |
| Can families stand still safely at market spots? | Observe 3 candidate spots at peak hours |
| How much invented edge-fill is acceptable? | Show 3 versions to the owner and one historian |
| Production time per stop for version B | Build one from a single Matson photo; log the hours |
