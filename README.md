# Greenlight

Greenlight is an AI-powered decision support tool that helps schools identify barriers to sustainable behavior and evaluate which improvements will have the greatest local impact.

Built for the USAII Global AI Hackathon 2026, the project combines deterministic scoring, public environmental data, interactive mapping, and AI-generated explanations to help students and school administrators make informed sustainability decisions.

Instead of giving generic advice like *"bike more"* or *"recycle more,"* Greenlight answers a more practical question:

> **What should we improve first, and what impact will that have?**

---

## Features

- Interactive map for exploring schools and surrounding infrastructure
- Barrier scoring based on accessibility, safety, equity, importance, and feasibility
- Scenario simulator for testing sustainability improvements before implementation
- AI-powered explanations of scores and projected outcomes
- Ranked intervention recommendations based on impact, cost, difficulty, and confidence
- Built-in Responsible AI guardrails and human verification workflow

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

The application works out of the box using bundled synthetic data. AI functionality is optional.

### Enable AI

Create a `.env.local` file:

```bash
HACKCLUB_AI_API_KEY=your_key_here
```

The API key is only used server-side through the recommendation API route.

---

## How It Works

Greenlight separates numerical calculations from AI-generated explanations.

```text
Location Data
      ↓
Deterministic Scoring Engine
      ↓
Scenario Simulation
      ↓
Intervention Ranking
      ↓
AI Explanation Layer
      ↓
Interactive Dashboard
```

All scores, rankings, and projections are generated locally using deterministic calculations.

The language model never generates numerical values—it only explains results and produces readable recommendations.

---

## Core Components

### Barrier Scoring

Each location is evaluated using five weighted categories:

- Accessibility
- Safety
- Environmental Importance
- Equity
- Feasibility

### Scenario Simulator

Users can simulate interventions such as:

- Bike racks
- Protected crossings
- Compost bins
- Recycling stations
- Bus stop relocation
- Shaded walkways

The application immediately recalculates projected scores, environmental impact, and expected behavior change.

### AI Recommendations

Greenlight ranks interventions using deterministic outputs and provides plain-language explanations, implementation guidance, and verification steps.

---

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Leaflet
- Lucide React
- Hack Club AI Proxy (Gemini)

---

## Project Structure

```text
app/
components/
components/map/
lib/
data/
```

Most application logic lives inside `lib/`, including scoring, simulation, intervention ranking, and explanation utilities.

---

## Data

Greenlight is designed to work with public, synthetic, or user-provided data.

Current sources include:

- OpenStreetMap
- GeoJSON datasets
- Synthetic environmental data
- Bay Area school index
- Census and EPA-inspired contextual datasets

Synthetic data is included so the application remains fully functional without external services.

---

## Responsible AI

Greenlight keeps calculations and AI reasoning separate.

- Numerical results are deterministic.
- AI explains existing results rather than generating them.
- Confidence and assumptions are displayed whenever appropriate.
- Recommendations are intended to support decision making, not replace human judgment.

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

Created for the USAII Global AI Hackathon 2026.
