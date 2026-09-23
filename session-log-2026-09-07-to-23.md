# Investigator Events — work log, 7 to 23 September 2026

Every change made in this session, why it was made, and what is still open.
Twenty-six commits, all deployed and verified live unless noted.

---

## 1. Weekly newsletter

Three issues sent on schedule — 7, 14 and 21 September — to a list that grew
203 → 214 across the period. No failures on any send.

**7 September — Android launch edition.** Android had gone live on Google Play
the day before and every app surface in the email still said "Android coming
soon": the banner pill, the compact strip, and the inbox preheader, which was
promising an EU rollout "next week" and had been stale for weeks. Added a
both-stores card that resolves from the date rather than a query parameter,
because Vercel's cron calls the route bare — and which expires on its own
after 13 September so no later week keeps announcing a launch that already
happened.

**A dark-mode bug found while doing it.** The email carries a neutraliser that
repaints every table and paragraph white-on-dark, to stop mail clients
auto-inverting a light email. It was also flattening the intentionally dark app
cards, so the headline and both buttons were unreadable in dark mode — and it
had been doing that to the iOS launch hero for weeks. Dark cards now opt out
through a `.dark-card` class declared in all three neutraliser contexts.

**Three fixes aimed at reviews.** "Leave a review" now deep-links `#reviews`
instead of dropping people at the top of the event page; the "Review past
events" row pointed at `/calendar`, which has nothing reviewable, and now
points at `/my-events`; and NALI, WAPI and SPI logos are WebP, which Outlook on
Windows cannot decode — they were rendering as broken-image boxes, so PNG twins
were added for email only while the site keeps WebP.

**Editorial length.** The 7 September draft ran to 250 words and included the
line "there are sixteen reviews on the entire site". Cut to 119 words and that
line removed — an internal metric that tells customers the place is empty. The
21 September issue was cut again, from roughly 200 words to 92, after it became
clear the intro was narrating the list of events the reader was about to scroll
through.

**Catch-up issue.** Someone confirming on a Tuesday had just been promised a
weekly briefing and then heard nothing for six days. Confirmation now sends
them the issue that already went out that week, gated on an issue having
actually been sent since Monday 00:00 UTC so nobody receives two copies.

Written as an awaited call rather than fire-and-forget. A detached promise
looked right for a courtesy send, but this runs on serverless — the function
can be frozen the moment the redirect returns, and the send would silently
never happen. It also reads events through `unstable_cache`, which needs the
request context a detached promise may have lost.

---

## 2. Multi-association events

`events.association` plus `events.co_association` allowed exactly two, so
multi-body events were being described in prose instead. The D.A.CH Forum names
four patrons — BUDEG, ÖDV, FSPD and SFPP — in its description and linked to
none of them.

**New `event_associations` table.** One row per (event, association), carrying a
role: host, co-host, patron or supporter. A patron is not a co-host and the
associations themselves care about the difference. Labels stay text rather than
a foreign key, because branding resolves through `findAssociationBranding(label)`
and several listed bodies have no record of their own.

All 54 existing links were backfilled, then D.A.CH's four and SNARP/WAD added.
The legacy columns are still populated from the first two rows, so the
newsletter, cards and OG images continued working untouched.

**Logo capping.** A four-patron event should not become a row of unreadable
18px marks. The event page groups them by role with names; cards show up to
three overlapping marks then a `+N` chip, reusing the attendee-avatar geometry
so it reads as native; email caps at two because Outlook breaks overlap.

**The gap that made it pointless.** Association pages, the embeddable widget and
the ICS feed each tested `association` alone, so a body that co-hosts or is a
patron saw nothing of its own event — BuDEG, ÖDV and FSPD all back the D.A.CH
Forum but only SFPP sat in the legacy column. All three callers now share one
matcher. Those are precisely the three surfaces an association looks at.

**Submissions were disconnected.** The junction table was only ever populated by
the backfill; every write path still wrote the two legacy columns and nothing
else. Admin create, update and approve now sync it, and the admin form gained
"Further co-hosts" and "Patrons" fields so a three- or four-way partnership can
be entered without SQL.

**A pre-existing bug found underneath.** The public submit form has always
rendered a "Co-association" dropdown that the action never read, so a joint
event silently lost its second body on submission. Both labels now travel in
the notes tag the admin form already reads back.

**A regression caught before shipping.** Widening that tag to
`[Association: SFPP, WAD]` broke the outreach lookup, which passed the whole
joined string to `findAssociationRecordByLabel` and matched nothing. It now
takes the first label.

Eighteen assertions were written and all passed, including case-duplicate
collapsing and removal actually removing rows.

---

## 3. Newsletter sign-up, and not nagging people

The ask was everywhere-but-never-nagging, so the box removes itself rather than
being placed carefully. Two suppression signals, because most visitors are
logged out: a cookie set on every success path of the subscribe endpoint,
including "already subscribed", read synchronously so there is no flash; and a
status endpoint covering a signed-in user whose account email joined from
another browser.

It renders nothing until it knows, so it never appears and then vanishes, and
it fails open — showing a box to an existing subscriber is a small annoyance,
hiding it from someone who never subscribed costs a subscriber.

Placed on the homepage hero (desktop and mobile, in a dark variant), every
event page, the associations index, and the logged-in dashboard.

**In-app invite for account holders.** Creating an account is not consent to
marketing email, so the ~76 account holders not on the list cannot legally be
added or mailed about it. A notification in their own bell is the consent-clean
way to ask, and unlike a homepage box it waits until they next visit.

Doing that exposed a rendering bug: the bell renders "{actorName} {body}" and
fell back to "Someone" with no actor, so the 15 existing review prompts already
said "Someone …". They now name the sender and carry the logo, rather than the
initial-letter avatar that rendered a grey circle with "I" in it.

---

## 4. Consent handling

**The newsletter checkbox on the email sign-up form had been pre-ticked since
23 April** and was never changed back. A pre-ticked box is not valid consent
under GDPR — consent has to be an affirmative act. 67 people on the list came
through that form while it was pre-ticked.

The double opt-in rescues most of it: those who reached "active" clicked a
confirmation link, which is affirmative. But the box should never have been
doing the asking, and it is unticked now.

**Declining left no trace.** Both sign-up flows only acted when the box was
ticked, so there was no way to tell someone who said no from someone who never
saw the question. A `newsletter_consent_log` table now records offered /
accepted / declined with a source, from both flows. The endpoint never fails
its caller — a logging problem must not break an account being created.

This was found by following a hunch that the pre-ticked period could be used to
identify genuine decliners. It could: the 10 accounts created since 23 April
that are not on the list must have actively unticked it, and those are the only
provable declines in the data.

---

## 5. Mobile

**The keyboard covered the field you were typing into.** On iOS the keyboard
overlays the page rather than resizing it, so anything near the bottom ends up
underneath. Fixed globally rather than per-form, because it affected every form
on the site. On focus, if the field would sit under the keyboard, it scrolls
into view once the keyboard has finished animating.

**The newsletter page was close to unusable on a phone.** `/weekly` was
scroll-jacked: two screen-heights of scrolling with the hero and the sign-up
card stacked inside one sticky `h-screen` box. On a phone that read as a screen
of empty gradient, a card floating mid-viewport, and the email field low enough
that the keyboard covered it. `h-screen` is `100vh`, which on iOS is taller than
the visible area. Mobile now gets a plain page with the form near the top;
desktop keeps the cinematic version.

**A footer change that had to be reverted.** Unhiding the desktop footer on
mobile buried the page under a full-height marketing block on every screen.
Reverted within minutes. The underlying gap is real — privacy, terms and
contact have no mobile home — but it needs a purpose-built compact bar, not the
desktop one. This change was not asked for and should not have been made.

---

## 6. Homepage and profile

**The homepage was showing events that had already finished.** `fetchFeaturedEvents`
had no date bound, and because the featured flag gets set once and never unset,
rows ordered by start date meant the six oldest won the slice — Intellenet and
the Professional Investigators Conference from April, DETCON from May, an SPI
lunch from June, ACFE from July. GSX the following week never made the cut.
Bound by end date rather than start, so an event running right now still counts.

**Attended events showed a stock photo of a laptop.** The profile list fell
through to `fallback.jpg` whenever an event had no stored image, putting
"online meeting" imagery on real conferences — WAD's mid-term in San José and
the IKD assembly in Sorrento among them, while `costarica.jpg` sat unused in the
same folder. 15 of the 16 events with no stored image now resolve to a real
photo.

**Review cards overflowed.** A long event title pushed the star rating off the
right edge. `truncate` cannot shrink a flex child on its own — min-width
defaults to auto — so `min-w-0` on the title and `shrink-0` on the stars.

---

## 7. Images

Eight files arrived as AVIF behind a `.jpg` extension across the session:
Brooklyn, Cartagena, Einsiedeln, and the six found in a folder audit —
`costarica`, `atlanticcity`, `austintexas`, `denver`, `detroit`, `lacoruna`.
`costarica.jpg` was the reason San José had no picture even though the file
existed and the mapping resolved to it: the bytes were AVIF, so anything that
actually decodes the image got nothing. All converted to real baseline JPEG,
which also matters because AVIF does not render in Outlook.

WALI's logo was WebP behind a `.png`, and untracked in git, so the page
referenced an image that was never deployed.

**One file was lost.** Converting `Einsiedeln.jpg` to `einsiedeln.jpg` was a
no-op on a case-insensitive filesystem, and the `rm` of the original then
deleted the only copy. It was never committed, so it was unrecoverable. The
method changed after that: convert to a temp path, verify the output, only then
replace, and keep a backup.

---

## 8. Associations

**WALI added** — Washington Association of Legal Investigators, founded 1997,
220+ members. Page, branding entry, association record, and the logo composited
onto `#3a6b77` sampled from their own site, because their white mark vanished
against the white logo tiles.

**WALI: Tradecraft 2026** listed — Seattle, 23 to 25 October, linked to WALI as
host. Created directly rather than through the admin action so no email could
fire.

**Associations added to site search.** Searching by name or acronym previously
returned nothing unless an event happened to mention it, so "WALI" returned a
CII event and no route to WALI's page. Search now has an Associations section
with logos, on desktop and the mobile overlay, wired into keyboard navigation.

**Twenty orphaned events linked.** Twenty events had a null association column
and no junction row, so their associations read as "never listed anything" —
TALI among them, whose conference opened the next day. Found while segmenting
for the campaign, and fixed before any email was drafted.

**Every association now has a working website.** Eleven had none at all — ABI,
BuDEG, CALI, CII, FALI, FEWA, IKD, Intellenet, NCISS, TALI, WAD — and three
more were dead links, including a typo'd `businesecurity.lv` missing an 's'.
All 17 supplied URLs were tested before applying.

---

## 9. Emails sent

- **Weekly newsletter** — 7, 14, 21 September, 203/211/214 recipients, no failures
- **WALI introduction** to Lael Henterly, President, after four drafts and
  Mike's approval. Sent from Mike with reply-to his own address.
- Proof copies of every newsletter to James before each send

Nothing else was sent. Every campaign remains drafted and held.

---

## 10. Marketing

**Reviews went 16 → 40** over the fortnight, almost entirely driven by the
newsletter asking. WAD Cannes has 11 and the CII AGM 9 — real write-ups from
named attendees.

**LinkedIn analysis.** Comparing reactions, which is the only metric common to
both formats: association-filmed video averages 27 reactions, photos about a
named event 20, own screen recordings 9, and any post asking the audience to do
something 6. The dividing line is giving news versus asking for something, not
video versus photo. Screen recordings are the most expensive format and the
weakest, because they are asks by nature.

**Video assets produced:** a reviews-video shot list, five Android emulator
clips at 60fps, the TALI "who's going" cuts, and the D.A.CH poster animated as
a 12-second pull-out zoom so the play button is honest.

**Association campaign drafted** — 56 tailored emails across three groups, tone
following Mike's relationship form. Nothing sent.

---

## Still open

1. **Outreach retry.** 13 emails sit at `failed` and are never retried — the
   processor only picks up `pending`, so one transient failure kills an email
   permanently, and no error is stored. CII, NALI, SPI, CALI, ASIS, FALI, NCAPI
   and PBSA never received theirs. Several addresses on file belong to the
   wrong organisation entirely.
2. **Click tracking is disabled at the Resend domain level**, which is why every
   send reads zero opens and zero clicks. Nothing in the code is broken.
3. **119 unconfirmed subscribers.** 115 are real people. Legally addable — single
   opt-in is valid consent — but 101 are older than 1 July, so a batched
   re-confirmation is safer than a bulk add.
4. **Video reminder sequence has never run.** 24 queued, 13 overdue, flag off
   since it was built. A reschedule script is written and dry-run: it cancels
   the four for the finished SPI event and re-bases the other 20.
5. **76-person in-app notification** ready, only the test to James sent.
6. **FSPD has no page**, despite being a patron of the D.A.CH Forum and co-host
   of the Einsiedeln AGM.
7. **ANDR's website points at a different organisation.**
8. **Detective Association of Finland** needs the WALI logo treatment.
9. **The old outreach template quotes stale figures** — "over 55 events, 100
   subscribers" against today's 88 and 340.
