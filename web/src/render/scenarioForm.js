import { escapeHtml, formatCodeLabel, formatFieldLabel, formatPhase } from "../lib/formatters.js";
import { scenarioFormOptions } from "../lib/scenarioDraft.js";

function renderSelectOptions(options, selectedValue) {
  return options
    .map((value) => {
      const isSelected = value === selectedValue ? ' selected="selected"' : "";
      return `<option value="${escapeHtml(value)}"${isSelected}>${escapeHtml(formatCodeLabel(value))}</option>`;
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
      <p class="form-errors-title">保存前に次を修正してください。</p>
      <ul class="form-error-list">
        ${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
      </ul>
    </div>
  `;
}

export function renderScenarioForm({ draft, errors, mode, cancelHref }) {
  const isEditMode = mode === "edit";
  const formTitle = isEditMode ? "シナリオ編集" : "新規シナリオ";
  const formCopy = isEditMode
    ? "ここで更新するのは固定的な仮説項目のみです。レビュー履歴は追記専用のまま残ります。"
    : "まずは固定的な仮説を登録します。レビュー記録が追加されるまでは状態は「監視」のままです。";
  const submitLabel = isEditMode ? "シナリオを保存" : "シナリオを作成";
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
          <a class="action ghost" href="${cancelHref}">キャンセル</a>
        </div>
      </div>
      ${renderErrors(errors)}
      <form class="scenario-form" data-scenario-form novalidate>
        <div class="form-grid">
          <label class="field">
            <span>${formatFieldLabel("scenario_id")}</span>
            <input type="text" name="scenario_id" value="${escapeHtml(draft.scenario_id)}"${readOnlyAttributes} placeholder="NKY-D-005" />
            <small class="field-hint">${isEditMode ? "編集中はシナリオIDを変更できません。" : "同じシナリオIDで保存すると既存シナリオを更新します。"}</small>
          </label>

          <label class="field">
            <span>${formatFieldLabel("market")}</span>
            <select name="market">
              ${renderSelectOptions(scenarioFormOptions.markets, draft.market)}
            </select>
          </label>

          <label class="field">
            <span>${formatFieldLabel("direction")}</span>
            <select name="direction">
              ${renderSelectOptions(scenarioFormOptions.directions, draft.direction)}
            </select>
          </label>

          <label class="field">
            <span>${formatFieldLabel("horizon_bucket")}</span>
            <select name="horizon_bucket">
              ${renderSelectOptions(scenarioFormOptions.horizonBuckets, draft.horizon_bucket)}
            </select>
          </label>

          <label class="field">
            <span>${formatFieldLabel("entry_window")}</span>
            <select name="entry_window">
              ${renderSelectOptions(scenarioFormOptions.entryWindows, draft.entry_window)}
            </select>
          </label>

          <label class="field">
            <span>${formatFieldLabel("price_gate_policy")}</span>
            <select name="price_gate_policy">
              ${renderSelectOptions(scenarioFormOptions.priceGatePolicies, draft.price_gate_policy)}
            </select>
          </label>

          <label class="field field-wide">
            <span>${formatFieldLabel("scenario_summary")}</span>
            <textarea name="scenario_summary" rows="2" placeholder="us_rates_reprice_and_yen_strength_pressure_nikkei">${escapeHtml(draft.scenario_summary)}</textarea>
          </label>

          <label class="field field-wide">
            <span>${formatFieldLabel("observation_trigger")}</span>
            <textarea name="observation_trigger" rows="3" placeholder="usd_jpy_breaks_prior_day_low_and_nky_futures_fail_rebound">${escapeHtml(draft.observation_trigger)}</textarea>
          </label>

          <label class="field field-wide">
            <span>${formatFieldLabel("flow_chain")}</span>
            <textarea name="flow_chain" rows="3" placeholder="us_rates_up -> yen_strength -> exporters_weaken -> index_pressure">${escapeHtml(draft.flow_chain)}</textarea>
          </label>

          <label class="field field-wide">
            <span>${formatFieldLabel("invalidation_rule")}</span>
            <textarea name="invalidation_rule" rows="3" placeholder="usd_jpy_reclaims_range_or_nky_closes_above_gap">${escapeHtml(draft.invalidation_rule)}</textarea>
          </label>

          <fieldset class="field field-wide">
            <legend>${formatFieldLabel("review_cadence")}</legend>
            <div class="checkbox-grid">
              ${renderCadenceOptions(draft.review_cadence)}
            </div>
          </fieldset>

          <label class="field field-wide">
            <span>${formatFieldLabel("tags")}</span>
            <input type="text" name="tags" value="${tagsValue}" placeholder="rates, yen, exporters" />
            <small class="field-hint">カンマまたはセミコロン区切りで入力します。</small>
          </label>

          <label class="field field-wide">
            <span>${formatFieldLabel("notes")}</span>
            <textarea name="notes" rows="3" placeholder="optional_operator_note">${escapeHtml(draft.notes)}</textarea>
          </label>
        </div>

        <div class="form-actions">
          <button class="action primary" type="submit">${submitLabel}</button>
          <a class="action ghost" href="${cancelHref}">キャンセル</a>
        </div>
      </form>
    </section>
  `;
}
