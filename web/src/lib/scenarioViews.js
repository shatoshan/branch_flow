import {
  buildPriceGateSummary,
  compareAscWithNulls,
  compareDesc,
  isDue
} from "./formatters.js";

function byScenario(records, scenarioId, field) {
  return records[field].filter((entry) => entry.scenario_id === scenarioId);
}

function selectLatest(entries, timestampField) {
  return [...entries].sort((left, right) => compareDesc(left[timestampField], right[timestampField]))[0] ?? null;
}

export function buildScenarioCurrentView(records, scenario, now = records.prototypeClock) {
  const snapshots = byScenario(records, scenario.scenario_id, "observationSnapshots");
  const gates = byScenario(records, scenario.scenario_id, "priceGates");
  const events = byScenario(records, scenario.scenario_id, "statusEvents");

  const latestSnapshot = selectLatest(snapshots, "observed_at");
  const latestGate = selectLatest(gates, "checked_at");
  const latestEvent = selectLatest(events, "changed_at");

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
