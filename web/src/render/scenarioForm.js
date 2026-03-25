import { escapeHtml, formatPhase } from "../lib/formatters.js";
import { scenarioFormOptions } from "../lib/scenarioDraft.js";

const optionLabels = {
  nikkei225: "Nikkei 225",
  downside: "Downside",
  upside: "Upside",
  "1d_2w": "1d to 2w",
  same_day: "Same Day",
  same_week: "Same Week",
  next_3_sessions: "Next 3 Sessions",
  next_5_sessions: "Next 5 Sessions",
  standard_min_gate: "Standard Min Gate",
  event_guarded_gate: "Event Guarded Gate"
};

function formatOptionLabel(value) {
  return optionLabels[value] ?? value;
}

function renderSelectOptions(options, selectedValue) {
  return options
    .map((value) => {
      const isSelected = value === selectedValue ? ' selected="selected"' : "";
      return `<option value="${escapeHtml(value)}"${isSelected}>${escapeHtml(formatOptionLabel(value))}</option>`;
    })
    .join("");
}

function renderCadenceOptions(selectedValues) {
  return scenarioFormOptions.reviewCadences
    .map((value) => {
      const isChecked = selectedValues.includes(value) ? ' checked="checked"' : "";
      return `
        <label class="checkbox-option">
          <input type="checkbox" name="review_cadence" value="${escapeHtml(value)}"${isChecked} />
          <span>${escapeHtml(formatPhase(value))}</span>
        </label>
      `;
    })
    .join("");
}

function renderErrors(errors) {
  if (!errors || errors.length === 0) {
    return "";
  }

  return `
    <div class="form-errors" role="alert">
      <p class="form-errors-title">Fix the following before saving.</p>
      <ul class="form-error-list">
        ${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
      </ul>
    </div>
  `;
}

export function renderScenarioForm({ draft, errors, mode, cancelHref }) {
  const isEditMode = mode === "edit";
  const formTitle = isEditMode ? "Edit Scenario" : "New Scenario";
  const formCopy = isEditMode
    ? "Only stable thesis fields change here. Review records stay append-only."
    : "Create a stable thesis record first. Current status will stay on Watch until review records are added later.";
  const submitLabel = isEditMode ? "Save Scenario" : "Create Scenario";
  const readOnlyAttributes = isEditMode ? ' readonly="readonly" aria-readonly="true"' : "";
  const tagsValue = escapeHtml(draft.tags.join(", "));

  return `
    <section class="panel detail-panel form-panel">
      <div class="form-shell">
        <div>
          <h2 class="section-title">${formTitle}</h2>
          <p class="section-copy">${formCopy}</p>
        </div>
        <div class="detail-actions">
          <a class="action ghost" href="${cancelHref}">Cancel</a>
        </div>
      </div>
      ${renderErrors(errors)}
      <form class="scenario-form" data-scenario-form novalidate>
        <div class="form-grid">
          <label class="field">
            <span>scenario_id</span>
            <input type="text" name="scenario_id" value="${escapeHtml(draft.scenario_id)}"${readOnlyAttributes} placeholder="NKY-D-005" />
            <small class="field-hint">${isEditMode ? "Scenario ID is fixed during edit." : "Duplicate IDs update the existing scenario."}</small>
          </label>

          <label class="field">
            <span>market</span>
            <select name="market">
              ${renderSelectOptions(scenarioFormOptions.markets, draft.market)}
            </select>
          </label>

          <label class="field">
            <span>direction</span>
            <select name="direction">
              ${renderSelectOptions(scenarioFormOptions.directions, draft.direction)}
            </select>
          </label>

          <label class="field">
            <span>horizon_bucket</span>
            <select name="horizon_bucket">
              ${renderSelectOptions(scenarioFormOptions.horizonBuckets, draft.horizon_bucket)}
            </select>
          </label>

          <label class="field">
            <span>entry_window</span>
            <select name="entry_window">
              ${renderSelectOptions(scenarioFormOptions.entryWindows, draft.entry_window)}
            </select>
          </label>

          <label class="field">
            <span>price_gate_policy</span>
            <select name="price_gate_policy">
              ${renderSelectOptions(scenarioFormOptions.priceGatePolicies, draft.price_gate_policy)}
            </select>
          </label>

          <label class="field field-wide">
            <span>scenario_summary</span>
            <textarea name="scenario_summary" rows="2" placeholder="us_rates_reprice_and_yen_strength_pressure_nikkei">${escapeHtml(draft.scenario_summary)}</textarea>
          </label>

          <label class="field field-wide">
            <span>observation_trigger</span>
            <textarea name="observation_trigger" rows="3" placeholder="usd_jpy_breaks_prior_day_low_and_nky_futures_fail_rebound">${escapeHtml(draft.observation_trigger)}</textarea>
          </label>

          <label class="field field-wide">
            <span>flow_chain</span>
            <textarea name="flow_chain" rows="3" placeholder="us_rates_up -> yen_strength -> exporters_weaken -> index_pressure">${escapeHtml(draft.flow_chain)}</textarea>
          </label>

          <label class="field field-wide">
            <span>invalidation_rule</span>
            <textarea name="invalidation_rule" rows="3" placeholder="usd_jpy_reclaims_range_or_nky_closes_above_gap">${escapeHtml(draft.invalidation_rule)}</textarea>
          </label>

          <fieldset class="field field-wide">
            <legend>review_cadence</legend>
            <div class="checkbox-grid">
              ${renderCadenceOptions(draft.review_cadence)}
            </div>
          </fieldset>

          <label class="field field-wide">
            <span>tags</span>
            <input type="text" name="tags" value="${tagsValue}" placeholder="rates, yen, exporters" />
            <small class="field-hint">Comma or semicolon separated.</small>
          </label>

          <label class="field field-wide">
            <span>notes</span>
            <textarea name="notes" rows="3" placeholder="optional operator note">${escapeHtml(draft.notes)}</textarea>
          </label>
        </div>

        <div class="form-actions">
          <button class="action primary" type="submit">${submitLabel}</button>
          <a class="action ghost" href="${cancelHref}">Cancel</a>
        </div>
      </form>
    </section>
  `;
}
