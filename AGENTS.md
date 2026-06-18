# AGENTS.md

Guidance for agents working in this repository.

## Project State

This repository contains Greenlight, a Next.js + TypeScript hackathon MVP for mapping local climate-action barriers and ranking practical fixes students can verify.

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
- `lib/` contains shared types, action definitions, and scoring helpers.
- `data/` contains synthetic demo JSON and GeoJSON fallback data.

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

Never paste the key into frontend code. The frontend calls `/api/recommendation`; only `app/api/recommendation/route.ts` reads the server-side environment variable.

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
