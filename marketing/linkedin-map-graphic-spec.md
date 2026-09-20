# LinkedIn Map Graphic — Rebuild Spec (v2)

All facts verified against the live Supabase DB on 2026-07-09.

## Header (unchanged)
- Title: **Where is the investigator industry meeting?**
- Date band: **JULY – SEPTEMBER 2026**  (all 5 featured events fall in this window ✓)
- Top-right badge: **LIVE PLATFORM · 33 UPCOMING EVENTS · 20+ COUNTRIES**

## The 5 featured events (replace the old set — one ACFE only)

| Card | Dates | City | Event name | Logo |
|------|-------|------|------------|------|
| 1 | AUG 19–22 | Nashville, USA | **NCISS 50th Anniversary Conference** | NCISS |
| 2 | SEP 1–6 | Cannes, France | **WAD Conference 2026** | World Association of Detectives |
| 3 | JUL 21–22 | Cape Town, South Africa | **ASIS SASCON 2026** (Sub-Saharan Africa) | ASIS International |
| 4 | AUG 17–19 | Hong Kong | **ACFE Asia-Pacific Conference** | ACFE |
| 5 | SEP 1–6 | Prague, Czech Republic | **CII AGM 2026** | Council of International Investigators |

Distinct orgs: NCISS · WAD · ASIS · ACFE · CII (only ONE ACFE ✓)

## Map pin positions (for global spread)
- **Nashville** → North America, far LEFT of map
- **Cannes** → Western Europe, upper CENTRE
- **Prague** → Central Europe, upper centre-RIGHT (slightly up/right of Cannes)
- **Cape Town** → Southern Africa, lower CENTRE
- **Hong Kong** → East Asia, RIGHT side
Sweep reads: left (US) → centre (2 Europe) → lower-centre (Africa) → right (Asia).

## Centre banner (unchanged)
**33 UPCOMING EVENTS — across 20+ countries worldwide**

## Footer stat bar — FIX THE SUBSCRIBER NUMBER
| Stat | Value | Note |
|------|-------|------|
| Events | **70+** | true (72) |
| Associations | **50+** | true (53) |
| Investigators | **140+** | true (141) |
| Subscribers | **285+** | ⚠️ CHANGED from "300+" — real is 289, so 300+ is false |

## Footer CTA (unchanged)
"Planning an event? Get in touch to have it featured on the global calendar." → GET IN TOUCH
