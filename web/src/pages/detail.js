import { prototypeRecords } from "../data/sampleRecords.js";
import { getScenarioDetail } from "../lib/scenarioViews.js";
import { renderDetailPage } from "../render/detailPage.js";

const app = document.querySelector("#app");
const params = new URLSearchParams(window.location.search);
const scenarioId = params.get("scenario") ?? prototypeRecords.scenarios[0]?.scenario_id ?? "";
const detail = getScenarioDetail(prototypeRecords, scenarioId, prototypeRecords.prototypeClock);

app.innerHTML = renderDetailPage(detail);
