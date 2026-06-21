# Greenlight

**Find what blocks local climate action — and what happens if you fix it.**

Greenlight is a Next.js hackathon MVP for the [USAII Global AI Hackathon 2026](https://www.usaii.org/) High School Track: *AI for Everyday Good, Environment Brief — Make Climate Action Local & Real.*

Instead of generic advice like “bike more” or “compost more,” Greenlight asks a sharper question:

> **If we make this sustainability improvement, what happens?**

The app maps local barriers on a real place, ranks practical fixes students can verify, **simulates projected impact instantly**, and uses AI only to explain what the deterministic engine already calculated.

---

## What’s new

This update turns Greenlight from a barrier finder into a full **decision-support workflow**:

| Step | What you get |
|------|----------------|
| **Map the place** | Search schools, corridors, parks, or custom locations with offline-friendly local data |
| **Rank barriers** | Deterministic 0–100 scoring across access, safety, importance, equity, and feasibility |
| **Simulate improvements** | Pick interventions and see projected score, emissions, waste, and adoption change in real time |
| **Prioritize fixes** | AI impact ranking orders options by environment, cost, difficulty, behavior, and confidence |
| **Explain with AI** | LLM narrates scores and scenarios in plain language — it never generates numbers |

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works fully offline with bundled demo data. Live AI is optional.

### Optional: enable live AI

Create `.env.local` in the project root:

```bash
HACKCLUB_AI_API_KEY=your_key_here
```

Never put the key in frontend code. Only `app/api/recommendation/route.ts` reads it server-side. `.env.local` is gitignored.

---

## How to use it

1. **Pick a location** — use the search bar or choose from the local Bay Area high-school index.
2. **Choose a climate goal** — school commute, biking, composting, transit, and more.
3. **Open the scenario simulator** — select one or more improvements (bike racks, crosswalks, compost bins, etc.).
4. **Review projected impact** — compare baseline vs. projected barrier score, emissions, waste, and adoption.
5. **Check AI impact ranking** — see which fixes rank highest for this barrier.
6. **Run full AI analysis** — get explanations, recommended fixes, verification steps, and a decision-maker message.

Navigation shortcuts in the header: **Simulator**, **Map**, **AI**, **Guardrails**, **Data**.

---

## Architecture

Greenlight follows a strict separation of concerns:

```
Local data + scoring engine  →  all numbers (scores, projections, rankings)
         ↓
   /api/recommendation       →  prose only (explanations, narration)
         ↓
            UI               →  maps, panels, checklists
```

### Deterministic engine (`lib/`)

| Module | Role |
|--------|------|
| `scoring.ts` | Barrier scores (0–100) from five weighted categories |
| `interventions.ts` | Catalog of simulatable improvements with synthetic effect coefficients |
| `simulation.ts` | `projectScenario()` — instant what-if projections per barrier |
| `ranking.ts` | `rankInterventions()` — deterministic impact prioritization |
| `explain.ts` | Decomposes scores and projection deltas into readable factors |

### Simulatable interventions

- Protected bike arrival box
- Secure bike racks
- Marked crosswalk / crossing aid
- Compost bins
- Recycling access
- Bus stop relocation
- Shaded walkway

All effect numbers are **synthetic and deterministic** for this MVP — they power local what-if modeling, not measured field data.

### AI route tasks

`POST /api/recommendation` accepts a `task` discriminator:

| Task | Purpose |
|------|---------|
| `explanation` | Full barrier analysis, fixes, and verification checklist |
| `factors` | Root-cause factor narration |
| `scenario` | Plain-language explanation of a simulated improvement |

If the API key is missing or a request fails, structured mock output keeps the UI usable.

**Live endpoint:** `https://ai.hackclub.com/proxy/v1/chat/completions`  
**Primary model:** `google/gemini-3.5-flash` (with free-model fallbacks)

---

## Scoring categories

Every barrier score is computed locally — never by the LLM:

| Category | Max points |
|----------|------------|
| Access gap | 25 |
| Safety / friction | 25 |
| Action importance | 20 |
| Equity / access concern | 15 |
| Fix feasibility | 15 |

---

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS with CSS variable themes (light / dark / system)
- **Maps:** Leaflet + React Leaflet
- **Icons:** Lucide React
- **AI:** Hack Club AI proxy (server route only)

---

## Project structure

```
app/                  Next.js pages, layout, global styles, API routes
components/           UI panels, map, navbar, simulator, AI explanation
components/map/       Client-only Leaflet map
lib/                  Scoring, simulation, ranking, interventions, types
data/                 Synthetic demo JSON, GeoJSON, Bay Area school index
```

Key UI components:

- `InterventionSelector` — pick improvements to simulate
- `ProjectedImpactPanel` — before/after metrics and scenario narration
- `InterventionRankingPanel` — ranked fix prioritization
- `AIExplanationPanel` — deterministic score breakdown + AI summary
- `VerificationChecklist` — student verification steps

---

## Showcase / demo mode

Greenlight includes a recording-ready flow for hackathon walkthroughs.

**Activate showcase mode:**

1. Open [http://localhost:3000/?showcase=greenlight](http://localhost:3000/?showcase=greenlight)
2. Press **Shift + G + L**
3. Click the Greenlight logo five times quickly

**Developer settings:** Press **Shift + D + E + V**

Before recording:

1. Confirm the bottom-left **Ready** badge appears
2. Set AI Mode to **Reliable** for stability
3. Turn on **Presentation Mode**
4. Use **Copy Showcase URL** from developer settings if needed

Developer settings include showcase toggle, AI mode, theme, presentation mode, API status, and reset — never the raw API key.

---

## Data sources

Greenlight is designed for public, open, synthetic, or user-entered data:

- OpenStreetMap / Overpass API (capable)
- Census TIGER / ACS-style context
- EPA EJScreen-style context
- California Department of Education school sites (Bay Area high-school search index)
- Local JSON and GeoJSON fallbacks

The MVP ships synthetic local files plus a generated school index so the experience stays reliable when live services are unavailable.

---

## Responsible AI

Greenlight separates **observed evidence** from **AI inference**:

- Does not invent infrastructure, safety conditions, demographic claims, or legal conclusions
- Uses demographic/environmental context only to prioritize fairness — not to stereotype
- Requires human verification before treating any output as final
- Students should not inspect unsafe roads alone

Every recommendation includes uncertainty, a verification checklist, and a message students can send to a school admin or city official. The app recommends decisions; it does not make final infrastructure judgments.

---

## Development

```bash
npm install          # install dependencies
npm run dev          # start dev server
npm run build        # production build
npm run start        # run production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```

No automated test suite is defined yet.

---

## Decision impact

**Before:** Students get generic climate advice with no local context.

**After:** Students see the exact barrier blocking action, evidence behind it, simulated impact of specific fixes, confidence levels, and realistic next steps they can verify on the ground.

---

## License

Hackathon MVP — see repository owner for usage terms.
