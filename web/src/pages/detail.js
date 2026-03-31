import { appendDailyReviewInStore, loadRecords, upsertScenarioInStore } from "../lib/browserRecordStore.js";
import { createDailyReviewDraft } from "../lib/dailyReview.js";
import { createEmptyScenarioDraft, scenarioToDraft } from "../lib/scenarioDraft.js";
import { getScenarioDetail } from "../lib/scenarioViews.js";
import { renderDetailPage } from "../render/detailPage.js";

const app = document.querySelector("#app");
const pageState = {
  scenarioDraft: null,
  scenarioErrors: [],
  reviewDraft: null,
  reviewErrors: []
};

function getMode() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  return mode === "new" || mode === "edit" || mode === "review" ? mode : "view";
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

function buildRawReviewInput(formData) {
  return {
    scenario_id: formData.get("scenario_id"),
    observed_at: formData.get("observed_at"),
    session_phase: formData.get("session_phase"),
    trigger_state: formData.get("trigger_state"),
    observed_signals: formData.get("observed_signals"),
    event_risk_today: formData.get("event_risk_today"),
    market_note: formData.get("market_note"),
    operator_action: formData.get("operator_action"),
    source_refs: formData.get("source_refs"),
    checked_at: formData.get("checked_at"),
    expiry_bucket_ok: formData.get("expiry_bucket_ok"),
    spread_ok: formData.get("spread_ok"),
    premium_within_budget: formData.get("premium_within_budget"),
    iv_event_heat_ok: formData.get("iv_event_heat_ok"),
    theme_cooldown_ok: formData.get("theme_cooldown_ok"),
    overall_gate: formData.get("overall_gate"),
    fail_reason_codes: formData.getAll("fail_reason_codes"),
    gate_note: formData.get("gate_note"),
    changed_at: formData.get("changed_at"),
    to_status: formData.get("to_status"),
    reason_code: formData.get("reason_code"),
    reason_detail: formData.get("reason_detail"),
    next_review_phase: formData.get("next_review_phase"),
    next_review_at: formData.get("next_review_at")
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
      pageState.scenarioDraft = result.draft;
      pageState.scenarioErrors = result.errors;
      render();
      return;
    }

    pageState.scenarioDraft = null;
    pageState.scenarioErrors = [];

    if (getMode() === "new") {
      window.location.assign("./index.html");
      return;
    }

    window.location.assign(`./detail.html?scenario=${encodeURIComponent(result.scenario.scenario_id)}`);
  });
}

function bindReviewForm() {
  const form = document.querySelector("[data-review-form]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = appendDailyReviewInStore(buildRawReviewInput(new FormData(form)));
    if (!result.ok) {
      pageState.reviewDraft = result.draft;
      pageState.reviewErrors = result.errors;
      render();
      return;
    }

    pageState.reviewDraft = null;
    pageState.reviewErrors = [];
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
    mode === "new" || mode === "edit"
      ? pageState.scenarioDraft ??
        (mode === "new"
          ? createEmptyScenarioDraft()
          : detail
            ? scenarioToDraft(detail.scenario)
            : createEmptyScenarioDraft())
      : pageState.reviewDraft ?? (detail ? createDailyReviewDraft(detail, records.prototypeClock) : null);

  const errors =
    mode === "new" || mode === "edit"
      ? pageState.scenarioErrors
      : pageState.reviewErrors;

  app.innerHTML = renderDetailPage({
    detail,
    mode,
    draft,
    errors
  });

  bindScenarioForm();
  bindReviewForm();
}

render();
