import { prototypeRecords } from "../data/sampleRecords.js";
import { appendDailyReviewRecords, dailyReviewFormOptions } from "./dailyReview.js";
import { cloneRecords, scenarioFormOptions, upsertScenarioRecords } from "./scenarioDraft.js";

export const browserRecordStorageKey = "branchflow.prototype-records.v1";

const snapshotKeys = ["prototypeClock", "scenarios", "observationSnapshots", "priceGates", "statusEvents"];
const scenarioKeys = [
  "scenario_id",
  "market",
  "direction",
  "scenario_summary",
  "horizon_bucket",
  "entry_window",
  "observation_trigger",
  "flow_chain",
  "price_gate_policy",
  "invalidation_rule",
  "review_cadence",
  "tags",
  "notes",
  "current_status_seed"
];
const snapshotEntryKeys = [
  "snapshot_id",
  "scenario_id",
  "observed_at",
  "session_phase",
  "trigger_state",
  "observed_signals",
  "event_risk_today",
  "market_note",
  "operator_action",
  "source_refs"
];
const priceGateKeys = [
  "price_gate_id",
  "scenario_id",
  "checked_at",
  "expiry_bucket_ok",
  "spread_ok",
  "premium_within_budget",
  "iv_event_heat_ok",
  "theme_cooldown_ok",
  "overall_gate",
  "fail_reason_codes",
  "gate_note"
];
const statusEventKeys = [
  "status_event_id",
  "scenario_id",
  "changed_at",
  "from_status",
  "to_status",
  "reason_code",
  "reason_detail",
  "snapshot_id",
  "price_gate_id",
  "next_review_phase",
  "next_review_at"
];

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pushTypeError(errors, path, expected) {
  errors.push(`${path} は ${expected} である必要があります`);
}

function validateExactKeys(value, expectedKeys, path, errors) {
  if (!isPlainObject(value)) {
    pushTypeError(errors, path, "object");
    return false;
  }

  const missingKeys = expectedKeys.filter((key) => !(key in value));
  const extraKeys = Object.keys(value).filter((key) => !expectedKeys.includes(key));

  if (missingKeys.length > 0) {
    errors.push(`${path} に不足 field があります: ${missingKeys.join(", ")}`);
  }

  if (extraKeys.length > 0) {
    errors.push(`${path} に未対応 field があります: ${extraKeys.join(", ")}`);
  }

  return true;
}

function validateString(value, path, errors, { allowEmpty = true } = {}) {
  if (typeof value !== "string") {
    pushTypeError(errors, path, "string");
    return false;
  }

  if (!allowEmpty && value.trim() === "") {
    errors.push(`${path} は空文字にできません`);
    return false;
  }

  return true;
}

function validateNullableString(value, path, errors, { allowEmpty = true } = {}) {
  if (value === null) {
    return true;
  }

  return validateString(value, path, errors, { allowEmpty });
}

function validateTimestamp(value, path, errors) {
  if (!validateString(value, path, errors, { allowEmpty: false })) {
    return false;
  }

  if (Number.isNaN(new Date(value).getTime())) {
    errors.push(`${path} は有効な ISO 8601 タイムスタンプである必要があります`);
    return false;
  }

  return true;
}

function validateNullableTimestamp(value, path, errors) {
  if (value === null) {
    return true;
  }

  return validateTimestamp(value, path, errors);
}

function validateEnum(value, allowedValues, path, errors) {
  if (!validateString(value, path, errors, { allowEmpty: false })) {
    return false;
  }

  if (!allowedValues.includes(value)) {
    errors.push(`${path} は次のいずれかである必要があります: ${allowedValues.join(", ")}`);
    return false;
  }

  return true;
}

function validateNullableEnum(value, allowedValues, path, errors) {
  if (value === null) {
    return true;
  }

  return validateEnum(value, allowedValues, path, errors);
}

function validateStringArray(values, path, errors, { allowEmpty = true, allowedValues = null } = {}) {
  if (!Array.isArray(values)) {
    pushTypeError(errors, path, "array");
    return false;
  }

  if (!allowEmpty && values.length === 0) {
    errors.push(`${path} は少なくとも 1 件必要です`);
    return false;
  }

  let isValid = true;

  values.forEach((value, index) => {
    if (!validateString(value, `${path}[${index}]`, errors, { allowEmpty: false })) {
      isValid = false;
      return;
    }

    if (allowedValues && !allowedValues.includes(value)) {
      errors.push(`${path}[${index}] は次のいずれかである必要があります: ${allowedValues.join(", ")}`);
      isValid = false;
    }
  });

  return isValid;
}

function validateNullableBoolean(value, path, errors) {
  if (typeof value === "boolean" || value === null) {
    return true;
  }

  errors.push(`${path} は true / false / null のいずれかである必要があります`);
  return false;
}

function validateScenarioEntry(scenario, index, errors, scenarioIds) {
  const path = `scenarios[${index}]`;
  if (!validateExactKeys(scenario, scenarioKeys, path, errors)) {
    return;
  }

  if (validateString(scenario.scenario_id, `${path}.scenario_id`, errors, { allowEmpty: false })) {
    if (scenarioIds.has(scenario.scenario_id)) {
      errors.push(`${path}.scenario_id が重複しています: ${scenario.scenario_id}`);
    } else {
      scenarioIds.add(scenario.scenario_id);
    }
  }

  validateEnum(scenario.market, scenarioFormOptions.markets, `${path}.market`, errors);
  validateEnum(scenario.direction, scenarioFormOptions.directions, `${path}.direction`, errors);
  validateString(scenario.scenario_summary, `${path}.scenario_summary`, errors, { allowEmpty: false });
  validateEnum(scenario.horizon_bucket, scenarioFormOptions.horizonBuckets, `${path}.horizon_bucket`, errors);
  validateEnum(scenario.entry_window, scenarioFormOptions.entryWindows, `${path}.entry_window`, errors);
  validateString(scenario.observation_trigger, `${path}.observation_trigger`, errors, { allowEmpty: false });
  validateString(scenario.flow_chain, `${path}.flow_chain`, errors, { allowEmpty: false });
  validateEnum(scenario.price_gate_policy, scenarioFormOptions.priceGatePolicies, `${path}.price_gate_policy`, errors);
  validateString(scenario.invalidation_rule, `${path}.invalidation_rule`, errors, { allowEmpty: false });
  validateStringArray(scenario.review_cadence, `${path}.review_cadence`, errors, {
    allowEmpty: false,
    allowedValues: scenarioFormOptions.reviewCadences
  });
  validateStringArray(scenario.tags, `${path}.tags`, errors);
  validateString(scenario.notes, `${path}.notes`, errors);
  validateEnum(scenario.current_status_seed, dailyReviewFormOptions.statusOptions, `${path}.current_status_seed`, errors);
}

function validateObservationEntry(snapshot, index, errors, scenarioIds, snapshotIds) {
  const path = `observationSnapshots[${index}]`;
  if (!validateExactKeys(snapshot, snapshotEntryKeys, path, errors)) {
    return;
  }

  if (validateString(snapshot.snapshot_id, `${path}.snapshot_id`, errors, { allowEmpty: false })) {
    if (snapshotIds.has(snapshot.snapshot_id)) {
      errors.push(`${path}.snapshot_id が重複しています: ${snapshot.snapshot_id}`);
    } else {
      snapshotIds.add(snapshot.snapshot_id);
    }
  }

  if (validateString(snapshot.scenario_id, `${path}.scenario_id`, errors, { allowEmpty: false })) {
    if (!scenarioIds.has(snapshot.scenario_id)) {
      errors.push(`${path}.scenario_id が既存 scenario を参照していません: ${snapshot.scenario_id}`);
    }
  }

  validateTimestamp(snapshot.observed_at, `${path}.observed_at`, errors);
  validateEnum(snapshot.session_phase, dailyReviewFormOptions.sessionPhases, `${path}.session_phase`, errors);
  validateEnum(snapshot.trigger_state, dailyReviewFormOptions.triggerStates, `${path}.trigger_state`, errors);
  validateStringArray(snapshot.observed_signals, `${path}.observed_signals`, errors);
  validateString(snapshot.event_risk_today, `${path}.event_risk_today`, errors);
  validateString(snapshot.market_note, `${path}.market_note`, errors);
  validateString(snapshot.operator_action, `${path}.operator_action`, errors);
  validateStringArray(snapshot.source_refs, `${path}.source_refs`, errors);
}

function validatePriceGateEntry(priceGate, index, errors, scenarioIds, priceGateIds, priceGateById) {
  const path = `priceGates[${index}]`;
  if (!validateExactKeys(priceGate, priceGateKeys, path, errors)) {
    return;
  }

  if (validateString(priceGate.price_gate_id, `${path}.price_gate_id`, errors, { allowEmpty: false })) {
    if (priceGateIds.has(priceGate.price_gate_id)) {
      errors.push(`${path}.price_gate_id が重複しています: ${priceGate.price_gate_id}`);
    } else {
      priceGateIds.add(priceGate.price_gate_id);
      priceGateById.set(priceGate.price_gate_id, priceGate);
    }
  }

  if (validateString(priceGate.scenario_id, `${path}.scenario_id`, errors, { allowEmpty: false })) {
    if (!scenarioIds.has(priceGate.scenario_id)) {
      errors.push(`${path}.scenario_id が既存 scenario を参照していません: ${priceGate.scenario_id}`);
    }
  }

  validateTimestamp(priceGate.checked_at, `${path}.checked_at`, errors);
  dailyReviewFormOptions.gateCheckFields.forEach((field) => {
    validateNullableBoolean(priceGate[field], `${path}.${field}`, errors);
  });
  validateEnum(priceGate.overall_gate, dailyReviewFormOptions.gateStatuses, `${path}.overall_gate`, errors);
  validateStringArray(priceGate.fail_reason_codes, `${path}.fail_reason_codes`, errors, {
    allowedValues: dailyReviewFormOptions.failReasonCodes
  });
  validateString(priceGate.gate_note, `${path}.gate_note`, errors);

  if (priceGate.overall_gate === "unchecked") {
    dailyReviewFormOptions.gateCheckFields.forEach((field) => {
      if (priceGate[field] !== null) {
        errors.push(`${path}.${field} は overall_gate が unchecked のとき null である必要があります`);
      }
    });

    if (priceGate.fail_reason_codes.length > 0) {
      errors.push(`${path}.fail_reason_codes は overall_gate が unchecked のとき空配列である必要があります`);
    }
  }

  if (priceGate.overall_gate === "pass") {
    if (priceGate.fail_reason_codes.length > 0) {
      errors.push(`${path}.fail_reason_codes は overall_gate が pass のとき空配列である必要があります`);
    }

    dailyReviewFormOptions.gateCheckFields.forEach((field) => {
      if (priceGate[field] === null) {
        errors.push(`${path}.${field} は overall_gate が pass のとき null にできません`);
      }
    });
  }

  if (priceGate.overall_gate === "fail") {
    if (priceGate.fail_reason_codes.length === 0) {
      errors.push(`${path}.fail_reason_codes は overall_gate が fail のとき少なくとも 1 件必要です`);
    }

    dailyReviewFormOptions.gateCheckFields.forEach((field) => {
      if (priceGate[field] === null) {
        errors.push(`${path}.${field} は overall_gate が fail のとき null にできません`);
      }
    });
  }
}

function validateStatusEventEntry(
  statusEvent,
  index,
  errors,
  scenarioIds,
  snapshotIds,
  snapshotById,
  priceGateIds,
  priceGateById,
  statusEventIds
) {
  const path = `statusEvents[${index}]`;
  if (!validateExactKeys(statusEvent, statusEventKeys, path, errors)) {
    return;
  }

  if (validateString(statusEvent.status_event_id, `${path}.status_event_id`, errors, { allowEmpty: false })) {
    if (statusEventIds.has(statusEvent.status_event_id)) {
      errors.push(`${path}.status_event_id が重複しています: ${statusEvent.status_event_id}`);
    } else {
      statusEventIds.add(statusEvent.status_event_id);
    }
  }

  if (validateString(statusEvent.scenario_id, `${path}.scenario_id`, errors, { allowEmpty: false })) {
    if (!scenarioIds.has(statusEvent.scenario_id)) {
      errors.push(`${path}.scenario_id が既存 scenario を参照していません: ${statusEvent.scenario_id}`);
    }
  }

  validateTimestamp(statusEvent.changed_at, `${path}.changed_at`, errors);
  validateEnum(statusEvent.from_status, dailyReviewFormOptions.statusOptions, `${path}.from_status`, errors);
  validateEnum(statusEvent.to_status, dailyReviewFormOptions.statusOptions, `${path}.to_status`, errors);
  validateEnum(statusEvent.reason_code, dailyReviewFormOptions.reasonCodes, `${path}.reason_code`, errors);
  validateString(statusEvent.reason_detail, `${path}.reason_detail`, errors);

  if (validateString(statusEvent.snapshot_id, `${path}.snapshot_id`, errors, { allowEmpty: false })) {
    if (!snapshotIds.has(statusEvent.snapshot_id)) {
      errors.push(`${path}.snapshot_id が既存 snapshot を参照していません: ${statusEvent.snapshot_id}`);
    }
  }

  if (validateNullableString(statusEvent.price_gate_id, `${path}.price_gate_id`, errors, { allowEmpty: false })) {
    if (statusEvent.price_gate_id && !priceGateIds.has(statusEvent.price_gate_id)) {
      errors.push(`${path}.price_gate_id が既存 price gate を参照していません: ${statusEvent.price_gate_id}`);
    }
  }

  validateNullableEnum(statusEvent.next_review_phase, dailyReviewFormOptions.sessionPhases, `${path}.next_review_phase`, errors);
  validateNullableTimestamp(statusEvent.next_review_at, `${path}.next_review_at`, errors);

  const linkedSnapshot = snapshotById.get(statusEvent.snapshot_id);
  if (linkedSnapshot && linkedSnapshot.scenario_id !== statusEvent.scenario_id) {
    errors.push(`${path}.snapshot_id が別 scenario の snapshot を参照しています`);
  }

  const linkedPriceGate = statusEvent.price_gate_id ? priceGateById.get(statusEvent.price_gate_id) : null;
  if (linkedPriceGate && linkedPriceGate.scenario_id !== statusEvent.scenario_id) {
    errors.push(`${path}.price_gate_id が別 scenario の price gate を参照しています`);
  }

  if (statusEvent.from_status === "invalidated" && statusEvent.to_status !== "invalidated") {
    errors.push(`${path} は invalidated から他状態へ戻せません`);
  }

  if (statusEvent.to_status === "eligible" && linkedPriceGate?.overall_gate !== "pass") {
    errors.push(`${path} は to_status が eligible のとき linked price gate が pass である必要があります`);
  }
}

export function validateRecordsSnapshot(records) {
  const errors = [];
  if (!validateExactKeys(records, snapshotKeys, "records", errors)) {
    return {
      ok: false,
      errors
    };
  }

  validateTimestamp(records.prototypeClock, "records.prototypeClock", errors);

  if (!Array.isArray(records.scenarios)) {
    pushTypeError(errors, "records.scenarios", "array");
  }

  if (!Array.isArray(records.observationSnapshots)) {
    pushTypeError(errors, "records.observationSnapshots", "array");
  }

  if (!Array.isArray(records.priceGates)) {
    pushTypeError(errors, "records.priceGates", "array");
  }

  if (!Array.isArray(records.statusEvents)) {
    pushTypeError(errors, "records.statusEvents", "array");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors
    };
  }

  const scenarioIds = new Set();
  const snapshotIds = new Set();
  const snapshotById = new Map();
  const priceGateIds = new Set();
  const priceGateById = new Map();
  const statusEventIds = new Set();

  records.scenarios.forEach((scenario, index) => {
    validateScenarioEntry(scenario, index, errors, scenarioIds);
  });

  records.observationSnapshots.forEach((snapshot, index) => {
    validateObservationEntry(snapshot, index, errors, scenarioIds, snapshotIds);
    if (typeof snapshot?.snapshot_id === "string" && snapshot.snapshot_id) {
      snapshotById.set(snapshot.snapshot_id, snapshot);
    }
  });

  records.priceGates.forEach((priceGate, index) => {
    validatePriceGateEntry(priceGate, index, errors, scenarioIds, priceGateIds, priceGateById);
  });

  records.statusEvents.forEach((statusEvent, index) => {
    validateStatusEventEntry(
      statusEvent,
      index,
      errors,
      scenarioIds,
      snapshotIds,
      snapshotById,
      priceGateIds,
      priceGateById,
      statusEventIds
    );
  });

  return {
    ok: errors.length === 0,
    errors
  };
}

export function clonePrototypeRecords() {
  return cloneRecords(prototypeRecords);
}

export function exportRecordsJson(records) {
  return JSON.stringify(cloneRecords(records), null, 2);
}

export function parseRecordsJson(rawJson) {
  const source = String(rawJson ?? "");
  if (source.trim() === "") {
    return {
      ok: false,
      errors: ["JSON 本文を貼り付けるか、JSON ファイルを選択してください"]
    };
  }

  try {
    const parsed = JSON.parse(source);
    const validation = validateRecordsSnapshot(parsed);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors
      };
    }

    return {
      ok: true,
      errors: [],
      records: cloneRecords(parsed)
    };
  } catch (error) {
    return {
      ok: false,
      errors: [`JSON を解釈できませんでした: ${error.message}`]
    };
  }
}

export function loadRecords() {
  const fallbackRecords = clonePrototypeRecords();
  if (!canUseLocalStorage()) {
    return fallbackRecords;
  }

  try {
    const rawValue = window.localStorage.getItem(browserRecordStorageKey);
    if (!rawValue) {
      return fallbackRecords;
    }

    const parsed = JSON.parse(rawValue);
    const validation = validateRecordsSnapshot(parsed);
    if (!validation.ok) {
      console.warn("loadRecords failed; falling back to prototype seed", validation.errors);
      return fallbackRecords;
    }

    return parsed;
  } catch (error) {
    console.warn("loadRecords failed; falling back to prototype seed", error);
    return fallbackRecords;
  }
}

export function saveRecords(records) {
  const snapshot = cloneRecords(records);
  if (!canUseLocalStorage()) {
    return snapshot;
  }

  try {
    window.localStorage.setItem(browserRecordStorageKey, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("saveRecords failed", error);
  }

  return snapshot;
}

export function resetRecordsInStore() {
  return saveRecords(clonePrototypeRecords());
}

export function importRecordsFromJson(rawJson) {
  const result = parseRecordsJson(rawJson);
  if (!result.ok) {
    return result;
  }

  return {
    ...result,
    records: saveRecords(result.records)
  };
}

export function upsertScenarioInStore(rawInput) {
  const records = loadRecords();
  const result = upsertScenarioRecords(records, rawInput);
  if (!result.ok) {
    return result;
  }

  const savedRecords = saveRecords(result.records);
  const savedScenario =
    savedRecords.scenarios.find((scenario) => scenario.scenario_id === result.scenario.scenario_id) ?? result.scenario;

  return {
    ...result,
    records: savedRecords,
    scenario: savedScenario
  };
}

export function appendDailyReviewInStore(rawInput) {
  const records = loadRecords();
  const result = appendDailyReviewRecords(records, rawInput);
  if (!result.ok) {
    return result;
  }

  const savedRecords = saveRecords(result.records);

  return {
    ...result,
    records: savedRecords
  };
}
