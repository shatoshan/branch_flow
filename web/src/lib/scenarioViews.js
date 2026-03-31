import {
  buildPriceGateSummary,
  compareAscWithNulls,
  compareDesc,
  diffMinutes,
  isDue
} from "./formatters.js";

const freshGateMaxMinutes = 15;
const agingGateMaxMinutes = 90;

function byScenario(records, scenarioId, field) {
  return records[field].filter((entry) => entry.scenario_id === scenarioId);
}

function selectLatest(entries, timestampField) {
  return [...entries].sort((left, right) => compareDesc(left[timestampField], right[timestampField]))[0] ?? null;
}

function indexBy(entries, idField) {
  return Object.fromEntries(entries.map((entry) => [entry[idField], entry]));
}

function selectLinkedEntry(event, idField, index, fallbackEntry) {
  if (!event) {
    return fallbackEntry;
  }

  const linkedId = event[idField];
  if (!linkedId) {
    return null;
  }

  return index[linkedId] ?? null;
}

function derivePriceFreshnessState(gapMinutes, gate) {
  if (!gate) {
    return "missing";
  }

  if (gate.overall_gate === "unchecked") {
    return "unchecked";
  }

  if (gapMinutes === null) {
    return "unknown";
  }

  if (gapMinutes <= freshGateMaxMinutes) {
    return "fresh";
  }

  if (gapMinutes <= agingGateMaxMinutes) {
    return "aging";
  }

  return "stale";
}

export function buildScenarioCurrentView(records, scenario, now = records.prototypeClock) {
  const snapshots = byScenario(records, scenario.scenario_id, "observationSnapshots");
  const gates = byScenario(records, scenario.scenario_id, "priceGates");
  const events = byScenario(records, scenario.scenario_id, "statusEvents");
  const snapshotsById = indexBy(snapshots, "snapshot_id");
  const gatesById = indexBy(gates, "price_gate_id");

  const latestSnapshot = selectLatest(snapshots, "observed_at");
  const latestGate = selectLatest(gates, "checked_at");
  const latestEvent = selectLatest(events, "changed_at");
  const linkedSnapshot = selectLinkedEntry(latestEvent, "snapshot_id", snapshotsById, latestSnapshot);
  const linkedGate = selectLinkedEntry(latestEvent, "price_gate_id", gatesById, latestGate);
  const decisionReferenceAt = latestEvent?.changed_at ?? latestSnapshot?.observed_at ?? now;
  const snapshotDecisionGapMinutes = diffMinutes(decisionReferenceAt, linkedSnapshot?.observed_at ?? null);
  const gateDecisionGapMinutes = diffMinutes(decisionReferenceAt, linkedGate?.checked_at ?? null);
  const priceFreshnessState = derivePriceFreshnessState(gateDecisionGapMinutes, linkedGate);

  return {
    scenario_id: scenario.scenario_id,
    market: scenario.market,
    direction: scenario.direction,
    scenario_summary: scenario.scenario_summary,
    horizon_bucket: scenario.horizon_bucket,
    entry_window: scenario.entry_window,
    observation_trigger: scenario.observation_trigger,
    flow_chain: scenario.flow_chain,
    invalidation_rule: scenario.invalidation_rule,
    card_price_gate_summary: buildPriceGateSummary(latestGate, scenario.price_gate_policy),
    current_status: latestEvent?.to_status ?? scenario.current_status_seed,
    latest_reason_code: latestEvent?.reason_code ?? "seed_status",
    latest_reason_detail: latestEvent?.reason_detail ?? "",
    latest_status_changed_at: latestEvent?.changed_at ?? null,
    latest_snapshot_at: latestSnapshot?.observed_at ?? null,
    latest_trigger_state: latestSnapshot?.trigger_state ?? null,
    latest_observed_signals: latestSnapshot?.observed_signals ?? [],
    latest_price_gate: latestGate?.overall_gate ?? null,
    latest_fail_reason_codes: latestGate?.fail_reason_codes ?? [],
    latest_gate_checked_at: latestGate?.checked_at ?? null,
    decision_reference_at: decisionReferenceAt,
    linked_snapshot_id: linkedSnapshot?.snapshot_id ?? null,
    linked_snapshot_at: linkedSnapshot?.observed_at ?? null,
    linked_session_phase: linkedSnapshot?.session_phase ?? null,
    linked_trigger_state: linkedSnapshot?.trigger_state ?? null,
    linked_observed_signals: linkedSnapshot?.observed_signals ?? [],
    linked_event_risk_today: linkedSnapshot?.event_risk_today ?? null,
    linked_market_note: linkedSnapshot?.market_note ?? "",
    linked_operator_action: linkedSnapshot?.operator_action ?? null,
    linked_source_refs: linkedSnapshot?.source_refs ?? [],
    linked_price_gate_id: linkedGate?.price_gate_id ?? null,
    linked_price_gate: linkedGate?.overall_gate ?? null,
    linked_fail_reason_codes: linkedGate?.fail_reason_codes ?? [],
    linked_gate_checked_at: linkedGate?.checked_at ?? null,
    linked_gate_note: linkedGate?.gate_note ?? "",
    snapshot_decision_gap_minutes: snapshotDecisionGapMinutes,
    gate_decision_gap_minutes: gateDecisionGapMinutes,
    price_freshness_state: priceFreshnessState,
    next_review_phase: latestEvent?.next_review_phase ?? null,
    next_review_at: latestEvent?.next_review_at ?? null,
    is_review_due: isDue(latestEvent?.next_review_at, now)
  };
}

export function buildScenarioCurrentViews(records, now = records.prototypeClock) {
  return records.scenarios
    .map((scenario) => buildScenarioCurrentView(records, scenario, now))
    .sort((left, right) => {
      if (left.is_review_due !== right.is_review_due) {
        return left.is_review_due ? -1 : 1;
      }

      const reviewDiff = compareAscWithNulls(left.next_review_at, right.next_review_at);
      if (reviewDiff !== 0) {
        return reviewDiff;
      }

      return compareDesc(left.latest_status_changed_at ?? "1970-01-01T00:00:00Z", right.latest_status_changed_at ?? "1970-01-01T00:00:00Z");
    });
}

export function getScenarioDetail(records, scenarioId, now = records.prototypeClock) {
  const scenario = records.scenarios.find((entry) => entry.scenario_id === scenarioId) ?? null;

  if (!scenario) {
    return null;
  }

  return {
    scenario,
    currentView: buildScenarioCurrentView(records, scenario, now),
    snapshots: [...byScenario(records, scenarioId, "observationSnapshots")].sort((left, right) => compareDesc(left.observed_at, right.observed_at)),
    priceGates: [...byScenario(records, scenarioId, "priceGates")].sort((left, right) => compareDesc(left.checked_at, right.checked_at)),
    statusEvents: [...byScenario(records, scenarioId, "statusEvents")].sort((left, right) => compareDesc(left.changed_at, right.changed_at))
  };
}
