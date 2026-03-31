import { formatCodeLabel, formatFieldLabel } from "./formatters.js";

export const scenarioFormOptions = {
  markets: ["nikkei225"],
  directions: ["downside", "upside"],
  horizonBuckets: ["1d_2w"],
  entryWindows: ["same_day", "same_week", "next_3_sessions", "next_5_sessions"],
  priceGatePolicies: ["standard_min_gate", "event_guarded_gate"],
  reviewCadences: ["morning", "intraday", "after_close", "weekly"]
};

const requiredTextFields = [
  "scenario_id",
  "market",
  "direction",
  "scenario_summary",
  "horizon_bucket",
  "entry_window",
  "observation_trigger",
  "flow_chain",
  "price_gate_policy",
  "invalidation_rule"
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function dedupePreservingOrder(values) {
  const seen = new Set();
  const deduped = [];

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    deduped.push(value);
  }

  return deduped;
}

function normalizeReviewCadence(values) {
  const rawValues = Array.isArray(values) ? values : [values];
  const normalized = dedupePreservingOrder(rawValues.map((value) => normalizeText(value)));
  return scenarioFormOptions.reviewCadences.filter((cadence) => normalized.includes(cadence));
}

function normalizeTags(values) {
  if (Array.isArray(values)) {
    return dedupePreservingOrder(values.map((value) => normalizeText(value)));
  }

  return dedupePreservingOrder(
    normalizeText(values)
      .split(/[;,]/)
      .map((value) => value.trim())
  );
}

function buildDraft(rawInput) {
  return {
    scenario_id: normalizeText(rawInput.scenario_id),
    market: normalizeText(rawInput.market),
    direction: normalizeText(rawInput.direction),
    scenario_summary: normalizeText(rawInput.scenario_summary),
    horizon_bucket: normalizeText(rawInput.horizon_bucket),
    entry_window: normalizeText(rawInput.entry_window),
    observation_trigger: normalizeText(rawInput.observation_trigger),
    flow_chain: normalizeText(rawInput.flow_chain),
    price_gate_policy: normalizeText(rawInput.price_gate_policy),
    invalidation_rule: normalizeText(rawInput.invalidation_rule),
    review_cadence: normalizeReviewCadence(rawInput.review_cadence),
    tags: normalizeTags(rawInput.tags),
    notes: normalizeText(rawInput.notes)
  };
}

function pushRequiredFieldErrors(draft, errors) {
  for (const field of requiredTextFields) {
    if (!draft[field]) {
      errors.push(`${formatFieldLabel(field)}は必須です`);
    }
  }
}

function pushEnumError(field, value, allowedValues, errors) {
  if (!allowedValues.includes(value)) {
    errors.push(
      `${formatFieldLabel(field)}は次のいずれかを選択してください: ${allowedValues
        .map((allowedValue) => formatCodeLabel(allowedValue))
        .join(" / ")}`
    );
  }
}

export function cloneRecords(records) {
  return JSON.parse(JSON.stringify(records));
}

export function createEmptyScenarioDraft() {
  return {
    scenario_id: "",
    market: scenarioFormOptions.markets[0],
    direction: scenarioFormOptions.directions[0],
    scenario_summary: "",
    horizon_bucket: scenarioFormOptions.horizonBuckets[0],
    entry_window: scenarioFormOptions.entryWindows[3],
    observation_trigger: "",
    flow_chain: "",
    price_gate_policy: scenarioFormOptions.priceGatePolicies[0],
    invalidation_rule: "",
    review_cadence: ["morning", "intraday", "after_close"],
    tags: [],
    notes: ""
  };
}

export function scenarioToDraft(scenario) {
  return {
    scenario_id: scenario.scenario_id,
    market: scenario.market,
    direction: scenario.direction,
    scenario_summary: scenario.scenario_summary,
    horizon_bucket: scenario.horizon_bucket,
    entry_window: scenario.entry_window,
    observation_trigger: scenario.observation_trigger,
    flow_chain: scenario.flow_chain,
    price_gate_policy: scenario.price_gate_policy,
    invalidation_rule: scenario.invalidation_rule,
    review_cadence: [...scenario.review_cadence],
    tags: [...scenario.tags],
    notes: scenario.notes ?? ""
  };
}

export function normalizeScenarioDraftInput(rawInput) {
  const draft = buildDraft(rawInput);
  const errors = [];

  pushRequiredFieldErrors(draft, errors);
  pushEnumError("market", draft.market, scenarioFormOptions.markets, errors);
  pushEnumError("direction", draft.direction, scenarioFormOptions.directions, errors);
  pushEnumError("horizon_bucket", draft.horizon_bucket, scenarioFormOptions.horizonBuckets, errors);
  pushEnumError("entry_window", draft.entry_window, scenarioFormOptions.entryWindows, errors);
  pushEnumError("price_gate_policy", draft.price_gate_policy, scenarioFormOptions.priceGatePolicies, errors);

  if (draft.review_cadence.length === 0) {
    errors.push(`${formatFieldLabel("review_cadence")}を少なくとも1つ選択してください`);
  }

  return {
    draft,
    errors
  };
}

export function upsertScenarioRecords(records, rawInput) {
  const { draft, errors } = normalizeScenarioDraftInput(rawInput);
  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      draft
    };
  }

  const nextRecords = cloneRecords(records);
  const existingIndex = nextRecords.scenarios.findIndex((scenario) => scenario.scenario_id === draft.scenario_id);
  const existingScenario = existingIndex >= 0 ? nextRecords.scenarios[existingIndex] : null;
  const nextScenario = {
    ...(existingScenario ?? {}),
    ...draft,
    review_cadence: [...draft.review_cadence],
    tags: [...draft.tags],
    current_status_seed: existingScenario?.current_status_seed ?? "watch"
  };

  if (existingScenario) {
    nextRecords.scenarios[existingIndex] = nextScenario;
  } else {
    nextRecords.scenarios.push(nextScenario);
  }

  return {
    ok: true,
    errors: [],
    draft,
    scenario: nextScenario,
    records: nextRecords,
    outcome: existingScenario ? "updated" : "created"
  };
}
