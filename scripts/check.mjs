import assert from "node:assert/strict";

import { prototypeRecords } from "../web/src/data/sampleRecords.js";
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

console.log("check: ok");
