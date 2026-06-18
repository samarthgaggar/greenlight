# Greenlight

Greenlight is a polished hackathon MVP for the USAII Global AI Hackathon 2026 High School Track: AI for Everyday Good, Environment Brief, "Make Climate Action Local & Real."

Tagline: Find what blocks local climate action, and what to fix first.

Greenlight maps the local barriers that make climate action fail, then ranks practical fixes students and communities can verify. Instead of only telling people to bike more, compost more, waste less, or use transit, it asks whether those actions are actually possible in a specific local place.

## How to install

```bash
npm install
```

## How to run

```bash
npm run dev
```

Then open the local URL printed by Next.js, usually [localhost:3000](http://localhost:3000).

## How to use the local experience

The app works without live API access. Choose a location, select a climate action goal, click map markers or dead-zone cards, and review the AI explanation, recommended fixes, verification checklist, and decision-maker message.

All required local data files live in `data/`, so the product remains usable even when live map or AI services are unavailable.

## Showcase Flow

Greenlight includes a subtle recording-ready flow so the app stays reliable during a hackathon walkthrough.

Showcase flow options:

1. Open [localhost:3000/?showcase=greenlight](http://localhost:3000/?showcase=greenlight)
2. Press Shift + G + L
3. Click the Greenlight logo five times quickly

Developer settings:

Press Shift + D + E + V.

Before recording:

1. Use [localhost:3000/?showcase=greenlight](http://localhost:3000/?showcase=greenlight)
2. Confirm the bottom-left "Ready" badge appears
3. Open developer settings if needed
4. Set AI Mode to Reliable for recording stability
5. Turn on Presentation Mode
6. Click "Open Local Analysis"

Developer settings include Showcase Flow on/off, AI Mode, Theme, Reset Showcase Flow, Copy Showcase URL, Presentation Mode, and API status. The panel never displays the API key; it only shows whether a server-side key exists.

## How to add the API key safely

Before testing live AI, create a file called `.env.local` in the project root and add:

```bash
HACKCLUB_AI_API_KEY=actual_key_here
```

Never paste the API key into frontend code. The frontend only calls `/api/recommendation`. The key is read only inside the server route at `app/api/recommendation/route.ts`. `.env.local` is ignored by git.

## AI architecture

Greenlight uses deterministic scoring first. The score is never created by the AI.

Scoring categories:

- Access gap: 0-25
- Safety/friction: 0-25
- Action importance: 0-20
- Equity/access concern: 0-15
- Fix feasibility: 0-15

After scoring, the frontend sends structured JSON to `/api/recommendation`. If `HACKCLUB_AI_API_KEY` exists, the route calls Hack Club AI:

- Endpoint: `https://ai.hackclub.com/proxy/v1/chat/completions`
- Model: `google/gemini-3.5-flash`

If the key is missing or the request fails, the route returns structured reliability output and the UI keeps the analysis experience intact. Live responses identify the active AI engine.

## Data sources

Greenlight is designed for public, open, synthetic, or user-entered data only:

- OpenStreetMap / Overpass API
- Census TIGER / ACS-style context
- EPA EJScreen-style context
- Local JSON and GeoJSON data

The current MVP ships synthetic local files so it fully works even when all live APIs fail.

## Responsible AI guardrail

Greenlight separates observed evidence from AI inference. It does not invent infrastructure, safety conditions, demographic claims, or legal conclusions. Safety claims require human verification, and students should not inspect unsafe roads alone.

Demographic or environmental context is used only to prioritize fairness and access. It must not be used to stereotype communities or infer individual behavior.

## Human-in-the-loop design

Every recommendation includes uncertainty, observed evidence, AI inference, a verification checklist, and a message students can send to a school admin or city official. The app recommends decisions; it does not make final infrastructure judgments.

## Decision impact statement

Before:
Students receive generic climate advice like "bike more," "compost more," or "use transit."

After:
Students see the exact local barrier blocking that action, the evidence behind it, the confidence level, and the most realistic next step to verify or fix it.

## Development commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
```
