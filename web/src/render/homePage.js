import {
  buildDecisionSummary,
  buildPriceFreshnessSummary,
  escapeHtml,
  formatCodeLabel,
  formatCodeList,
  formatStatus,
  formatTimestamp,
  isSameTokyoDay
} from "../lib/formatters.js";

const statusOrder = ["watch", "eligible", "rejected", "invalidated"];

function groupByStatus(views) {
  return Object.fromEntries(statusOrder.map((status) => [status, views.filter((view) => view.current_status === status)]));
}

function buildReviewHref(scenarioId) {
  return `./detail.html?scenario=${encodeURIComponent(scenarioId)}&mode=review`;
}

function renderCard(view) {
  const decision = buildDecisionSummary(view);
  const evidenceLine = view.linked_snapshot_id
    ? `Observed ${formatCodeList(view.linked_observed_signals)} | Sources ${formatCodeList(view.linked_source_refs)}`
    : "Observed none | Sources none";

  return `
    <article class="scenario-card ${escapeHtml(view.current_status)}">
      <div class="card-title-row">
        <div>
          <p class="card-id">${escapeHtml(view.scenario_id)}</p>
          <div class="headline-meta">
            <span class="badge ${escapeHtml(view.current_status)}">${escapeHtml(formatStatus(view.current_status))}</span>
          </div>
        </div>
        ${view.is_review_due ? '<span class="due-chip">due now</span>' : ""}
      </div>
      <div class="decision-block">
        <p class="decision-kicker">${escapeHtml(decision.label)}</p>
        <p class="decision-line">${escapeHtml(decision.compact)}</p>
        <p class="support-line">${escapeHtml(evidenceLine)}</p>
        <p class="support-line">${escapeHtml(buildPriceFreshnessSummary(view))}</p>
      </div>
      <dl class="kv-list">
        <div class="kv-item"><dt>market</dt><dd>${escapeHtml(view.market)}</dd></div>
        <div class="kv-item"><dt>direction</dt><dd>${escapeHtml(view.direction)}</dd></div>
        <div class="kv-item"><dt>horizon</dt><dd>${escapeHtml(view.horizon_bucket)}</dd></div>
        <div class="kv-item"><dt>trigger</dt><dd>${escapeHtml(view.observation_trigger)}</dd></div>
        <div class="kv-item"><dt>flow</dt><dd>${escapeHtml(view.flow_chain)}</dd></div>
        <div class="kv-item"><dt>price</dt><dd>${escapeHtml(view.card_price_gate_summary)}</dd></div>
        <div class="kv-item"><dt>invalidation</dt><dd>${escapeHtml(view.invalidation_rule)}</dd></div>
        <div class="kv-item"><dt>next_review</dt><dd>${escapeHtml(formatTimestamp(view.next_review_at))}</dd></div>
        <div class="kv-item"><dt>event_risk</dt><dd>${escapeHtml(formatCodeLabel(view.linked_event_risk_today))}</dd></div>
      </dl>
      <div class="card-actions">
        <a class="card-link" href="./detail.html?scenario=${encodeURIComponent(view.scenario_id)}">Open Detail</a>
        <a class="card-link subtle" href="${buildReviewHref(view.scenario_id)}">Add Review</a>
      </div>
    </article>
  `;
}

function renderStatusColumn(status, views) {
  const cards = views.length > 0 ? views.map((view) => renderCard(view)).join("") : '<p class="empty-state">No scenarios in this status.</p>';

  return `
    <section class="panel status-column ${escapeHtml(status)}">
      <div class="status-heading">
        <h2>${escapeHtml(formatStatus(status))}</h2>
        <span class="status-count">${views.length}</span>
      </div>
      ${cards}
    </section>
  `;
}

export function renderHomePage({ views, asOf, dueOnly }) {
  const filteredViews = dueOnly ? views.filter((view) => view.is_review_due) : views;
  const grouped = groupByStatus(filteredViews);
  const firstReviewTarget = views.find((view) => view.is_review_due) ?? views[0] ?? null;
  const dailyReviewHref = firstReviewTarget ? buildReviewHref(firstReviewTarget.scenario_id) : "./index.html#entry-surfaces";

  const dueNow = views.filter((view) => view.is_review_due).length;
  const upcoming = views.filter((view) => view.next_review_at && !view.is_review_due).length;
  const noTradeToday = views.filter(
    (view) => view.current_status === "rejected" && isSameTokyoDay(view.latest_status_changed_at, asOf)
  ).length;
  const invalidatedTotal = views.filter((view) => view.current_status === "invalidated").length;

  return `
    <main class="shell">
      <section class="panel hero">
        <div class="hero-top">
          <div>
            <p class="eyebrow">BranchFlow Prototype</p>
            <h1>Conditional option-buying terminal</h1>
            <p>Forecasts are out of scope. Home cards now surface why now / why not now, linked observation evidence, and whether the latest price check is still fresh enough to trust.</p>
          </div>
          <div class="timestamp">As of ${escapeHtml(formatTimestamp(asOf))}</div>
        </div>
      </section>

      <section class="panel toolbar">
        <div class="toolbar-row">
          <div class="action-row">
            <a class="action primary" href="./detail.html?mode=new">New Scenario</a>
            <a class="action ghost" href="${dailyReviewHref}">Daily Review</a>
          </div>
          <div class="action-row">
            <button class="filter-button ${dueOnly ? "active" : ""}" type="button" data-filter="due">Only Due Now</button>
            <button class="filter-button ${dueOnly ? "" : "active"}" type="button" data-filter="all">All Scenarios</button>
          </div>
        </div>
        <div class="metric-grid">
          <div class="metric-card"><span>Due Now</span><strong>${dueNow}</strong></div>
          <div class="metric-card"><span>Upcoming</span><strong>${upcoming}</strong></div>
          <div class="metric-card"><span>No Trade Today</span><strong>${noTradeToday}</strong></div>
          <div class="metric-card"><span>Invalidated Total</span><strong>${invalidatedTotal}</strong></div>
        </div>
      </section>

      <section class="status-grid">
        ${statusOrder.map((status) => renderStatusColumn(status, grouped[status] ?? [])).join("")}
      </section>

      <section id="entry-surfaces" class="entry-grid">
        <section class="panel entry-panel">
          <h2 class="section-title">Scenario Form</h2>
          <p class="section-copy">Live now: detail.html owns stable thesis create/edit, backed by a shared browser record store.</p>
          <ul class="summary-list">
            <li><strong>Saved fields:</strong> market, direction, summary, horizon, trigger, flow, invalidation, cadence, tags, notes</li>
            <li><strong>Open path:</strong> New Scenario on home, Edit Scenario on detail</li>
            <li><strong>Persistence:</strong> localStorage snapshot shared across home/detail</li>
          </ul>
        </section>

        <section class="panel entry-panel">
          <h2 class="section-title">Daily Review Append</h2>
          <p class="section-copy">Live now: each submit appends observation, gate, and status records together while keeping rejected vs invalidated reasons separable.</p>
          <ul class="summary-list">
            <li><strong>Observation:</strong> snapshot, session phase, trigger state, observed signals</li>
            <li><strong>Price gate:</strong> overall gate, fail reason codes, budget / IV checks</li>
            <li><strong>Status event:</strong> from, to, reason_code, next_review_phase, next_review_at</li>
          </ul>
        </section>
      </section>
    </main>
  `;
}
