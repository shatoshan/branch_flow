import assert from "node:assert/strict";

import { prototypeRecords } from "../web/src/data/sampleRecords.js";
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
const detailMarkup = renderDetailPage(detail);
assert.match(detailMarkup, /Scenario Thesis/);
assert.match(detailMarkup, /Current View/);
assert.match(detailMarkup, /Observation Timeline/);
assert.match(detailMarkup, /Price Gate/);
assert.match(detailMarkup, /Status History/);

console.log("check: ok");
