import { prototypeRecords } from "../data/sampleRecords.js";
import { appendDailyReviewRecords } from "./dailyReview.js";
import { cloneRecords, upsertScenarioRecords } from "./scenarioDraft.js";

export const browserRecordStorageKey = "branchflow.prototype-records.v1";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isValidRecordsSnapshot(records) {
  return (
    records &&
    typeof records.prototypeClock === "string" &&
    Array.isArray(records.scenarios) &&
    Array.isArray(records.observationSnapshots) &&
    Array.isArray(records.priceGates) &&
    Array.isArray(records.statusEvents)
  );
}

export function clonePrototypeRecords() {
  return cloneRecords(prototypeRecords);
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
    return isValidRecordsSnapshot(parsed) ? parsed : fallbackRecords;
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
