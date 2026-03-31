import {
  compareDesc,
  formatCodeLabel,
  formatFieldLabel,
  formatGateStatus,
  formatPhase,
  formatStatus,
  formatTriggerState
} from "./formatters.js";
import { cloneRecords } from "./scenarioDraft.js";

export const dailyReviewFormOptions = {
  sessionPhases: ["morning", "intraday", "after_close", "weekly"],
  triggerStates: ["partial", "confirmed", "invalidated"],
  gateStatuses: ["unchecked", "pass", "fail"],
  statusOptions: ["watch", "eligible", "rejected", "invalidated"],
  reasonCodes: [
    "trigger_pending",
    "trigger_confirmed",
    "price_gate_pass",
    "price_gate_fail",
    "thesis_broken",
    "time_expired",
    "manual_archive"
  ],
  failReasonCodes: [
    "expiry_too_short",
    "spread_too_wide",
    "premium_over_budget",
    "iv_event_hot",
    "theme_cooldown"
  ],
  gateCheckFields: [
    "expiry_bucket_ok",
    "spread_ok",
    "premium_within_budget",
    "iv_event_heat_ok",
    "theme_cooldown_ok"
  ]
};

const requiredDraftFields = [
  "scenario_id",
  "observed_at",
  "session_phase",
  "trigger_state",
  "checked_at",
  "overall_gate",
  "changed_at",
  "to_status",
  "reason_code",
  "next_review_phase",
  "next_review_at"
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

function normalizeDelimitedList(value) {
  if (Array.isArray(value)) {
    return dedupePreservingOrder(value.map((entry) => normalizeText(entry)));
  }

  return dedupePreservingOrder(
    normalizeText(value)
      .split(/[;,]/)
      .map((entry) => entry.trim())
  );
}

function normalizeNullableBoolean(value) {
  const normalized = normalizeText(value);
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return null;
}

function selectLatest(entries, timestampField) {
  return [...entries].sort((left, right) => compareDesc(left[timestampField], right[timestampField]))[0] ?? null;
}

function findScenario(records, scenarioId) {
  return records.scenarios.find((scenario) => scenario.scenario_id === scenarioId) ?? null;
}

function getCurrentStatus(records, scenario) {
  const latestEvent = selectLatest(
    records.statusEvents.filter((event) => event.scenario_id === scenario.scenario_id),
    "changed_at"
  );

  return latestEvent?.to_status ?? scenario.current_status_seed;
}

function buildDailyReviewDraft(rawInput, fromStatus) {
  return {
    scenario_id: normalizeText(rawInput.scenario_id),
    from_status: fromStatus,
    observed_at: normalizeText(rawInput.observed_at),
    session_phase: normalizeText(rawInput.session_phase),
    trigger_state: normalizeText(rawInput.trigger_state),
    observed_signals: normalizeDelimitedList(rawInput.observed_signals),
    event_risk_today: normalizeText(rawInput.event_risk_today),
    market_note: normalizeText(rawInput.market_note),
    operator_action: normalizeText(rawInput.operator_action),
    source_refs: normalizeDelimitedList(rawInput.source_refs),
    checked_at: normalizeText(rawInput.checked_at),
    expiry_bucket_ok: normalizeNullableBoolean(rawInput.expiry_bucket_ok),
    spread_ok: normalizeNullableBoolean(rawInput.spread_ok),
    premium_within_budget: normalizeNullableBoolean(rawInput.premium_within_budget),
    iv_event_heat_ok: normalizeNullableBoolean(rawInput.iv_event_heat_ok),
    theme_cooldown_ok: normalizeNullableBoolean(rawInput.theme_cooldown_ok),
    overall_gate: normalizeText(rawInput.overall_gate),
    fail_reason_codes: normalizeDelimitedList(rawInput.fail_reason_codes),
    gate_note: normalizeText(rawInput.gate_note),
    changed_at: normalizeText(rawInput.changed_at),
    to_status: normalizeText(rawInput.to_status),
    reason_code: normalizeText(rawInput.reason_code),
    reason_detail: normalizeText(rawInput.reason_detail),
    next_review_phase: normalizeText(rawInput.next_review_phase),
    next_review_at: normalizeText(rawInput.next_review_at)
  };
}

function pushRequiredFieldErrors(draft, errors) {
  for (const field of requiredDraftFields) {
    if (!draft[field]) {
      errors.push(`${formatFieldLabel(field)}は必須です`);
    }
  }
}

function formatAllowedValue(field, value) {
  if (field === "from_status" || field === "to_status") {
    return formatStatus(value);
  }

  if (field === "session_phase" || field === "next_review_phase") {
    return formatPhase(value);
  }

  if (field === "trigger_state") {
    return formatTriggerState(value);
  }

  if (field === "overall_gate") {
    return formatGateStatus(value);
  }

  return formatCodeLabel(value);
}

function pushEnumError(field, value, allowedValues, errors) {
  if (!allowedValues.includes(value)) {
    errors.push(
      `${formatFieldLabel(field)}は次のいずれかを選択してください: ${allowedValues
        .map((allowedValue) => formatAllowedValue(field, allowedValue))
        .join(" / ")}`
    );
  }
}

function pushTimestampError(field, value, errors) {
  if (!value) {
    return;
  }

  if (Number.isNaN(new Date(value).getTime())) {
    errors.push(`${formatFieldLabel(field)}は有効な ISO 8601 タイムスタンプで入力してください`);
  }
}

function normalizeGateChecksForUnchecked(draft) {
  for (const field of dailyReviewFormOptions.gateCheckFields) {
    draft[field] = null;
  }

  draft.fail_reason_codes = [];
}

function pushGateValidationErrors(draft, errors) {
  if (draft.overall_gate === "unchecked") {
    normalizeGateChecksForUnchecked(draft);
    return;
  }

  for (const field of dailyReviewFormOptions.gateCheckFields) {
    if (draft[field] === null) {
      errors.push(
        `${formatFieldLabel(field)}は${formatFieldLabel("overall_gate")}が「${formatGateStatus("pass")}」または「${formatGateStatus("fail")}」のとき必須です`
      );
    }
  }

  if (draft.overall_gate === "pass" && draft.fail_reason_codes.length > 0) {
    errors.push(
      `${formatFieldLabel("overall_gate")}が「${formatGateStatus("pass")}」のとき、${formatFieldLabel("fail_reason_codes")}は空にしてください`
    );
  }

  if (draft.overall_gate === "fail" && draft.fail_reason_codes.length === 0) {
    errors.push(
      `${formatFieldLabel("overall_gate")}が「${formatGateStatus("fail")}」のとき、${formatFieldLabel("fail_reason_codes")}を少なくとも1つ選択してください`
    );
  }

  for (const failReason of draft.fail_reason_codes) {
    if (!dailyReviewFormOptions.failReasonCodes.includes(failReason)) {
      errors.push(
        `${formatFieldLabel("fail_reason_codes")}は次のいずれかを選択してください: ${dailyReviewFormOptions.failReasonCodes
          .map((value) => formatCodeLabel(value))
          .join(" / ")}`
      );
      break;
    }
  }
}

function pushTransitionErrors(draft, errors) {
  if (draft.from_status === "invalidated" && draft.to_status !== "invalidated") {
    errors.push("失効済みシナリオには失効状態のみ追記できます");
  }

  if (draft.to_status === "eligible" && draft.overall_gate !== "pass") {
    errors.push("更新後状態を「候補」にするには、総合判定が「通過」である必要があります");
  }
}

function formatDatePart(timestamp) {
  return normalizeText(timestamp).slice(0, 10).replaceAll("-", "");
}

function nextReviewId(records, collectionName, idField, prefix, timestamp) {
  const datePart = formatDatePart(timestamp);
  const pattern = new RegExp(`^${prefix}-${datePart}-(\\d{3})$`);
  let maxSequence = 0;

  for (const entry of records[collectionName]) {
    const match = pattern.exec(entry[idField]);
    if (!match) {
      continue;
    }

    maxSequence = Math.max(maxSequence, Number.parseInt(match[1], 10));
  }

  return `${prefix}-${datePart}-${String(maxSequence + 1).padStart(3, "0")}`;
}

function latestTimestamp(...timestamps) {
  return timestamps.reduce((latest, current) => {
    if (!current) {
      return latest;
    }

    if (!latest) {
      return current;
    }

    return new Date(current).getTime() > new Date(latest).getTime() ? current : latest;
  }, null);
}

export function createDailyReviewDraft(detail, asOf) {
  const latestSnapshot = detail?.snapshots?.[0] ?? null;
  const latestGate = detail?.priceGates?.[0] ?? null;
  const latestEvent = detail?.statusEvents?.[0] ?? null;
  const defaultPhase = latestEvent?.next_review_phase ?? detail?.scenario.review_cadence?.[0] ?? "morning";
  const defaultTimestamp = asOf ?? latestEvent?.changed_at ?? "";

  return {
    scenario_id: detail?.scenario.scenario_id ?? "",
    from_status: detail?.currentView.current_status ?? detail?.scenario.current_status_seed ?? "watch",
    observed_at: defaultTimestamp,
    session_phase: defaultPhase,
    trigger_state: latestSnapshot?.trigger_state ?? "partial",
    observed_signals: [...(latestSnapshot?.observed_signals ?? [])],
    event_risk_today: latestSnapshot?.event_risk_today ?? "",
    market_note: latestSnapshot?.market_note ?? "",
    operator_action: latestSnapshot?.operator_action ?? "",
    source_refs: [...(latestSnapshot?.source_refs ?? [])],
    checked_at: defaultTimestamp,
    expiry_bucket_ok: latestGate?.overall_gate === "unchecked" ? null : latestGate?.expiry_bucket_ok ?? null,
    spread_ok: latestGate?.overall_gate === "unchecked" ? null : latestGate?.spread_ok ?? null,
    premium_within_budget:
      latestGate?.overall_gate === "unchecked" ? null : latestGate?.premium_within_budget ?? null,
    iv_event_heat_ok: latestGate?.overall_gate === "unchecked" ? null : latestGate?.iv_event_heat_ok ?? null,
    theme_cooldown_ok: latestGate?.overall_gate === "unchecked" ? null : latestGate?.theme_cooldown_ok ?? null,
    overall_gate: latestGate?.overall_gate ?? "unchecked",
    fail_reason_codes: [...(latestGate?.fail_reason_codes ?? [])],
    gate_note: latestGate?.gate_note ?? "",
    changed_at: defaultTimestamp,
    to_status: detail?.currentView.current_status ?? "watch",
    reason_code: latestEvent?.reason_code ?? "trigger_pending",
    reason_detail: latestEvent?.reason_detail ?? "",
    next_review_phase: defaultPhase,
    next_review_at: latestEvent?.next_review_at ?? defaultTimestamp
  };
}

export function normalizeDailyReviewDraftInput(records, rawInput) {
  const scenario = findScenario(records, normalizeText(rawInput.scenario_id));
  const fromStatus = scenario ? getCurrentStatus(records, scenario) : "watch";
  const draft = buildDailyReviewDraft(rawInput, fromStatus);
  const errors = [];

  pushRequiredFieldErrors(draft, errors);

  if (!scenario) {
    errors.push("シナリオIDは既存シナリオを指定してください");
  }

  pushEnumError("from_status", draft.from_status, dailyReviewFormOptions.statusOptions, errors);
  pushEnumError("session_phase", draft.session_phase, dailyReviewFormOptions.sessionPhases, errors);
  pushEnumError("trigger_state", draft.trigger_state, dailyReviewFormOptions.triggerStates, errors);
  pushEnumError("overall_gate", draft.overall_gate, dailyReviewFormOptions.gateStatuses, errors);
  pushEnumError("to_status", draft.to_status, dailyReviewFormOptions.statusOptions, errors);
  pushEnumError("reason_code", draft.reason_code, dailyReviewFormOptions.reasonCodes, errors);
  pushEnumError("next_review_phase", draft.next_review_phase, dailyReviewFormOptions.sessionPhases, errors);

  pushTimestampError("observed_at", draft.observed_at, errors);
  pushTimestampError("checked_at", draft.checked_at, errors);
  pushTimestampError("changed_at", draft.changed_at, errors);
  pushTimestampError("next_review_at", draft.next_review_at, errors);

  pushGateValidationErrors(draft, errors);
  pushTransitionErrors(draft, errors);

  return {
    draft,
    errors,
    scenario
  };
}

export function appendDailyReviewRecords(records, rawInput) {
  const { draft, errors, scenario } = normalizeDailyReviewDraftInput(records, rawInput);
  if (errors.length > 0 || !scenario) {
    return {
      ok: false,
      errors,
      draft
    };
  }

  const nextRecords = cloneRecords(records);

  const snapshot = {
    snapshot_id: nextReviewId(nextRecords, "observationSnapshots", "snapshot_id", "OBS", draft.observed_at),
    scenario_id: scenario.scenario_id,
    observed_at: draft.observed_at,
    session_phase: draft.session_phase,
    trigger_state: draft.trigger_state,
    observed_signals: [...draft.observed_signals],
    event_risk_today: draft.event_risk_today,
    market_note: draft.market_note,
    operator_action: draft.operator_action,
    source_refs: [...draft.source_refs]
  };

  const priceGate = {
    price_gate_id: nextReviewId(nextRecords, "priceGates", "price_gate_id", "PG", draft.checked_at),
    scenario_id: scenario.scenario_id,
    checked_at: draft.checked_at,
    expiry_bucket_ok: draft.expiry_bucket_ok,
    spread_ok: draft.spread_ok,
    premium_within_budget: draft.premium_within_budget,
    iv_event_heat_ok: draft.iv_event_heat_ok,
    theme_cooldown_ok: draft.theme_cooldown_ok,
    overall_gate: draft.overall_gate,
    fail_reason_codes: [...draft.fail_reason_codes],
    gate_note: draft.gate_note
  };

  const statusEvent = {
    status_event_id: nextReviewId(nextRecords, "statusEvents", "status_event_id", "ST", draft.changed_at),
    scenario_id: scenario.scenario_id,
    changed_at: draft.changed_at,
    from_status: draft.from_status,
    to_status: draft.to_status,
    reason_code: draft.reason_code,
    reason_detail: draft.reason_detail,
    snapshot_id: snapshot.snapshot_id,
    price_gate_id: priceGate.price_gate_id,
    next_review_phase: draft.next_review_phase,
    next_review_at: draft.next_review_at
  };

  nextRecords.observationSnapshots.push(snapshot);
  nextRecords.priceGates.push(priceGate);
  nextRecords.statusEvents.push(statusEvent);
  nextRecords.prototypeClock = latestTimestamp(
    nextRecords.prototypeClock,
    snapshot.observed_at,
    priceGate.checked_at,
    statusEvent.changed_at
  );

  return {
    ok: true,
    errors: [],
    draft,
    scenario,
    snapshot,
    priceGate,
    statusEvent,
    records: nextRecords
  };
}
