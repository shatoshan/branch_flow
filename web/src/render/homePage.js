import {
  buildDecisionSummary,
  buildPriceFreshnessSummary,
  escapeHtml,
  formatCodeLabel,
  formatCodeList,
  formatFieldLabel,
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
    ? `観測: ${formatCodeList(view.linked_observed_signals)} / 参照: ${formatCodeList(view.linked_source_refs)}`
    : "観測: なし / 参照: なし";

  return `
    <article class="scenario-card ${escapeHtml(view.current_status)}">
      <div class="card-title-row">
        <div>
          <p class="card-id">${escapeHtml(view.scenario_id)}</p>
          <div class="headline-meta">
            <span class="badge ${escapeHtml(view.current_status)}">${escapeHtml(formatStatus(view.current_status))}</span>
          </div>
        </div>
        ${view.is_review_due ? '<span class="due-chip">要確認</span>' : ""}
      </div>
      <div class="decision-block">
        <p class="decision-kicker">${escapeHtml(decision.label)}</p>
        <p class="decision-line">${escapeHtml(decision.compact)}</p>
        <p class="support-line">${escapeHtml(evidenceLine)}</p>
        <p class="support-line">${escapeHtml(buildPriceFreshnessSummary(view))}</p>
      </div>
      <dl class="kv-list">
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("market"))}</dt><dd>${escapeHtml(formatCodeLabel(view.market))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("direction"))}</dt><dd>${escapeHtml(formatCodeLabel(view.direction))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("horizon"))}</dt><dd>${escapeHtml(formatCodeLabel(view.horizon_bucket))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("trigger"))}</dt><dd>${escapeHtml(formatCodeLabel(view.observation_trigger))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("flow"))}</dt><dd>${escapeHtml(formatCodeLabel(view.flow_chain))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("price"))}</dt><dd>${escapeHtml(view.card_price_gate_summary)}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("invalidation"))}</dt><dd>${escapeHtml(formatCodeLabel(view.invalidation_rule))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("next_review"))}</dt><dd>${escapeHtml(formatTimestamp(view.next_review_at))}</dd></div>
        <div class="kv-item"><dt>${escapeHtml(formatFieldLabel("event_risk"))}</dt><dd>${escapeHtml(formatCodeLabel(view.linked_event_risk_today))}</dd></div>
      </dl>
      <div class="card-actions">
        <a class="card-link" href="./detail.html?scenario=${encodeURIComponent(view.scenario_id)}">詳細を見る</a>
        <a class="card-link subtle" href="${buildReviewHref(view.scenario_id)}">レビュー追加</a>
      </div>
    </article>
  `;
}

function renderStatusColumn(status, views) {
  const cards = views.length > 0 ? views.map((view) => renderCard(view)).join("") : '<p class="empty-state">この状態のシナリオはありません。</p>';

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
            <p class="eyebrow">BranchFlow 試作</p>
            <h1>条件付きオプション買い端末</h1>
            <p>予測は対象外です。ホームカードでは、候補化理由、監視継続や見送りの理由、紐づく観測根拠、価格チェックの鮮度を一目で確認できます。</p>
          </div>
          <div class="timestamp">${escapeHtml(formatTimestamp(asOf))} 時点</div>
        </div>
      </section>

      <section class="panel toolbar">
        <div class="toolbar-row">
          <div class="action-row">
            <a class="action primary" href="./detail.html?mode=new">新規シナリオ</a>
            <a class="action ghost" href="${dailyReviewHref}">日次レビュー</a>
          </div>
          <div class="action-row">
            <button class="filter-button ${dueOnly ? "active" : ""}" type="button" data-filter="due">要確認のみ</button>
            <button class="filter-button ${dueOnly ? "" : "active"}" type="button" data-filter="all">全シナリオ</button>
          </div>
        </div>
        <div class="metric-grid">
          <div class="metric-card"><span>要確認</span><strong>${dueNow}</strong></div>
          <div class="metric-card"><span>予定あり</span><strong>${upcoming}</strong></div>
          <div class="metric-card"><span>本日見送り</span><strong>${noTradeToday}</strong></div>
          <div class="metric-card"><span>累計失効</span><strong>${invalidatedTotal}</strong></div>
        </div>
      </section>

      <section class="status-grid">
        ${statusOrder.map((status) => renderStatusColumn(status, grouped[status] ?? [])).join("")}
      </section>

      <section id="entry-surfaces" class="entry-grid">
        <section class="panel entry-panel">
          <h2 class="section-title">シナリオ登録</h2>
          <p class="section-copy">詳細画面から、固定的な仮説項目をブラウザ保存領域へ記録できます。</p>
          <ul class="summary-list">
            <li><strong>保存項目:</strong> 市場、方向、要約、監視期間、トリガー、展開連鎖、失効条件、見直し頻度、タグ、メモ</li>
            <li><strong>導線:</strong> home の「新規シナリオ」、detail の「シナリオ編集」</li>
            <li><strong>保存先:</strong> home/detail で共有されるブラウザ保存スナップショット</li>
          </ul>
        </section>

        <section class="panel entry-panel">
          <h2 class="section-title">日次レビュー追記</h2>
          <p class="section-copy">1回の送信で観測、価格条件、状態変更をまとめて追記し、見送りと失効の理由を分けて残せます。</p>
          <ul class="summary-list">
            <li><strong>観測:</strong> 観測時刻、確認フェーズ、トリガー状態、観測シグナル</li>
            <li><strong>価格条件:</strong> 総合判定、不通過理由、予算 / IV / スプレッド確認</li>
            <li><strong>状態変更:</strong> 開始状態、更新後状態、理由コード、次回確認フェーズ、次回確認時刻</li>
          </ul>
        </section>
      </section>
    </main>
  `;
}
