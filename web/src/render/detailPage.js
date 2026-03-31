import {
  buildDecisionSummary,
  buildPriceFreshnessSummary,
  escapeHtml,
  formatBooleanCheck,
  formatCodeLabel,
  formatCodeList,
  formatFieldLabel,
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
    return '<span class="signal-pill">なし</span>';
  }

  return signals.map((signal) => `<span class="signal-pill">${escapeHtml(formatCodeLabel(signal))}</span>`).join("");
}

function renderPriceGate(priceGate) {
  if (!priceGate) {
    return `
      <div class="emphasis">
        <p class="panel-copy">このシナリオではまだ価格確認がありません。レビューが追加されるまでは、一覧カードでは方針ラベルを表示します。</p>
      </div>
    `;
  }

  return `
    <div class="emphasis">
      <div class="kv-grid">
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("checked_at"))}</dt><dd>${escapeHtml(formatTimestamp(priceGate.checked_at))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("overall_gate"))}</dt><dd>${escapeHtml(formatGateStatus(priceGate.overall_gate))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("fail_reason_codes"))}</dt><dd>${escapeHtml(formatCodeList(priceGate.fail_reason_codes))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("gate_note"))}</dt><dd>${escapeHtml(formatCodeLabel(priceGate.gate_note))}</dd></div>
      </div>
      <div class="kv-grid">
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("expiry_bucket_ok"))}</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.expiry_bucket_ok))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("spread_ok"))}</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.spread_ok))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("premium_within_budget"))}</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.premium_within_budget))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("iv_event_heat_ok"))}</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.iv_event_heat_ok))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("theme_cooldown_ok"))}</dt><dd>${escapeHtml(formatBooleanCheck(priceGate.theme_cooldown_ok))}</dd></div>
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
                  <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("event_risk_today"))}</dt><dd>${escapeHtml(formatCodeLabel(snapshot.event_risk_today))}</dd></div>
                  <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("operator_action"))}</dt><dd>${escapeHtml(formatCodeLabel(snapshot.operator_action))}</dd></div>
                  <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("source_refs"))}</dt><dd>${escapeHtml(formatCodeList(snapshot.source_refs))}</dd></div>
                </div>
                <p class="timeline-note">${escapeHtml(formatCodeLabel(snapshot.market_note))}</p>
              </li>
            `
          )
          .join("")}
      </ul>
    `
    : '<p class="empty-state">まだ観測は記録されていません。</p>';
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
    : '<p class="empty-state">まだ状態変更は記録されていません。</p>';
}

function renderMissingMessage() {
  return `
    <main class="detail-shell">
      <section class="panel detail-panel missing-message">
        <h1>シナリオが見つかりません</h1>
        <p class="panel-copy">ホームから既存シナリオを開くか、新規シナリオを作成してください。</p>
        <div class="action-row centered-row">
          <a class="back-link" href="./index.html">ホームへ</a>
          <a class="action primary" href="./detail.html?mode=new">新規シナリオ</a>
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
            <a class="back-link" href="./index.html">ホームへ</a>
            <p class="eyebrow">シナリオ登録</p>
            <h1>新規シナリオ</h1>
            <p>まずは固定的な仮説項目をここで登録します。日次レビュー履歴は別の追記専用画面に残ります。</p>
          </div>
          <div class="detail-actions">
            <a class="action ghost" href="./index.html">キャンセル</a>
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
            <a class="back-link" href="./index.html">ホームへ</a>
            <p class="eyebrow">日次レビュー</p>
            <h1>${escapeHtml(detail.scenario.scenario_id)}</h1>
            <p>固定的な仮説項目を変えずに、1件のレビュー記録を追記します。</p>
          </div>
          <div class="detail-actions">
            <a class="action ghost" href="${cancelHref}">キャンセル</a>
          </div>
        </div>
        <div class="headline-meta">
          <span class="badge ${escapeHtml(detail.currentView.current_status)}">${escapeHtml(formatStatus(detail.currentView.current_status))}</span>
          <span class="timestamp">次回確認 ${escapeHtml(formatTimestamp(detail.currentView.next_review_at))}</span>
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
          <a class="back-link" href="./index.html">ホームへ</a>
          <p class="eyebrow">${isEditMode ? "シナリオ編集" : "シナリオ詳細"}</p>
          <h1>${escapeHtml(detail.scenario.scenario_id)}</h1>
          <p>${escapeHtml(
            isEditMode
              ? "レビュー履歴には触れず、固定的な仮説項目だけを更新します。"
              : formatCodeLabel(detail.scenario.scenario_summary)
          )}</p>
        </div>
        <div class="detail-actions">
          ${
            isEditMode
              ? `<a class="action ghost" href="${cancelHref}">キャンセル</a>`
              : `
                <a class="action primary" href="${editHref}">シナリオ編集</a>
                <a class="action ghost" href="${reviewHref}">レビュー追加</a>
              `
          }
        </div>
      </div>
      <div class="headline-meta">
        <span class="badge ${escapeHtml(detail.currentView.current_status)}">${escapeHtml(formatStatus(detail.currentView.current_status))}</span>
        <span class="timestamp">次回確認 ${escapeHtml(formatTimestamp(detail.currentView.next_review_at))}</span>
      </div>
    </section>
  `;
}

function renderScenarioSections(detail) {
  const latestPriceGate = detail.priceGates[0] ?? null;
  const decision = buildDecisionSummary(detail.currentView);

  return `
    <section class="panel detail-panel">
      <h2 class="section-title">シナリオ仮説</h2>
      <p class="section-copy">固定的な仮説項目は、日次レビュー履歴とは分けて管理します。</p>
      <div class="thesis-grid">
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("market"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.market))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("direction"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.direction))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("horizon_bucket"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.horizon_bucket))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("entry_window"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.entry_window))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("observation_trigger"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.observation_trigger))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("flow_chain"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.flow_chain))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("invalidation_rule"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.invalidation_rule))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("review_cadence"))}</dt><dd>${escapeHtml(formatList(detail.scenario.review_cadence, formatPhase))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("tags"))}</dt><dd>${escapeHtml(formatList(detail.scenario.tags, formatCodeLabel))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("notes"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.scenario.notes))}</dd></div>
      </div>
    </section>

    <section class="panel detail-panel">
      <h2 class="section-title">現在の見立て</h2>
      <p class="section-copy">最新の状態変更に紐づく観測と価格条件から、現在の判断文脈を読めるようにします。</p>
      <div class="decision-block detail-decision-block">
        <p class="decision-kicker">${escapeHtml(decision.label)}</p>
        <p class="decision-line">${escapeHtml(decision.line)}</p>
        <p class="support-line">${escapeHtml(buildPriceFreshnessSummary(detail.currentView))}</p>
        <p class="support-line">失効条件: ${escapeHtml(formatCodeLabel(detail.scenario.invalidation_rule))}</p>
      </div>
      <div class="current-grid">
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("decision_at"))}</dt><dd>${escapeHtml(formatTimestamp(detail.currentView.decision_reference_at))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("linked_snapshot_at"))}</dt><dd>${escapeHtml(formatTimestamp(detail.currentView.linked_snapshot_at))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("snapshot_gap"))}</dt><dd>${escapeHtml(formatMinuteGap(detail.currentView.snapshot_decision_gap_minutes))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("trigger_state"))}</dt><dd>${escapeHtml(formatTriggerState(detail.currentView.linked_trigger_state))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("observed_signals"))}</dt><dd>${escapeHtml(formatCodeList(detail.currentView.linked_observed_signals))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("event_risk_today"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_event_risk_today))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("operator_action"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_operator_action))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("source_refs"))}</dt><dd>${escapeHtml(formatCodeList(detail.currentView.linked_source_refs))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("linked_gate_at"))}</dt><dd>${escapeHtml(formatTimestamp(detail.currentView.linked_gate_checked_at))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("gate_gap"))}</dt><dd>${escapeHtml(formatMinuteGap(detail.currentView.gate_decision_gap_minutes))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("linked_price_gate"))}</dt><dd>${escapeHtml(formatGateStatus(detail.currentView.linked_price_gate))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("fail_reasons"))}</dt><dd>${escapeHtml(formatCodeList(detail.currentView.linked_fail_reason_codes))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("latest_reason_code"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.latest_reason_code))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("latest_reason_detail"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.latest_reason_detail))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("next_review_phase"))}</dt><dd>${escapeHtml(formatPhase(detail.currentView.next_review_phase))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("linked_gate_note"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_gate_note))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("market_note"))}</dt><dd>${escapeHtml(formatCodeLabel(detail.currentView.linked_market_note))}</dd></div>
      </div>
    </section>

    <section class="detail-grid">
      <section class="panel detail-panel muted">
        <h2 class="section-title">観測タイムライン</h2>
        <p class="section-copy">最新の観測を先頭に並べ、現在の仮説状態を一瞥で追えるようにします。</p>
        ${renderObservationTimeline(detail.snapshots)}
      </section>

      <section class="panel detail-panel muted">
        <h2 class="section-title">価格条件</h2>
        <p class="section-copy">最新の価格判定を仮説本体と分けて表示し、見送りと失効の意味が混ざらないようにします。</p>
        ${renderPriceGate(latestPriceGate)}
      </section>
    </section>

    <section class="panel detail-panel">
      <h2 class="section-title">状態履歴</h2>
      <p class="section-copy">理由コードを明示し、価格条件不通過と仮説失効が混ざらないようにします。</p>
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
