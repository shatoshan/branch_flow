import {
  escapeHtml,
  formatGateStatus,
  formatList,
  formatPhase,
  formatStatus,
  formatTimestamp,
  formatTriggerState
} from "../lib/formatters.js";

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
        <div class="kv-item"><dt>fail_reason_codes</dt><dd>${escapeHtml(formatList(priceGate.fail_reason_codes))}</dd></div>
        <div class="kv-item"><dt>gate_note</dt><dd>${escapeHtml(priceGate.gate_note)}</dd></div>
      </div>
      <div class="kv-grid">
        <div class="kv-item"><dt>expiry_bucket_ok</dt><dd>${String(priceGate.expiry_bucket_ok)}</dd></div>
        <div class="kv-item"><dt>spread_ok</dt><dd>${String(priceGate.spread_ok)}</dd></div>
        <div class="kv-item"><dt>premium_within_budget</dt><dd>${String(priceGate.premium_within_budget)}</dd></div>
        <div class="kv-item"><dt>iv_event_heat_ok</dt><dd>${String(priceGate.iv_event_heat_ok)}</dd></div>
        <div class="kv-item"><dt>theme_cooldown_ok</dt><dd>${String(priceGate.theme_cooldown_ok)}</dd></div>
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
                <p class="timeline-note">${escapeHtml(snapshot.market_note)}</p>
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
                <p class="history-note">${escapeHtml(event.reason_code)} / ${escapeHtml(event.reason_detail || "none")}</p>
              </li>
            `
          )
          .join("")}
      </ul>
    `
    : '<p class="empty-state">No status events recorded yet.</p>';
}

export function renderDetailPage(detail) {
  if (!detail) {
    return `
      <main class="detail-shell">
        <section class="panel detail-panel missing-message">
          <h1>Scenario not found</h1>
          <p class="panel-copy">Use the home screen to open an existing scenario detail.</p>
          <a class="back-link" href="./index.html">Back Home</a>
        </section>
      </main>
    `;
  }

  const latestPriceGate = detail.priceGates[0] ?? null;

  return `
    <main class="detail-shell">
      <section class="panel detail-header">
        <div class="detail-heading-row">
          <div class="detail-title">
            <a class="back-link" href="./index.html">Back Home</a>
            <p class="eyebrow">Scenario Detail</p>
            <h1>${escapeHtml(detail.scenario.scenario_id)}</h1>
            <p>${escapeHtml(detail.scenario.scenario_summary)}</p>
          </div>
          <div class="detail-actions">
            <a class="action primary" href="./index.html#entry-surfaces">Edit Scenario</a>
            <a class="action ghost" href="./index.html#entry-surfaces">Add Daily Review</a>
          </div>
        </div>
        <div class="headline-meta">
          <span class="badge ${escapeHtml(detail.currentView.current_status)}">${escapeHtml(formatStatus(detail.currentView.current_status))}</span>
          <span class="timestamp">Next review ${escapeHtml(formatTimestamp(detail.currentView.next_review_at))}</span>
        </div>
      </section>

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
        </div>
      </section>

      <section class="panel detail-panel">
        <h2 class="section-title">Current View</h2>
        <p class="section-copy">Derived fields come from the latest status event, observation snapshot, and price gate.</p>
        <div class="current-grid">
          <div class="kv-item"><dt>latest_snapshot_at</dt><dd>${escapeHtml(formatTimestamp(detail.currentView.latest_snapshot_at))}</dd></div>
          <div class="kv-item"><dt>trigger_state</dt><dd>${escapeHtml(formatTriggerState(detail.currentView.latest_trigger_state))}</dd></div>
          <div class="kv-item"><dt>latest_price_gate</dt><dd>${escapeHtml(formatGateStatus(detail.currentView.latest_price_gate))}</dd></div>
          <div class="kv-item"><dt>latest_reason_code</dt><dd>${escapeHtml(detail.currentView.latest_reason_code)}</dd></div>
          <div class="kv-item"><dt>latest_reason_detail</dt><dd>${escapeHtml(detail.currentView.latest_reason_detail || "none")}</dd></div>
          <div class="kv-item"><dt>next_review_phase</dt><dd>${escapeHtml(formatPhase(detail.currentView.next_review_phase))}</dd></div>
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
    </main>
  `;
}
