# AGENTS.md

Guidance for agents working in this repository.

## Project State

This repository contains Greenlight, a Next.js + TypeScript hackathon MVP for mapping local climate-action barriers and ranking practical fixes students can verify. It is an AI-powered sustainability decision support platform built around one question: "If we make this sustainability improvement, what happens?"

The deterministic scoring/simulation engine produces every number. The LLM only explains those numbers in words and must never generate or modify numeric values.

## Stack

- Next.js App Router
- TypeScript
- React components
- Tailwind CSS with CSS variables for light/dark themes
- Leaflet / React Leaflet for the map
- Hack Club AI API through a server route only

## Source Layout

- `app/` contains the Next.js app, global styles, and API routes.
- `components/` contains UI components.
- `components/map/` contains the client-only Leaflet map implementation.
- `lib/` contains shared types, action definitions, and the deterministic engine.
- `lib/scoring.ts` holds score categories, severity, and confidence helpers.
- `lib/interventions.ts` is the catalog of simulatable improvements with synthetic, deterministic effect coefficients.
- `lib/simulation.ts` exposes `projectScenario` for instant per-barrier what-if projections (score, emissions, waste, adoption, confidence).
- `lib/ranking.ts` exposes `rankInterventions` for deterministic impact prioritization.
- `lib/explain.ts` decomposes a score into root-cause factors (`explainScore`) and projection changes (`explainProjection`).
- `data/` contains synthetic demo JSON and GeoJSON fallback data.
- `data/bay-area-high-schools.json` contains a generated local index of CDE high school sites within 100 miles of San Francisco for fast offline search suggestions.

## Working Principles

- Inspect the repository before making changes.
- Keep edits focused on the user request.
- Preserve user changes. Do not reset, checkout, or otherwise discard work unless explicitly asked.
- Prefer existing project patterns once they exist.
- Add comments only when they clarify non-obvious behavior.
- Use ASCII by default unless the surrounding file or user request clearly calls for Unicode.

## Filesystem And Search

- Use `rg` and `rg --files` for searching when available.
- Avoid committing generated or local-only files such as `.DS_Store`, build outputs, dependency directories, logs, and environment files.
- If new tooling is added, document the important commands here.

## Development Commands

- Install: `npm install`
- Development server: `npm run dev`
- Build: `npm run build`
- Test: no automated test suite is currently defined.
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

## Environment

For live Hack Club AI recommendations, create `.env.local` in the project root:

`HACKCLUB_AI_API_KEY=actual_key_here`

Never paste the key into frontend code. The frontend calls `/api/recommendation`; only `app/api/recommendation/route.ts` reads the server-side environment variable. That route accepts a `task` discriminator (`explanation`, `factors`, `scenario`) and returns prose narration only; it must never originate numeric values.

## Verification

Before finishing a code change:

- Run the narrowest relevant verification command available.
- If no verification command exists yet, state that clearly in the final response.
- For frontend work, run or preview the app when feasible and verify the rendered UI.

## Documentation Expectations

When adding major structure, update this file so future agents know:

- the chosen stack
- where source files live
- how to run the app
- how to test it
- any environment variables or local services required
