import {
  escapeHtml,
  formatGateStatus,
  formatPhase,
  formatStatus,
  formatTriggerState
} from "../lib/formatters.js";
import { dailyReviewFormOptions } from "../lib/dailyReview.js";

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

function renderOptionLabel(group, value) {
  if (group === "sessionPhases") {
    return formatPhase(value);
  }

  if (group === "triggerStates") {
    return formatTriggerState(value);
  }

  if (group === "gateStatuses") {
    return formatGateStatus(value);
  }

  if (group === "statusOptions") {
    return formatStatus(value);
  }

  return value;
}

function renderSelectOptions(group, selectedValue) {
  return dailyReviewFormOptions[group]
    .map((value) => {
      const isSelected = value === selectedValue ? ' selected="selected"' : "";
      return `<option value="${escapeHtml(value)}"${isSelected}>${escapeHtml(renderOptionLabel(group, value))}</option>`;
    })
    .join("");
}

function renderTriStateOptions(selectedValue) {
  const options = [
    { value: "", label: "Unset" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" }
  ];

  return options
    .map((option) => {
      const isSelected = option.value === (selectedValue === null ? "" : String(selectedValue)) ? ' selected="selected"' : "";
      return `<option value="${escapeHtml(option.value)}"${isSelected}>${escapeHtml(option.label)}</option>`;
    })
    .join("");
}

function renderFailReasonOptions(selectedValues) {
  return dailyReviewFormOptions.failReasonCodes
    .map((value) => {
      const isChecked = selectedValues.includes(value) ? ' checked="checked"' : "";
      return `
        <label class="checkbox-option">
          <input type="checkbox" name="fail_reason_codes" value="${escapeHtml(value)}"${isChecked} />
          <span>${escapeHtml(value)}</span>
        </label>
      `;
    })
    .join("");
}

export function renderDailyReviewForm({ draft, errors, cancelHref }) {
  const observedSignals = escapeHtml(draft.observed_signals.join(", "));
  const sourceRefs = escapeHtml(draft.source_refs.join(", "));

  return `
    <section class="panel detail-panel form-panel">
      <div class="form-shell">
        <div>
          <h2 class="section-title">Add Daily Review</h2>
          <p class="section-copy">Append one observation snapshot, one price gate, and one status event in the same submit. Review IDs are assigned automatically.</p>
        </div>
        <div class="detail-actions">
          <a class="action ghost" href="${cancelHref}">Cancel</a>
        </div>
      </div>
      ${renderErrors(errors)}
      <form class="scenario-form" data-review-form novalidate>
        <div class="form-grid">
          <label class="field">
            <span>scenario_id</span>
            <input type="text" name="scenario_id" value="${escapeHtml(draft.scenario_id)}" readonly="readonly" aria-readonly="true" />
          </label>

          <label class="field">
            <span>from_status</span>
            <input type="text" name="from_status" value="${escapeHtml(formatStatus(draft.from_status))}" readonly="readonly" aria-readonly="true" />
            <small class="field-hint">Derived from the latest status event or seed status.</small>
          </label>

          <label class="field">
            <span>observed_at</span>
            <input type="text" name="observed_at" value="${escapeHtml(draft.observed_at)}" placeholder="2026-03-25T08:55:00+09:00" />
          </label>

          <label class="field">
            <span>session_phase</span>
            <select name="session_phase">
              ${renderSelectOptions("sessionPhases", draft.session_phase)}
            </select>
          </label>

          <label class="field">
            <span>trigger_state</span>
            <select name="trigger_state">
              ${renderSelectOptions("triggerStates", draft.trigger_state)}
            </select>
          </label>

          <label class="field">
            <span>checked_at</span>
            <input type="text" name="checked_at" value="${escapeHtml(draft.checked_at)}" placeholder="2026-03-25T08:58:00+09:00" />
          </label>

          <label class="field">
            <span>overall_gate</span>
            <select name="overall_gate">
              ${renderSelectOptions("gateStatuses", draft.overall_gate)}
            </select>
            <small class="field-hint">Use unchecked to append a review without a confirmed option check yet.</small>
          </label>

          <label class="field">
            <span>changed_at</span>
            <input type="text" name="changed_at" value="${escapeHtml(draft.changed_at)}" placeholder="2026-03-25T09:00:00+09:00" />
          </label>

          <label class="field">
            <span>to_status</span>
            <select name="to_status">
              ${renderSelectOptions("statusOptions", draft.to_status)}
            </select>
          </label>

          <label class="field">
            <span>reason_code</span>
            <select name="reason_code">
              ${dailyReviewFormOptions.reasonCodes
                .map((value) => {
                  const isSelected = value === draft.reason_code ? ' selected="selected"' : "";
                  return `<option value="${escapeHtml(value)}"${isSelected}>${escapeHtml(value)}</option>`;
                })
                .join("")}
            </select>
          </label>

          <label class="field">
            <span>next_review_phase</span>
            <select name="next_review_phase">
              ${renderSelectOptions("sessionPhases", draft.next_review_phase)}
            </select>
          </label>

          <label class="field">
            <span>next_review_at</span>
            <input type="text" name="next_review_at" value="${escapeHtml(draft.next_review_at)}" placeholder="2026-03-25T15:10:00+09:00" />
          </label>

          <label class="field field-wide">
            <span>observed_signals</span>
            <input type="text" name="observed_signals" value="${observedSignals}" placeholder="usd_jpy_break, breadth_soft, exporters_weak" />
            <small class="field-hint">Comma or semicolon separated.</small>
          </label>

          <label class="field">
            <span>event_risk_today</span>
            <input type="text" name="event_risk_today" value="${escapeHtml(draft.event_risk_today)}" placeholder="none_major" />
          </label>

          <label class="field">
            <span>operator_action</span>
            <input type="text" name="operator_action" value="${escapeHtml(draft.operator_action)}" placeholder="keep_watch" />
          </label>

          <label class="field field-wide">
            <span>source_refs</span>
            <input type="text" name="source_refs" value="${sourceRefs}" placeholder="fx_board, breadth_sheet" />
            <small class="field-hint">Comma or semicolon separated.</small>
          </label>

          <label class="field field-wide">
            <span>market_note</span>
            <textarea name="market_note" rows="3" placeholder="market context observed during the review">${escapeHtml(draft.market_note)}</textarea>
          </label>

          <label class="field">
            <span>expiry_bucket_ok</span>
            <select name="expiry_bucket_ok">
              ${renderTriStateOptions(draft.expiry_bucket_ok)}
            </select>
          </label>

          <label class="field">
            <span>spread_ok</span>
            <select name="spread_ok">
              ${renderTriStateOptions(draft.spread_ok)}
            </select>
          </label>

          <label class="field">
            <span>premium_within_budget</span>
            <select name="premium_within_budget">
              ${renderTriStateOptions(draft.premium_within_budget)}
            </select>
          </label>

          <label class="field">
            <span>iv_event_heat_ok</span>
            <select name="iv_event_heat_ok">
              ${renderTriStateOptions(draft.iv_event_heat_ok)}
            </select>
          </label>

          <label class="field">
            <span>theme_cooldown_ok</span>
            <select name="theme_cooldown_ok">
              ${renderTriStateOptions(draft.theme_cooldown_ok)}
            </select>
          </label>

          <fieldset class="field field-wide">
            <legend>fail_reason_codes</legend>
            <div class="checkbox-grid">
              ${renderFailReasonOptions(draft.fail_reason_codes)}
            </div>
            <small class="field-hint">Leave empty when overall_gate is pass or unchecked.</small>
          </fieldset>

          <label class="field field-wide">
            <span>gate_note</span>
            <textarea name="gate_note" rows="3" placeholder="why the option check passed, failed, or stayed unchecked">${escapeHtml(draft.gate_note)}</textarea>
          </label>

          <label class="field field-wide">
            <span>reason_detail</span>
            <textarea name="reason_detail" rows="3" placeholder="optional detail attached to the status event">${escapeHtml(draft.reason_detail)}</textarea>
          </label>
        </div>

        <div class="form-actions">
          <button class="action primary" type="submit">Append Daily Review</button>
          <a class="action ghost" href="${cancelHref}">Cancel</a>
        </div>
      </form>
    </section>
  `;
}
