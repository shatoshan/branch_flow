import assert from "node:assert/strict";

import { prototypeRecords } from "../web/src/data/sampleRecords.js";
import { appendDailyReviewRecords, createDailyReviewDraft } from "../web/src/lib/dailyReview.js";
import { createEmptyScenarioDraft, scenarioToDraft, upsertScenarioRecords } from "../web/src/lib/scenarioDraft.js";
import { buildScenarioCurrentViews, getScenarioDetail } from "../web/src/lib/scenarioViews.js";
import { renderHomePage } from "../web/src/render/homePage.js";
import { renderDetailPage } from "../web/src/render/detailPage.js";

const views = buildScenarioCurrentViews(prototypeRecords, prototypeRecords.prototypeClock);
assert.equal(views.length, 4, "expected four current views");

const statusMap = Object.fromEntries(views.map((view) => [view.scenario_id, view.current_status]));
assert.deepEqual(statusMap, {
  "NKY-D-001": "watch",
  "NKY-D-002": "eligible",
  "NKY-D-003": "rejected",
  "NKY-D-004": "invalidated"
});

const dueIds = views.filter((view) => view.is_review_due).map((view) => view.scenario_id);
assert.deepEqual(dueIds, ["NKY-D-001", "NKY-D-002"]);

const homeMarkup = renderHomePage({
  views,
  asOf: prototypeRecords.prototypeClock,
  dueOnly: false
});
assert.match(homeMarkup, /Conditional option-buying terminal/);
assert.match(homeMarkup, /latest_reason/);
assert.match(homeMarkup, /detail\.html\?scenario=NKY-D-001/);
assert.match(homeMarkup, /mode=review/);

const detail = getScenarioDetail(prototypeRecords, "NKY-D-001", prototypeRecords.prototypeClock);
assert.ok(detail, "detail should exist");
const detailMarkup = renderDetailPage({
  detail,
  mode: "view",
  draft: scenarioToDraft(detail.scenario),
  errors: []
});
assert.match(detailMarkup, /Scenario Thesis/);
assert.match(detailMarkup, /Current View/);
assert.match(detailMarkup, /Observation Timeline/);
assert.match(detailMarkup, /Price Gate/);
assert.match(detailMarkup, /Status History/);
assert.match(detailMarkup, /Edit Scenario/);
assert.match(detailMarkup, /Add Daily Review/);

const newScenarioInput = {
  ...createEmptyScenarioDraft(),
  scenario_id: "NKY-D-005",
  scenario_summary: "yen_strength_extends_index_pressure_into_close",
  observation_trigger: "usd_jpy_fails_rebound_and_breadth_stays_soft",
  flow_chain: "yen_strength -> exporters_weak -> local_long_unwind",
  invalidation_rule: "usd_jpy_recovers_and_breadth_turns",
  review_cadence: ["morning", "after_close"],
  tags: "yen; breadth",
  notes: "watch for late session pressure"
};

const createResult = upsertScenarioRecords(prototypeRecords, newScenarioInput);
assert.equal(createResult.ok, true, "scenario create should succeed");
assert.equal(createResult.records.scenarios.length, 5, "new scenario should append");
assert.equal(
  createResult.records.observationSnapshots.length,
  prototypeRecords.observationSnapshots.length,
  "create must not touch snapshots"
);
assert.equal(
  createResult.records.priceGates.length,
  prototypeRecords.priceGates.length,
  "create must not touch price gates"
);
assert.equal(
  createResult.records.statusEvents.length,
  prototypeRecords.statusEvents.length,
  "create must not touch status events"
);
assert.equal(createResult.scenario.current_status_seed, "watch");

const createdView = buildScenarioCurrentViews(createResult.records, createResult.records.prototypeClock).find(
  (view) => view.scenario_id === "NKY-D-005"
);
assert.ok(createdView, "created scenario should appear in current view");
assert.equal(createdView.current_status, "watch");

const updateResult = upsertScenarioRecords(prototypeRecords, {
  scenario_id: "NKY-D-002",
  market: "nikkei225",
  direction: "downside",
  scenario_summary: "gap_down_rebound_failure_extends_sell_pressure_updated",
  horizon_bucket: "1d_2w",
  entry_window: "same_week",
  observation_trigger: "cash_open_below_prior_range_and_first_hour_reclaim_fails",
  flow_chain: "overnight_risk_off -> futures_sell_programs -> local_long_unwind -> downside_extension",
  price_gate_policy: "standard_min_gate",
  invalidation_rule: "opening_gap_fills_and_breadth_recovers",
  review_cadence: ["morning", "after_close"],
  tags: "risk_off, breadth",
  notes: "update stable fields only"
});

assert.equal(updateResult.ok, true, "scenario update should succeed");
assert.equal(
  updateResult.records.scenarios.length,
  prototypeRecords.scenarios.length,
  "update must not change scenario count"
);
assert.equal(
  updateResult.records.observationSnapshots.length,
  prototypeRecords.observationSnapshots.length,
  "update must not touch snapshots"
);
assert.deepEqual(updateResult.scenario.review_cadence, ["morning", "after_close"]);
assert.deepEqual(updateResult.scenario.tags, ["risk_off", "breadth"]);
assert.equal(updateResult.scenario.notes, "update stable fields only");
assert.equal(updateResult.scenario.current_status_seed, "watch");

const editMarkup = renderDetailPage({
  detail,
  mode: "edit",
  draft: scenarioToDraft(detail.scenario),
  errors: []
});
assert.match(editMarkup, /Save Scenario/);
assert.match(editMarkup, /Update stable thesis fields without touching review history/);

const newMarkup = renderDetailPage({
  detail: null,
  mode: "new",
  draft: createEmptyScenarioDraft(),
  errors: []
});
assert.match(newMarkup, /Create Scenario/);
assert.match(newMarkup, /review_cadence/);

const dailyReviewDraft = createDailyReviewDraft(detail, "2026-03-25T09:00:00+09:00");
assert.equal(dailyReviewDraft.scenario_id, "NKY-D-001");
assert.equal(dailyReviewDraft.from_status, "watch");
assert.equal(dailyReviewDraft.checked_at, "2026-03-25T09:00:00+09:00");

const appendResult = appendDailyReviewRecords(prototypeRecords, {
  scenario_id: "NKY-D-001",
  observed_at: "2026-03-25T08:55:00+09:00",
  session_phase: "morning",
  trigger_state: "confirmed",
  observed_signals: "usd_jpy_break, breadth_soft, exporters_weak",
  event_risk_today: "none_major",
  market_note: "trigger stayed intact into the next session",
  operator_action: "promote_eligible",
  source_refs: "fx_board; breadth_sheet; futures_board",
  checked_at: "2026-03-25T08:58:00+09:00",
  expiry_bucket_ok: "true",
  spread_ok: "true",
  premium_within_budget: "true",
  iv_event_heat_ok: "true",
  theme_cooldown_ok: "true",
  overall_gate: "pass",
  fail_reason_codes: [],
  gate_note: "put premium stayed inside the daily budget",
  changed_at: "2026-03-25T09:00:00+09:00",
  to_status: "eligible",
  reason_code: "price_gate_pass",
  reason_detail: "trigger_confirmed_and_gate_passed",
  next_review_phase: "after_close",
  next_review_at: "2026-03-25T15:10:00+09:00"
});

assert.equal(appendResult.ok, true, "daily review append should succeed");
assert.equal(
  appendResult.records.observationSnapshots.length,
  prototypeRecords.observationSnapshots.length + 1,
  "daily review append must add one snapshot"
);
assert.equal(
  appendResult.records.priceGates.length,
  prototypeRecords.priceGates.length + 1,
  "daily review append must add one price gate"
);
assert.equal(
  appendResult.records.statusEvents.length,
  prototypeRecords.statusEvents.length + 1,
  "daily review append must add one status event"
);
assert.equal(appendResult.snapshot.snapshot_id, appendResult.statusEvent.snapshot_id);
assert.equal(appendResult.priceGate.price_gate_id, appendResult.statusEvent.price_gate_id);
assert.equal(appendResult.statusEvent.from_status, "watch");
assert.equal(appendResult.records.prototypeClock, "2026-03-25T09:00:00+09:00");

const appendedView = buildScenarioCurrentViews(appendResult.records, appendResult.records.prototypeClock).find(
  (view) => view.scenario_id === "NKY-D-001"
);
assert.ok(appendedView, "appended scenario should still exist in current view");
assert.equal(appendedView.current_status, "eligible");
assert.equal(appendedView.latest_reason_code, "price_gate_pass");
assert.equal(appendedView.next_review_at, "2026-03-25T15:10:00+09:00");

const appendedDetail = getScenarioDetail(appendResult.records, "NKY-D-001", appendResult.records.prototypeClock);
assert.equal(appendedDetail.snapshots[0].snapshot_id, appendResult.snapshot.snapshot_id);
assert.equal(appendedDetail.priceGates[0].price_gate_id, appendResult.priceGate.price_gate_id);
assert.equal(appendedDetail.statusEvents[0].status_event_id, appendResult.statusEvent.status_event_id);

const uncheckedAppendResult = appendDailyReviewRecords(prototypeRecords, {
  scenario_id: "NKY-D-001",
  observed_at: "2026-03-25T12:00:00+09:00",
  session_phase: "intraday",
  trigger_state: "partial",
  observed_signals: "yen_firm, breadth_soft",
  event_risk_today: "us_data_later",
  market_note: "trigger improved but option market not checked yet",
  operator_action: "keep_watch",
  source_refs: "fx_board, breadth_sheet",
  checked_at: "2026-03-25T12:00:00+09:00",
  expiry_bucket_ok: "",
  spread_ok: "",
  premium_within_budget: "",
  iv_event_heat_ok: "",
  theme_cooldown_ok: "",
  overall_gate: "unchecked",
  fail_reason_codes: [],
  gate_note: "price check deferred until the afternoon review",
  changed_at: "2026-03-25T12:01:00+09:00",
  to_status: "watch",
  reason_code: "trigger_pending",
  reason_detail: "still waiting for full trigger confirmation",
  next_review_phase: "after_close",
  next_review_at: "2026-03-25T15:10:00+09:00"
});

assert.equal(uncheckedAppendResult.ok, true, "unchecked daily review append should succeed");
assert.equal(uncheckedAppendResult.priceGate.overall_gate, "unchecked");
assert.equal(uncheckedAppendResult.priceGate.expiry_bucket_ok, null);
assert.equal(uncheckedAppendResult.priceGate.spread_ok, null);
assert.deepEqual(uncheckedAppendResult.priceGate.fail_reason_codes, []);

const reviewMarkup = renderDetailPage({
  detail,
  mode: "review",
  draft: dailyReviewDraft,
  errors: []
});
assert.match(reviewMarkup, /Append Daily Review/);
assert.match(reviewMarkup, /status event/);

console.log("check: ok");
