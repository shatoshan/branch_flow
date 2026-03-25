import { loadRecords, upsertScenarioInStore } from "../lib/browserRecordStore.js";
import { createEmptyScenarioDraft, scenarioToDraft } from "../lib/scenarioDraft.js";
import { getScenarioDetail } from "../lib/scenarioViews.js";
import { renderDetailPage } from "../render/detailPage.js";

const app = document.querySelector("#app");
const pageState = {
  draft: null,
  errors: []
};

function getMode() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  return mode === "new" || mode === "edit" ? mode : "view";
}

function buildRawScenarioInput(formData) {
  return {
    scenario_id: formData.get("scenario_id"),
    market: formData.get("market"),
    direction: formData.get("direction"),
    scenario_summary: formData.get("scenario_summary"),
    horizon_bucket: formData.get("horizon_bucket"),
    entry_window: formData.get("entry_window"),
    observation_trigger: formData.get("observation_trigger"),
    flow_chain: formData.get("flow_chain"),
    price_gate_policy: formData.get("price_gate_policy"),
    invalidation_rule: formData.get("invalidation_rule"),
    review_cadence: formData.getAll("review_cadence"),
    tags: formData.get("tags"),
    notes: formData.get("notes")
  };
}

function bindScenarioForm() {
  const form = document.querySelector("[data-scenario-form]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = upsertScenarioInStore(buildRawScenarioInput(new FormData(form)));
    if (!result.ok) {
      pageState.draft = result.draft;
      pageState.errors = result.errors;
      render();
      return;
    }

    pageState.draft = null;
    pageState.errors = [];

    if (getMode() === "new") {
      window.location.assign("./index.html");
      return;
    }

    window.location.assign(`./detail.html?scenario=${encodeURIComponent(result.scenario.scenario_id)}`);
  });
}

function render() {
  const records = loadRecords();
  const params = new URLSearchParams(window.location.search);
  const mode = getMode();
  const fallbackScenarioId = records.scenarios[0]?.scenario_id ?? "";
  const scenarioId = params.get("scenario") ?? fallbackScenarioId;
  const detail = mode === "new" ? null : getScenarioDetail(records, scenarioId, records.prototypeClock);
  const draft =
    pageState.draft ??
    (mode === "new"
      ? createEmptyScenarioDraft()
      : detail
        ? scenarioToDraft(detail.scenario)
        : createEmptyScenarioDraft());

  app.innerHTML = renderDetailPage({
    detail,
    mode,
    draft,
    errors: pageState.errors
  });

  bindScenarioForm();
}

render();
