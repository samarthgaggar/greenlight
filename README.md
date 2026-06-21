# Greenlight

> AI-powered decision support for sustainable transportation and climate action in Bay Area high schools.

Greenlight helps Bay Area students, schools, and student organizations identify barriers to sustainable behavior and evaluate which improvements will have the greatest local impact.

Built for the **USAII Global AI Hackathon 2026**, Greenlight combines deterministic analysis, public infrastructure data, interactive mapping, and AI-generated explanations to help schools make informed sustainability decisions.

Instead of giving generic advice like *"bike more"* or *"recycle more,"* Greenlight answers a more practical question:

> **What changes should our school make first, and what impact will they actually have?**

---

## Features

- Interactive map of Bay Area high schools and surrounding infrastructure
- Barrier analysis based on accessibility, safety, equity, importance, and feasibility
- AI-powered scenario simulator for testing sustainability improvements before implementation
- Ranked intervention recommendations based on projected impact, cost, difficulty, and confidence
- Plain-language AI explanations backed by deterministic calculations
- Responsible AI guardrails with built-in human verification workflow

---

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open **http://localhost:3000**.

Greenlight works out of the box using bundled synthetic data. Live AI functionality is optional.

### Enable AI

Create a `.env.local` file:

```bash
HACKCLUB_AI_API_KEY=your_key_here
```

The API key is only accessed server-side through the recommendation API route.

---

## How It Works

Greenlight separates calculations from AI explanations.

```text
Location & Infrastructure Data
              │
              ▼
Deterministic Barrier Scoring
              │
              ▼
Scenario Simulation
              │
              ▼
Impact Ranking Engine
              │
              ▼
AI Explanation Layer
              │
              ▼
Interactive Dashboard
```

All scores, projections, rankings, and simulations are calculated locally using deterministic logic.

The language model never generates numerical values. It explains results, summarizes findings, and provides actionable recommendations in plain language.

---

## Core Components

### Barrier Scoring

Every location is evaluated across five weighted categories:

- Accessibility
- Safety
- Environmental Importance
- Equity
- Feasibility

### Scenario Simulator

Users can simulate sustainability improvements including:

- Secure bike racks
- Protected crosswalks
- Compost bins
- Recycling stations
- Bus stop relocation
- Shaded walkways

Each simulation instantly updates projected barrier scores, expected behavior change, and environmental impact.

### AI Recommendations

Greenlight prioritizes interventions using deterministic calculations and provides:

- Plain-language explanations
- Ranked recommendations
- Implementation guidance
- Verification steps
- Confidence estimates

---

## Tech Stack

- **Framework:** Next.js 16
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Mapping:** React Leaflet + Leaflet
- **Icons:** Lucide React
- **AI:** Hack Club AI Proxy (Gemini)

---

## Project Structure

```text
app/                  Application pages, layouts, API routes
components/           Reusable UI components
components/map/       Interactive Leaflet map
lib/                  Scoring, simulation, ranking, utilities
data/                 Bay Area datasets and synthetic demo data
```

Most application logic lives inside `lib/`, including the deterministic scoring engine, scenario simulation, intervention ranking, and explanation utilities.

---

## Data

Greenlight is designed specifically for **Bay Area high schools** and uses a combination of public, synthetic, and user-provided data.

Current data sources include:

- Bay Area high school locations
- OpenStreetMap infrastructure data
- GeoJSON boundary data
- Synthetic transportation and environmental datasets
- Census and EPA-inspired contextual data

Bundled datasets ensure the application remains fully functional even when external services are unavailable.

---

## Responsible AI

Greenlight keeps calculations and AI reasoning separate.

- Numerical results are generated deterministically.
- AI explains existing results rather than creating them.
- Confidence levels and assumptions are surfaced whenever appropriate.
- Recommendations are intended to support decision-making, not replace human judgment.

Students, teachers, and school administrators are encouraged to verify recommendations before acting on them.

---

## Development

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

---

## License

Created for the **USAII Global AI Hackathon 2026**.
