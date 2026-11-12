# 15 Nahlaot's synagogues: what OpenStreetMap has, and what it misses

11 Nov 2026 · Claude Code (web search and page reading), for the synagogue layer of the OSM map ([nahlaot-osm-map.md](../../../docs/map/nahlaot-osm-map.md)). Research, not approved content (`.claude/rules/content.md`). **No position below is checked on site**, and none comes from Google.

## The question

The map's synagogue layer comes from OpenStreetMap: 48 synagogues on the large frame's drawing, 42 of them inside the frame (after three graves were left out). Sources put Nahlaot's synagogues at "about 100" today and up to "about 300" in the past (both figures unsourced in the articles that give them). Which synagogues are missing from OSM, and where are they?

## The answer, in short

- **There is no open dataset of synagogue positions.** The Jerusalem municipality removed its list of synagogues from its website in 2020, after a petition about leaving out non-Orthodox congregations ([Hiddush](https://hiddush.org/article-23422-0-Hiddush_fighting_for_pluralism_in_Jerusalem.aspx)). Its GIS viewer may hold a layer, but this run didn't confirm one, and its terms of use are unchecked.
- **The written sources give names and streets, not points.** Hebrew Wikipedia's articles on Nahlaot and its sub-neighbourhoods, and the reshit.org walking tour, name about 20 synagogues with a street, a corner or a courtyard.
- **About half of those are already on the map** (OSM has them). About ten are not, among them the best-known one, **Ohel Moshe**.
- **The way to add them** is the owner's walk: one position (lat/lon) per synagogue, as was done for the courtyards. They would go into a hand list in the build script's CURATION block, and the build would merge them with OSM's.

## Named in the sources and already on the map (OSM)

| Synagogue | What the sources say | OSM name |
|---|---|---|
| Ades (עדס), Aleppo community, 1901 | 1 Be'er Sheva St, corner of Shilo ([en.wikipedia: Ades Synagogue](https://en.wikipedia.org/wiki/Ades_Synagogue)); at the start of Be'er Sheva St, Nahalat Zion (reshit) | בית כנסת עדס |
| Hesed ve-Rahamim (חסד ורחמים), Sephardi, 1925 | HaCarmel 18, Mazkeret Moshe (reshit's route) | בית הכנסת חסד ורחמים |
| Kol Rina (קול רינה) | "Be'er Sheva St 31, in the shelter" (he.wikipedia, from a summary of the page, not its text: **unconfirmed**) | קול רינה |
| Barashi (בראשי), Kurdistan community, 1936 | HaYarkon St, Zikhron Yosef (summary only, **unconfirmed**) | בית כנסת בראשי |
| Agudat Tze'irei Paras (אגודת צעירי פרס), Bushehr Persians, 1921 | Neve Shalom (summary only) | בית כנסת אגודת צעירי פרס |
| Shauli ve-Kashi (שאולי וכאשי) | no location stated | בית כנסת שאולי וכאשי |
| Or Zarua (אור זרוע), Ma'aravim, founded by Rav Amram Abuhatzeira, 1926 | Nahalat Ahim; "Shmuel Rafaeli 3" (summary only) | אור זרוע |
| The Orfali synagogue (האורפלי), Urfa community | "at the edge of the neighbourhood and Bezalel St" (photo caption, he.wikipedia: נחלת אחים) | בית כנסת של עדת האורפלים |

## Named in the sources and NOT on the map (candidates)

| Synagogue | Location as the source states it | Community, year | Source |
|---|---|---|---|
| **Ohel Moshe** (אהל משה), "the main Sephardi synagogue outside the walls" | In the centre of Ohel Moshe; reshit's route has "R' Arye St 31, corner of Mazkeret Moshe St" just before this stop, so probably this building | Sephardi; the plaque reportedly says 5643 (1883) (summary, unconfirmed); damaged in the 1927 earthquake | reshit; [he.wikipedia: אהל משה](https://he.wikipedia.org/wiki/%D7%90%D7%94%D7%9C_%D7%9E%D7%A9%D7%94) |
| Yismach Moshe (ישמח משה) | "the Ashkenazi synagogue in the neighbourhood" (Mazkeret Moshe); no street | Ashkenazi | [he.wikipedia: מזכרת משה](https://he.wikipedia.org/wiki/%D7%9E%D7%96%D7%9B%D7%A8%D7%AA_%D7%9E%D7%A9%D7%94) |
| Beit Avraham ve-Ohel Sarah (בית אברהם ואהל שרה), the Yanina (Ioannina) community | "on the second floor, on HaGilboa St, by Gan ha'Tut" | Romaniote | he.wikipedia: אהל משה; [en.wikipedia list](https://en.wikipedia.org/wiki/Synagogues_of_Jerusalem) |
| Toranto (טוראנטו), a one-room synagogue | "near HaGilboa St, by the entrance to Ohel Moshe that leads to Zikhron Tuvia" | not stated | he.wikipedia: אהל משה |
| HaGoral (הגורל) | Inside Batei Goral, "between Shomron and Mishkenot streets" | Yemenite rite | reshit |
| The Batei Rand synagogue | Inside Batei Rand: "through HaTavor St, then into HaNetziv St and in through an iron gate" | Hasidic (the founder a Sanz Hasid); land bought 1909 | reshit |
| The Batei Broida synagogue (Ohalei Ya'akov) | No address; the courtyard's main gate faces north to HaTavor St | Ashkenazi, nusach Ashkenaz; the courtyard from 1902 | reshit |
| Three on Bibas St: a Kurdish one, a Sephardi one, and that of the Jews from Nisibin (Turkey) and Qamishli (Syria) | "on Bibas St" (Shevet Tzedek) | Kurdish; Sephardi; Nisibin and Qamishli | [he.wikipedia: נחלאות](https://he.wikipedia.org/wiki/%D7%A9%D7%9B%D7%95%D7%A0%D7%AA_%D7%A0%D7%97%D7%9C%D7%90%D7%95%D7%AA) |
| Zachor Avraham (זכור אברהם) | Sha'arei Tzedek; no street | not stated | [he.wikipedia: שערי צדק](https://he.wikipedia.org/wiki/%D7%A9%D7%A2%D7%A8%D7%99_%D7%A6%D7%93%D7%A7_(%D7%A9%D7%9B%D7%95%D7%A0%D7%94)) |
| Ohavei Zion (אוהבי ציון), Shiraz Persians, 1906 | Neve Shalom (summary only); a stop on the Tower of David museum's Nahlaot tour ([tod.org.il](https://www.tod.org.il/en/event/nachlaottour/)) | Persian | en.wikipedia list; he.wikipedia (summary) |
| Tiferet Yisrael – Korazin (תפארת ישראל – כורזין), the Dervekli (Turkey) community | "corner of Bezalel and Korazin" (summary only, **unconfirmed**) | Turkish | he.wikipedia: נחלאות (summary) |
| Tzalha u-Mazal (צלחה ומזל), Yemenite | "Shabazi 31", Nahalat Ahim (one search result; page not read) | Yemenite | search result only |

The courtyard synagogues (Batei Rand, Batei Broida) sit at or near the owner's courtyard positions, which already are on the map as names.

## Not synagogues, left out of the layer

OSM tags three graves as places of worship with no religion: קבר בנימין בן יעקב (חדש), קבר הפני מנחם, קבר האדמו"ר מגור. All three are in the faded margin. The build now leaves out any worship place whose name starts "קבר".

## Update, 11 Nov 2026: Ohel Moshe is on the map

The owner gave its position: 31.782575, 35.21320. The longitude was first sent as 35.32020, about 10 km east, and confirmed as 35.21320. It is in the build script's `OWNER_SYNAGOGUES` list, with the source "owner, 11 Nov 2026", and is merged into the synagogue layer: 43 synagogues inside the large frame. The others below still wait for positions.

## How to add the missing ones (a proposal, not built)

1. On the owner's walk, take a position (lat/lon) at each candidate's door, and correct the name from its sign.
2. They go into a new CURATION list (like `COURTYARDS`): name in Hebrew and English, position, source "owner, <date>".
3. The build merges them with OSM's synagogues, skipping one that is already within 12 m.

Optionally, the corrections can go back to OpenStreetMap itself, under the owner's account.

Before Batei Rand, Batei Broida or any other synagogue is the subject of a **challenge**, its facts move into `docs/knowledge/` with these sources and their evidence labels. Until then they are map labels only.

## Sources and how they were read

- [he.wikipedia: נחלאות](https://he.wikipedia.org/wiki/%D7%A9%D7%9B%D7%95%D7%A0%D7%AA_%D7%A0%D7%97%D7%9C%D7%90%D7%95%D7%AA): the first ~40k characters were read verbatim. The synagogue section came only as a model summary, so rows marked "summary only" are unconfirmed. Last edit reportedly 19 May 2026 (also from the summary).
- [reshit.org: נחלאות](https://reshit.org/articles/%D7%A0%D7%97%D7%9C%D7%90%D7%95%D7%AA/): a walking-tour guide with 13 numbered stops, read in full; no date shown.
- he.wikipedia: [אהל משה](https://he.wikipedia.org/wiki/%D7%90%D7%94%D7%9C_%D7%9E%D7%A9%D7%94), [מזכרת משה](https://he.wikipedia.org/wiki/%D7%9E%D7%96%D7%9B%D7%A8%D7%AA_%D7%9E%D7%A9%D7%94) (last edit 8 May 2026), [נחלת אחים](https://he.wikipedia.org/wiki/%D7%A0%D7%97%D7%9C%D7%AA_%D7%90%D7%97%D7%99%D7%9D) (30 Jun 2025), [שערי צדק](https://he.wikipedia.org/wiki/%D7%A9%D7%A2%D7%A8%D7%99_%D7%A6%D7%93%D7%A7_(%D7%A9%D7%9B%D7%95%D7%A0%D7%94)) (28 May 2025).
- [en.wikipedia: Synagogues of Jerusalem](https://en.wikipedia.org/wiki/Synagogues_of_Jerusalem) (last edit 10 Oct 2026): Ades 1901, Ohavei Zion 1906, Ohel Moshe 1883, Or Zaruaa and the Yanina synagogue in Ohel Moshe; no addresses.
- [en.wikipedia: Ades Synagogue](https://en.wikipedia.org/wiki/Ades_Synagogue): the address, via a search result.
- **Not read:** the Jerusalem Post's "walking tour: synagogues for Slihot" (404); he.wikipedia's זכרון יוסף, סוכת שלום, משכנות ישראל and מחנה יהודה.
- **Discrepancy:** Ohel Moshe's founding year is 1882 on he.wikipedia and 1883 on reshit and en.wikipedia.
