import {
  buildDecisionSummary,
  buildPriceFreshnessSummary,
  escapeHtml,
  formatBooleanCheck,
  formatCodeLabel,
  formatCodeList,
  formatGateStatus,
  formatList,
  formatMinuteGap,
  formatPhase,
  formatStatus,
  formatTimestamp,
  formatTriggerState
} from "../lib/formatters.js";
import { renderDailyReviewForm } from "./dailyReviewForm.js";
import { renderScenarioForm } from "./scenarioForm.js";

function renderSignals(signals) {
  if (!signals || signals.length === 0) {
    return '<span class="signal-pill">none</span>';
  }

  return signals.map((signal) => `<span class="signal-pill">${escapeHtml(signal)}</span>`).join("");
}

function renderPriceGate(priceGate) {
  if (!priceGate) {
    return `
      <div class="emphasis">
        <p class="panel-copy">No price gate has been checked for this scenario. The home card falls back to the policy label until a review adds one.</p>
      </div>
    `;
  }

  return `
    <div class="emphasis">
      <div class="kv-grid">
        <div class="kv-item"><dt>checked_at</dt><dd>${escapeHtml(formatTimestamp(priceGate.checked_at))}</dd></div>
        <div class="kv-item"><dt>overall_gate</dt><dd>${escapeHtml(formatGateStatus(priceGate.overall_gate))}</dd></div>
        <div class="kv-item"><dt>fail_reason_codes</dt><dd>${escapeHtml(formatCodeList(priceGate.fail_reason_codes))}</dd></div>
        <div class="kv-item"><dt>gate_note</dt><dd>${escapeHtml(formatCodeLabel(priceGate.gate_note))}</dd></div>
      </div>
      <div class="kv-grid">
        <div class="kv-item"><dt>expiry_bucket_ok</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.expiry_bucket_ok))}</dd></div>
        <div class="kv-item"><dt>spread_ok</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.spread_ok))}</dd></div>
        <div class="kv-item"><dt>premium_within_budget</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.premium_within_budget))}</dd></div>
        <div class="kv-item"><dt>iv_event_heat_ok</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.iv_event_heat_ok))}</dd></div>
        <div class="kv-item"><dt>theme_cooldown_ok</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.theme_cooldown_ok))}</dd></div>
      </div>
    </div>
  `;
}

function renderObservationTimeline(snapshots) {
  return snapshots.length > 0
    ? `
      <ul class="timeline">
        ${snapshots
          .map(
            (snapshot) => `
              <li>
                <div class="timeline-meta">
                  <span>${escapeHtml(formatTimestamp(snapshot.observed_at))}</span>
                  <span>${escapeHtml(formatPhase(snapshot.session_phase))}</span>
                  <span>${escapeHtml(formatTriggerState(snapshot.trigger_state))}</span>
                </div>
                <div class="pill-row">${renderSignals(snapshot.observed_signals)}</div>
                <div class="timeline-facts">
                  <div class="kv-item"><dt>event_risk</dt><dd>${escapeHtml(formatCodeLabel(snapshot.event_risk_today))}</dd></div>
                  <div class="kv-item"><dt>operator_action</dt><dd>${escapeHtml(formatCodeLabel(snapshot.operator_action))}</dd></div>
                  <div class="kv-item"><dt>source_refs</dt><dd>${escapeHtml(formatCodeList(snapshot.source_refs))}</dd></div>
                </div>
                <p class="timeline-note">${escapeHtml(formatCodeLabel(snapshot.market_note))}</p>
              </li>
            `
          )
          .join("")}
      </ul>
    `
    : '<p class="empty-state">No observations recorded yet.</p>';
}

function renderStatusHistory(statusEvents) {
  return statusEvents.length > 0
    ? `
      <ul class="status-history">
        ${statusEvents
          .map(
            (event) => `
              <li>
                <div class="history-meta">
                  <span>${escapeHtml(formatTimestamp(event.changed_at))}</span>
                  <span>${escapeHtml(formatStatus(event.from_status))} -> ${escapeHtml(formatStatus(event.to_status))}</span>
                </div>
                <p class="history-note">${escapeHtml(formatCodeLabel(event.reason_code))} / ${escapeHtml(formatCodeLabel(event.reason_detail))}</p>
              </li>
            `
          )
          .join("")}
      </ul>
    `
    : '<p class="empty-state">No status events recorded yet.</p>';
}

function renderMissingMessage() {
  return `
    <main class="detail-shell">
      <section class="panel detail-panel missing-message">
        <h1>Scenario not found</h1>
        <p class="panel-copy">Use the home screen to open an existing scenario detail, or start a new stable thesis record.</p>
        <div class="action-row centered-row">
          <a class="back-link" href="./index.html">Back Home</a>
          <a class="action primary" href="./detail.html?mode=new">New Scenario</a>
        </div>
      </section>
    </main>
  `;
}

function renderHeader({ detail, mode }) {
  if (mode === "new") {
    return `
      <section class="panel detail-header">
        <div class="detail-heading-row">
          <div class="detail-title">
            <a class="back-link" href="./index.html">Back Home</a>
            <p class="eyebrow">Scenario Form</p>
            <h1>Create Scenario</h1>
            <p>Stable thesis fields live here first. Daily review records stay append-only on the shared review surface.</p>
          </div>
          <div class="detail-actions">
            <a class="action ghost" href="./index.html">Cancel</a>
          </div>
        </div>
      </section>
    `;
  }

  if (mode === "review") {
    const cancelHref = `./detail.html?scenario=${encodeURIComponent(detail.scenario.scenario_id)}`;

    return `
      <section class="panel detail-header">
        <div class="detail-heading-row">
          <div class="detail-title">
            <a class="back-link" href="./index.html">Back Home</a>
            <p class="eyebrow">Daily Review</p>
            <h1>${escapeHtml(detail.scenario.scenario_id)}</h1>
            <p>Append a single review packet without mutating stable thesis fields.</p>
          </div>
          <div class="detail-actions">
            <a class="action ghost" href="${cancelHref}">Cancel</a>
          </div>
        </div>
        <div class="headline-meta">
          <span class="badge ${escapeHtml(detail.currentView.current_status)}">${escapeHtml(formatStatus(detail.currentView.current_status))}</span>
          <span class="timestamp">Next review ${escapeHtml(formatTimestamp(detail.currentView.next_review_at))}</span>
        </div>
      </section>
    `;
  }

  const editHref = `./detail.html?scenario=${encodeURIComponent(detail.scenario.scenario_id)}&mode=edit`;
  const reviewHref = `./detail.html?scenario=${encodeURIComponent(detail.scenario.scenario_id)}&mode=review`;
  const cancelHref = `./detail.html?scenario=${encodeURIComponent(detail.scenario.scenario_id)}`;
  const isEditMode = mode === "edit";

  return `
    <section class="panel detail-header">
      <div class="detail-heading-row">
        <div class="detail-title">
          <a class="back-link" href="./index.html">Back Home</a>
          <p class="eyebrow">${isEditMode ? "Scenario Edit" : "Scenario Detail"}</p>
          <h1>${escapeHtml(detail.scenario.scenario_id)}</h1>
          <p>${escapeHtml(
            isEditMode
              ? "Update stable thesis fields without touching review history."
              : detail.scenario.scenario_summary
          )}</p>
        </div>
        <div class="detail-actions">
          ${
            isEditMode
              ? `<a class="action ghost" href="${cancelHref}">Cancel</a>`
              : `
                <a class="action primary" href="${editHref}">Edit Scenario</a>
                <a class="action ghost" href="${reviewHref}">Add Daily Review</a>
              `
          }
        </div>
      </div>
      <div class="headline-meta">
        <span class="badge ${escapeHtml(detail.currentView.current_status)}">${escapeHtml(formatStatus(detail.currentView.current_status))}</span>
        <span class="timestamp">Next review ${escapeHtml(formatTimestamp(detail.currentView.next_review_at))}</span>
      </div>
    </section>
  `;
}

function renderScenarioSections(detail) {
  const latestPriceGate = detail.priceGates[0] ?? null;
  const decision = buildDecisionSummary(detail.currentView);

  return `
    <section class="panel detail-panel">
      <h2 class="section-title">Scenario Thesis</h2>
      <p class="section-copy">Stable fields stay separate from daily review records.</p>
      <div class="thesis-grid">
        <div class="kv-item"><dt>market</dt><dd>${escapeHtml(detail.scenario.market)}</dd></div>
        <div class="kv-item"><dt>direction</dt><dd>${escapeHtml(detail.scenario.direction)}</dd></div>
        <div class="kv-item"><dt>horizon_bucket</dt><dd>${escapeHtml(detail.scenario.horizon_bucket)}</dd></div>
        <div class="kv-item"><dt>entry_window</dt><dd>${escapeHtml(detail.scenario.entry_window)}</dd></div>
        <div class="kv-item"><dt>observation_trigger</dt><dd>${escapeHtml(detail.scenario.observation_trigger)}</dd></div>
        <div class="kv-item"><dt>flow_chain</dt><dd>${escapeHtml(detail.scenario.flow_chain)}</dd></div>
        <div class="kv-item"><dt>invalidation_rule</dt><dd>${escapeHtml(detail.scenario.invalidation_rule)}</dd></div>
        <div class="kv-item"><dt>review_cadence</dt><dd>${escapeHtml(formatList(detail.scenario.review_cadence))}</dd></div>
        <div class="kv-item"><dt>tags</dt><dd>${escapeHtml(formatList(detail.scenario.tags))}</dd></div>
        <div class="kv-item"><dt>notes</dt><dd>${escapeHtml(detail.scenario.notes || "none")}</dd></div>
      </div>
    </section>

    <section class="panel detail-panel">
      <h2 class="section-title">Current View</h2>
      <p class="section-copy">Latest decision context comes from the newest status event and the observation / gate records linked from it.</p>
      <div class="decision-block detail-decision-block">
        <p class="decision-kicker">${escapeHtml(decision.label)}</p>
        <p class="decision-line">${escapeHtml(decision.line)}</p>
        <p class="support-line">${escapeHtml(buildPriceFreshnessSummary(detail.currentView))}</p>
        <p class="support-line">Kill switch: ${escapeHtml(formatCodeLabel(detail.scenario.invalidation_rule))}</p>
      </div>
      <div class="current-grid">
        <div class="kv-item"><dt>decision_at</dt><dd>${escapeHtml(formatTimestamp(detail.currentView.decision_reference_at))}</dd></div>
        <div class="kv-item"><dt>linked_snapshot_at</dt><dd>${escapeHtml(formatTimestamp(detail.currentView.linked_snapshot_at))}</dd></div>
        <div class="kv-item"><dt>snapshot_gap</dt><dd>${escapeHtml(formatMinuteGap(detail.currentView.snapshot_decision_gap_minutes))}</dd></div>
        <div class="kv-item"><dt>trigger_state</dt><dd>${escapeHtml(formatTriggerState(detail.currentView.linked_trigger_state))}</dd></div>
        <div class="kv-item"><dt>observed_signals</dt><dd>${escapeHtml(formatCodeList(detail.currentView.linked_observed_signals))}</dd></div>
        <div class="kv-item"><dt>event_risk_today</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_event_risk_today))}</dd></div>
        <div class="kv-item"><dt>operator_action</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_operator_action))}</dd></div>
        <div class="kv-item"><dt>source_refs</dt><dd>${escapeHtml(formatCodeList(detail.currentView.linked_source_refs))}</dd></div>
        <div class="kv-item"><dt>linked_gate_at</dt><dd>${escapeHtml(formatTimestamp(detail.currentView.linked_gate_checked_at))}</dd></div>
        <div class="kv-item"><dt>gate_gap</dt><dd>${escapeHtml(formatMinuteGap(detail.currentView.gate_decision_gap_minutes))}</dd></div>
        <div class="kv-item"><dt>linked_price_gate</dt><dd>${escapeHtml(formatGateStatus(detail.currentView.linked_price_gate))}</dd></div>
        <div class="kv-item"><dt>fail_reasons</dt><dd>${escapeHtml(formatCodeList(detail.currentView.linked_fail_reason_codes))}</dd></div>
        <div class="kv-item"><dt>latest_reason_code</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.latest_reason_code))}</dd></div>
        <div class="kv-item"><dt>latest_reason_detail</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.latest_reason_detail))}</dd></div>
        <div class="kv-item"><dt>next_review_phase</dt><dd>${escapeHtml(formatPhase(detail.currentView.next_review_phase))}</dd></div>
        <div class="kv-item"><dt>linked_gate_note</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_gate_note))}</dd></div>
        <div class="kv-item"><dt>market_note</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_market_note))}</dd></div>
      </div>
    </section>

    <section class="detail-grid">
      <section class="panel detail-panel muted">
        <h2 class="section-title">Observation Timeline</h2>
        <p class="section-copy">Latest snapshots first so the present thesis state is visible at a glance.</p>
        ${renderObservationTimeline(detail.snapshots)}
      </section>

      <section class="panel detail-panel muted">
        <h2 class="section-title">Price Gate</h2>
        <p class="section-copy">The latest gate stays isolated from the thesis so rejected and invalidated cases do not blur together.</p>
        ${renderPriceGate(latestPriceGate)}
      </section>
    </section>

    <section class="panel detail-panel">
      <h2 class="section-title">Status History</h2>
      <p class="section-copy">Reason codes stay explicit so price gate failures never look like thesis breakage.</p>
      ${renderStatusHistory(detail.statusEvents)}
    </section>
  `;
}

export function renderDetailPage({ detail, mode, draft, errors }) {
  if (!detail && mode !== "new") {
    return renderMissingMessage();
  }

  const formMarkup =
    mode === "new" || mode === "edit"
      ? renderScenarioForm({
          draft,
          errors,
          mode,
          cancelHref:
            mode === "edit" && detail
              ? `./detail.html?scenario=${encodeURIComponent(detail.scenario.scenario_id)}`
              : "./index.html"
        })
      : mode === "review" && detail
        ? renderDailyReviewForm({
            draft,
            errors,
            cancelHref: `./detail.html?scenario=${encodeURIComponent(detail.scenario.scenario_id)}`
          })
      : "";

  return `
    <main class="detail-shell">
      ${renderHeader({ detail, mode })}
      ${formMarkup}
      ${detail ? renderScenarioSections(detail) : ""}
    </main>
  `;
}
