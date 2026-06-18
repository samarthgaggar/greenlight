import { NextResponse } from "next/server";
import type { AIModelChoice, AIRecommendation } from "@/lib/types";

const HACKCLUB_AI_URL = "https://ai.hackclub.com/proxy/v1/chat/completions";
const PRIMARY_MODEL = "google/gemini-3.5-flash";
const LIVE_FALLBACK_MODELS = [
  "liquid/lfm-2.5-1.2b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-super-120b-a12b:free"
];
const MODEL_TIMEOUT_MS = 9000;

const systemPrompt =
  "You are Greenlight, a civic climate-action assistant. You help students and communities understand local barriers to climate action. Only reason from the structured data provided. Separate observed evidence from AI inference. Never invent infrastructure, safety conditions, demographic claims, or legal conclusions. Always include uncertainty and human verification steps. Do not blame individuals for climate inaction. Do not stereotype communities based on demographic data.";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const apiKey = process.env.HACKCLUB_AI_API_KEY;

  const forceMockAI = payload && typeof payload === "object" && (payload as Record<string, unknown>).forceMockAI === true;

  if (!apiKey || forceMockAI) {
    return NextResponse.json({
      ...createMockRecommendation(payload),
      mode: "mock"
    });
  }

  const modelAttempts = getModelAttempts(payload);
  const errors: string[] = [];

  for (const model of modelAttempts) {
    try {
      const { recommendation, modelUsed } = await callHackClubAI(apiKey, model, payload);

      return NextResponse.json({
        ...recommendation,
        mode: "live",
        modelUsed
      });
    } catch (error) {
      errors.push(`${model}: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  {
    return NextResponse.json({
      ...createMockRecommendation(payload),
      mode: "mock",
      error: errors.join(" | ") || "Live AI connection unavailable."
    });
  }
}

export async function GET() {
  return NextResponse.json({
    hasApiKey: Boolean(process.env.HACKCLUB_AI_API_KEY)
  });
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

async function callHackClubAI(apiKey: string, model: string, payload: unknown) {
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
          content: `Analyze this Greenlight barrier JSON and return concise strict JSON only matching the required schema. Keep every string short. Return no markdown: ${JSON.stringify(payload)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 520,
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

  const parsed = JSON.parse(stripCodeFence(content)) as Partial<AIRecommendation>;

  return {
    recommendation: normalizeRecommendation(parsed, payload),
    modelUsed: model
  };
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
