import { NextResponse } from "next/server";
import type {
  AIModelChoice,
  AIRecommendation,
  FactorNarrative,
  RecommendationTask,
  RootCauseGroup,
  ScenarioNarration
} from "@/lib/types";

const HACKCLUB_AI_URL = "https://ai.hackclub.com/proxy/v1/chat/completions";
const PRIMARY_MODEL = "google/gemini-3.5-flash";
const LIVE_FALLBACK_MODELS = [
  "liquid/lfm-2.5-1.2b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-super-120b-a12b:free"
];
const MODEL_TIMEOUT_MS = 9000;
const ROOT_CAUSE_GROUPS: RootCauseGroup[] = ["Infrastructure", "Accessibility", "Safety", "Behavior", "Feasibility"];

const systemPrompt =
  "You are Greenlight, a civic climate-action assistant. You help students and communities understand local barriers to climate action. Only reason from the structured data provided. Separate observed evidence from AI inference. Never invent infrastructure, safety conditions, demographic claims, or legal conclusions. Always include uncertainty and human verification steps. Do not blame individuals for climate inaction. Do not stereotype communities based on demographic data. CRITICAL: You never produce, modify, estimate, or invent numeric values. All scores, percentages, costs, emissions, waste figures, and counts are provided to you as authoritative deterministic inputs. Explain what those numbers mean in words only and describe magnitudes qualitatively (for example, 'high' or 'a large reduction'), never by writing new figures.";

const MAX_PAYLOAD_BYTES = 48_000;

export async function POST(request: Request) {
  // Guard against oversized payloads before parsing JSON.
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Request payload too large." }, { status: 413 });
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return NextResponse.json({ error: "Could not read request body." }, { status: 400 });
  }

  if (rawText.length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Request payload too large." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const task = getTask(payload);
  const apiKey = process.env.HACKCLUB_AI_API_KEY;
  const forceMockAI = payload && typeof payload === "object" && (payload as Record<string, unknown>).forceMockAI === true;

  if (!apiKey || forceMockAI) {
    return NextResponse.json({ ...buildMock(task, payload), mode: "mock" });
  }

  const modelAttempts = getModelAttempts(payload);
  const errors: string[] = [];

  for (const model of modelAttempts) {
    try {
      const { data, modelUsed } = await callModel(apiKey, model, buildUserPrompt(task, payload));
      return NextResponse.json({ ...normalizeForTask(task, data, payload), mode: "live", modelUsed });
    } catch (error) {
      errors.push(`${model}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  return NextResponse.json({
    ...buildMock(task, payload),
    mode: "mock",
    error: errors.join(" | ") || "Live AI connection unavailable."
  });
}

export async function GET() {
  return NextResponse.json({
    hasApiKey: Boolean(process.env.HACKCLUB_AI_API_KEY)
  });
}

function getTask(payload: unknown): RecommendationTask {
  const raw = payload && typeof payload === "object" ? (payload as Record<string, unknown>).task : undefined;

  if (raw === "scenario" || raw === "factors") {
    return raw;
  }

  return "explanation";
}

function buildUserPrompt(task: RecommendationTask, payload: unknown) {
  const data = JSON.stringify(payload);

  if (task === "scenario") {
    return `Explain this projected sustainability scenario for students. Return strict JSON only, no markdown, every string short: {"summary":"","whyItHelps":"","adoptionRationale":"","uncertainty":"","verificationChecklist":[""]}. Describe the projected score change, emissions, waste, and adoption qualitatively. Do not output any numbers. Data: ${data}`;
  }

  if (task === "factors") {
    return `Explain why each deterministic scoring factor contributes to this barrier. Return strict JSON only: {"factorNarratives":[{"group":"Infrastructure|Accessibility|Safety|Behavior|Feasibility","explanation":""}]}. One short sentence per group present in scoreExplanation. Do not output numbers. Data: ${data}`;
  }

  return `Analyze this Greenlight barrier JSON and return concise strict JSON only matching the required schema, plus a "factorNarratives" array of {group, explanation} that explains each scoreExplanation factor in one short sentence. Keep every string short. Do not output numbers. Return no markdown: ${data}`;
}

function normalizeForTask(task: RecommendationTask, data: Record<string, unknown>, payload: unknown) {
  if (task === "scenario") {
    return { scenarioNarration: normalizeScenario(data, payload) };
  }

  if (task === "factors") {
    return { factorNarratives: normalizeFactorNarratives(data, payload) };
  }

  return {
    ...normalizeRecommendation(data as Partial<AIRecommendation>, payload),
    factorNarratives: normalizeFactorNarratives(data, payload)
  };
}

function buildMock(task: RecommendationTask, payload: unknown) {
  if (task === "scenario") {
    return { scenarioNarration: createMockScenarioNarration(payload) };
  }

  if (task === "factors") {
    return { factorNarratives: createMockFactorNarratives(payload) };
  }

  return {
    ...createMockRecommendation(payload),
    factorNarratives: createMockFactorNarratives(payload)
  };
}

function normalizeRecommendation(candidate: Partial<AIRecommendation>, payload: unknown): AIRecommendation {
  const fallback = createMockRecommendation(payload);

  return {
    summary: stringOr(candidate.summary, fallback.summary),
    likelyCause: stringOr(candidate.likelyCause, fallback.likelyCause),
    observedEvidence: arrayOr(candidate.observedEvidence, fallback.observedEvidence),
    aiInference: stringOr(candidate.aiInference, fallback.aiInference),
    uncertainty: stringOr(candidate.uncertainty, fallback.uncertainty),
    rankedFixes: arrayOr(candidate.rankedFixes, fallback.rankedFixes),
    lowCostAction: stringOr(candidate.lowCostAction, fallback.lowCostAction),
    mediumCostAction: stringOr(candidate.mediumCostAction, fallback.mediumCostAction),
    longTermAction: stringOr(candidate.longTermAction, fallback.longTermAction),
    equityNote: stringOr(candidate.equityNote, fallback.equityNote),
    verificationChecklist: arrayOr(candidate.verificationChecklist, fallback.verificationChecklist),
    decisionMakerMessage: stringOr(candidate.decisionMakerMessage, fallback.decisionMakerMessage),
    responsibleAIWarning: stringOr(candidate.responsibleAIWarning, fallback.responsibleAIWarning)
  };
}

function normalizeScenario(candidate: Record<string, unknown>, payload: unknown): ScenarioNarration {
  const fallback = createMockScenarioNarration(payload);
  const source =
    candidate.scenarioNarration && typeof candidate.scenarioNarration === "object"
      ? (candidate.scenarioNarration as Record<string, unknown>)
      : candidate;

  return {
    summary: scrubNumbers(stringOr(source.summary, fallback.summary)),
    whyItHelps: scrubNumbers(stringOr(source.whyItHelps, fallback.whyItHelps)),
    adoptionRationale: scrubNumbers(stringOr(source.adoptionRationale, fallback.adoptionRationale)),
    uncertainty: scrubNumbers(stringOr(source.uncertainty, fallback.uncertainty)),
    verificationChecklist: arrayOr(source.verificationChecklist, fallback.verificationChecklist).map(scrubNumbers)
  };
}

function normalizeFactorNarratives(candidate: Record<string, unknown>, payload: unknown): FactorNarrative[] {
  const raw = candidate.factorNarratives;

  if (!Array.isArray(raw)) {
    return createMockFactorNarratives(payload);
  }

  const cleaned = raw
    .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>) : null))
    .filter((item): item is Record<string, unknown> => item !== null)
    .map((item) => ({
      group: ROOT_CAUSE_GROUPS.find((group) => group === item.group),
      explanation: typeof item.explanation === "string" ? scrubNumbers(item.explanation) : ""
    }))
    .filter((item): item is FactorNarrative => Boolean(item.group) && item.explanation.trim().length > 0);

  return cleaned.length > 0 ? cleaned : createMockFactorNarratives(payload);
}

// Defensively remove score/cost/quantity figures so deterministic values stay authoritative.
function scrubNumbers(value: string) {
  return value
    .replace(/\b\d+\s*\/\s*100\b/g, "the score")
    .replace(/\b\d+(\.\d+)?\s*%/g, "a notable share")
    .replace(/\$\s*\d[\d,\.]*\s*(k|m)?/gi, "the estimated cost")
    .replace(/\b\d[\d,\.]*\s*(kg|lbs?|pounds?|points?|tons?)\b/gi, "a meaningful amount")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getModelAttempts(payload: unknown) {
  const preferredModel =
    payload && typeof payload === "object" ? ((payload as Record<string, unknown>).preferredModel as AIModelChoice | undefined) : undefined;

  if (preferredModel === "gpt-oss") {
    return uniqueModels(["openai/gpt-oss-120b:free", "openai/gpt-oss-20b:free", PRIMARY_MODEL, ...LIVE_FALLBACK_MODELS]);
  }

  if (preferredModel === "nemotron") {
    return uniqueModels([
      "nvidia/nemotron-3-nano-30b-a3b:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      PRIMARY_MODEL,
      ...LIVE_FALLBACK_MODELS
    ]);
  }

  return uniqueModels([PRIMARY_MODEL, ...LIVE_FALLBACK_MODELS]);
}

function uniqueModels(models: string[]) {
  return Array.from(new Set(models));
}

async function callModel(apiKey: string, model: string, userPrompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  const response = await fetch(HACKCLUB_AI_URL, {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: {
        type: "json_object"
      }
    })
  }).finally(() => clearTimeout(timeout));

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(readUpstreamError(response.status, responseText));
  }

  let data: unknown;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error("Hack Club AI returned non-JSON transport response.");
  }

  const content = (data as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("Hack Club AI response did not include JSON content.");
  }

  const parsed = JSON.parse(stripCodeFence(content)) as Record<string, unknown>;

  return { data: parsed, modelUsed: model };
}

function readUpstreamError(status: number, responseText: string) {
  try {
    const parsed = JSON.parse(responseText) as { error?: { message?: string; code?: number } };
    return `Hack Club AI returned ${status}${parsed.error?.message ? ` (${parsed.error.message})` : ""}`;
  } catch {
    return `Hack Club AI returned ${status}`;
  }
}

function stripCodeFence(content: string) {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
}

function createMockScenarioNarration(payload: unknown): ScenarioNarration {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const deadZone = record.deadZone && typeof record.deadZone === "object" ? (record.deadZone as Record<string, unknown>) : {};
  const name = typeof deadZone.name === "string" ? deadZone.name : "the selected barrier";
  const labels = Array.isArray(record.interventionLabels)
    ? record.interventionLabels.filter((item): item is string => typeof item === "string")
    : [];
  const fixList = labels.length > 0 ? labels.join(", ") : "the selected improvements";

  return {
    summary: `Greenlight projected the effect of ${fixList} on ${name}. The figures shown come from the deterministic simulation; this explanation only describes what they mean.`,
    whyItHelps:
      "These improvements target the access, safety, and behavior factors that make this barrier score high, so easing them lowers the projected barrier and makes the climate-friendly choice easier.",
    adoptionRationale:
      "Projected adoption reflects how visible, safe, and convenient each improvement makes the better choice, scaled by how feasible the fix is locally.",
    uncertainty:
      "Projections use synthetic coefficients and local context. Real outcomes depend on verification, maintenance, and community response, so human verification is still required.",
    verificationChecklist: [
      "Confirm the barrier and proposed improvement on site with adult supervision.",
      "Measure a simple before-and-after count for a short period.",
      "Share the projection and observed result with the responsible decision maker."
    ]
  };
}

function createMockFactorNarratives(payload: unknown): FactorNarrative[] {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const explanation =
    record.scoreExplanation && typeof record.scoreExplanation === "object"
      ? (record.scoreExplanation as Record<string, unknown>)
      : {};
  const factors = Array.isArray(explanation.factors) ? explanation.factors : [];
  const groups = new Set<RootCauseGroup>();

  for (const factor of factors) {
    if (factor && typeof factor === "object") {
      const group = ROOT_CAUSE_GROUPS.find((candidate) => candidate === (factor as Record<string, unknown>).group);
      if (group) {
        groups.add(group);
      }
    }
  }

  const base: Record<RootCauseGroup, string> = {
    Infrastructure: "The physical layout and access paths contribute to how blocking this barrier feels.",
    Accessibility: "Equity and access conditions raise how much this barrier affects people who rely on the climate-friendly option.",
    Safety: "Safety and friction along the route add to the barrier because risk discourages the action.",
    Behavior: "The underlying climate action carries enough importance that the barrier meaningfully suppresses it.",
    Feasibility: "How easily a fix can be tested influences the priority of addressing this barrier."
  };

  const present = ROOT_CAUSE_GROUPS.filter((group) => groups.has(group));
  const selected = present.length > 0 ? present : ROOT_CAUSE_GROUPS;

  return selected.map((group) => ({ group, explanation: base[group] }));
}

function createMockRecommendation(payload: unknown): AIRecommendation {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const deadZone = record.deadZone && typeof record.deadZone === "object" ? (record.deadZone as Record<string, unknown>) : {};
  const locationName = typeof record.locationName === "string" ? record.locationName : "the selected location";
  const selectedAction = typeof record.selectedAction === "string" ? record.selectedAction : "the selected climate action";
  const name = typeof deadZone.name === "string" ? deadZone.name : "Selected barrier";
  const score = typeof deadZone.score === "number" ? deadZone.score : 0;
  const observedEvidence = Array.isArray(record.observedEvidence)
    ? record.observedEvidence.filter((item): item is string => typeof item === "string")
    : [];
  const recommendedFixes = Array.isArray(deadZone.recommendedFixes)
    ? deadZone.recommendedFixes.filter((item): item is string => typeof item === "string")
    : [];

  return {
    summary: `${name} is a ${score}/100 local barrier for ${selectedAction} at ${locationName}. The score comes from access, safety or friction, action importance, equity/access concern, and fix feasibility signals already calculated by Greenlight.`,
    likelyCause:
      "The barrier appears to come from a mismatch between where people need to take climate-friendly action and where the local system makes that action visible, safe, or convenient.",
    observedEvidence:
      observedEvidence.length > 0
        ? observedEvidence
        : [
            "Greenlight has a scored dead-zone record for this location.",
            "The score uses deterministic category inputs before AI explanation.",
            "Local verification is still required before making safety or infrastructure claims."
          ],
    aiInference:
      "Because the score is elevated, this is likely a practical design or operations problem rather than a lack of individual motivation. The next step should be a small verification test with photos, counts, or a supervised walkthrough.",
    uncertainty:
      "Map layers, observations, and demographic context may be incomplete. Greenlight still requires human verification before action.",
    rankedFixes:
      recommendedFixes.length > 0
        ? recommendedFixes
        : [
            "Run a supervised student verification walk-through.",
            "Collect before-and-after counts for the affected action.",
            "Send the documented barrier to the responsible school or city contact."
          ],
    lowCostAction: "Document the barrier with a supervised checklist, photos from safe public areas, and a short count of affected users.",
    mediumCostAction: "Pilot a temporary layout, sign, bin placement, or routing change for one week and compare the result.",
    longTermAction: "Request that the school, district, or city add the barrier to its capital planning or operations review process.",
    equityNote:
      "Equity context should be used to prioritize access and fairness, not to make assumptions about individuals or communities.",
    verificationChecklist: [
      "Confirm the barrier during the time when the climate action should happen.",
      "Have students verify only with adult supervision and from safe public locations.",
      "Capture photos or counts without identifying private individuals.",
      "Compare the observation against map data and campus or city rules.",
      "Ask the responsible decision maker which fix is feasible first."
    ],
    decisionMakerMessage: `Hello, we are using Greenlight to study local climate-action barriers at ${locationName}. The highest-priority issue we found is "${name}" with a deterministic score of ${score}/100. We are not asking you to treat this as a final infrastructure judgment. We would like to verify the evidence with a supervised walkthrough and discuss a practical first fix, such as a temporary placement, routing, signage, or safety review. Could you help us identify the right contact and the safest way to evaluate this?`,
    responsibleAIWarning:
      "This output supports student inquiry. It does not replace professional engineering, safety, legal, or environmental review."
  };
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function arrayOr(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === "string") && value.length > 0 ? value : fallback;
}
