const unsetLabel = "未設定";
const emptyLabel = "なし";

const statusLabels = {
  watch: "監視",
  eligible: "候補",
  rejected: "見送り",
  invalidated: "失効"
};

const phaseLabels = {
  morning: "朝",
  intraday: "場中",
  after_close: "引け後",
  weekly: "週次"
};

const triggerLabels = {
  partial: "一部成立",
  confirmed: "確認済み",
  invalidated: "失効接触"
};

const gateLabels = {
  pass: "通過",
  fail: "不通過",
  unchecked: "未確認"
};

const fieldLabels = {
  scenario_id: "シナリオID",
  market: "市場",
  direction: "方向",
  scenario_summary: "シナリオ要約",
  horizon_bucket: "監視期間",
  entry_window: "仕掛け期間",
  observation_trigger: "観測トリガー",
  flow_chain: "展開連鎖",
  price_gate_policy: "価格ガード方針",
  invalidation_rule: "失効条件",
  review_cadence: "見直し頻度",
  tags: "タグ",
  notes: "メモ",
  from_status: "開始状態",
  observed_at: "観測時刻",
  session_phase: "確認フェーズ",
  trigger_state: "トリガー状態",
  observed_signals: "観測シグナル",
  event_risk_today: "当日イベント",
  market_note: "市況メモ",
  operator_action: "オペレーター判断",
  source_refs: "参照ソース",
  checked_at: "価格確認時刻",
  expiry_bucket_ok: "期限条件",
  spread_ok: "スプレッド",
  premium_within_budget: "予算内",
  iv_event_heat_ok: "IV過熱",
  theme_cooldown_ok: "テーマ間隔",
  overall_gate: "総合判定",
  fail_reason_codes: "不通過理由",
  gate_note: "価格メモ",
  changed_at: "状態更新時刻",
  to_status: "更新後状態",
  reason_code: "理由コード",
  reason_detail: "理由補足",
  next_review_phase: "次回確認フェーズ",
  next_review_at: "次回確認時刻",
  horizon: "監視期間",
  trigger: "観測トリガー",
  flow: "展開連鎖",
  price: "価格条件",
  invalidation: "失効条件",
  next_review: "次回確認",
  event_risk: "当日イベント",
  decision_at: "判断時刻",
  linked_snapshot_at: "参照観測時刻",
  snapshot_gap: "観測との時差",
  linked_gate_at: "参照価格時刻",
  gate_gap: "価格との時差",
  linked_price_gate: "参照価格判定",
  fail_reasons: "不通過理由",
  latest_reason_code: "最新理由",
  latest_reason_detail: "最新補足",
  linked_gate_note: "参照価格メモ"
};

const codeLabels = {
  nikkei225: "日経225",
  downside: "下落",
  upside: "上昇",
  "1d_2w": "1日-2週",
  same_day: "当日",
  same_week: "同週",
  next_3_sessions: "次の3セッション",
  next_5_sessions: "次の5セッション",
  standard_min_gate: "標準価格ガード",
  event_guarded_gate: "イベント警戒ガード",
  seed_status: "初期状態",
  trigger_pending: "トリガー待ち",
  trigger_confirmed: "トリガー確認",
  price_gate_pass: "価格条件通過",
  price_gate_fail: "価格条件不通過",
  thesis_broken: "仮説失効",
  time_expired: "時間切れ",
  manual_archive: "手動アーカイブ",
  expiry_too_short: "期限が短い",
  spread_too_wide: "スプレッドが広い",
  premium_over_budget: "プレミアムが予算超過",
  iv_event_hot: "IVが過熱",
  theme_cooldown: "テーマ間隔不足",
  trigger_confirmed_and_gate_passed: "トリガー確認と価格条件通過が揃った",
  pressure_remains_but_not_clean_enough_to_promote: "下押しは残るが候補化には不十分",
  iv_event_hot_and_spread_too_wide: "IV過熱とスプレッド拡大",
  support_recovered_and_breadth_turned: "サポート回復と内部改善",
  target_put_premium_exceeded_daily_loss_budget: "プットプレミアムが日次損失予算を超過",
  near_term_puts_remained_inside_daily_risk_budget: "近期限プットは日次リスク予算内",
  event_premium_spike_removed_edge_from_downside_hedge: "イベント前のプレミアム上昇で優位性が消失",
  none_major_before_open: "大きな予定なし（寄り前）",
  us_data_later: "米指標あり（後半）",
  us_data_pending: "米指標待ち",
  none_major: "大きな予定なし",
  scheduled_us_macro_event: "予定済み米マクロイベント",
  keep_watch: "監視継続",
  check_price_gate: "価格確認",
  reset_to_watch: "監視へ戻す",
  stay_alert: "警戒継続",
  promote_eligible: "候補化",
  keep_rejected: "見送り継続",
  watch_for_invalidation: "失効警戒",
  invalidate: "失効",
  futures_board: "先物ボード",
  fx_board: "FXボード",
  rates_dashboard: "金利ダッシュボード",
  breadth_sheet: "騰落シート",
  nky_futures: "日経先物",
  cash_close: "現物引け",
  cash_open: "現物寄り",
  cash_chart: "現物チャート",
  vol_board: "ボラボード",
  macro_calendar: "マクロカレンダー",
  options_chain: "オプションチェーン",
  us10y_up: "米10年金利上昇",
  usd_jpy_down: "ドル円下落",
  nky_futures_soft: "日経先物軟調",
  usd_jpy_break: "ドル円下抜け",
  exporters_weak: "輸出株軟調",
  breadth_soft: "騰落軟化",
  close_above_low: "安値引け回避",
  pressure_remains: "下押し継続",
  yen_firm: "円高維持",
  gap_down_open: "ギャップダウン寄り",
  risk_off_breadth: "リスクオフ主導",
  weak_opening_bid: "寄り後の買い弱い",
  first_hour_reclaim_failed: "初動リクレイム失敗",
  futures_sell_programs: "先物売りプログラム",
  banks_weak: "銀行株軟調",
  event_calendar_dense: "イベント日程密集",
  put_skew_up: "プットスキュー上昇",
  term_structure_firm: "期間構造高止まり",
  spread_widening: "スプレッド拡大",
  iv_jump: "IV急騰",
  headline_risk_unchanged: "ヘッドライン不安継続",
  prior_support_break: "既存サポート割れ",
  breadth_deteriorates: "騰落悪化",
  buyers_absent: "買い手不在",
  support_recovers: "サポート回復",
  breadth_turns: "騰落改善",
  sellers_stall: "売り鈍化",
  overnight_rates_repricing_persisted: "寄り前も金利再評価が継続",
  cash_market_failed_to_reclaim_opening_gap: "現物は寄りギャップを埋め戻せず",
  sell_pressure_remained_but_no_clean_close_break: "下押しは残るが引けの明確な崩れなし",
  open_failed_to_fill_gap_in_first_minutes: "寄り直後もギャップを埋められず",
  rebound_attempt_stalled_under_prior_range: "戻りは前日レンジ下で失速",
  hedge_demand_arrived_before_open: "寄り前からヘッジ需要が流入",
  option_market_overheated_relative_to_thesis_quality: "オプション価格が仮説の質に対して過熱",
  support_break_needs_follow_through: "サポート割れ後の追随売り待ち",
  thesis_lost_edge_after_support_recovery: "サポート回復で仮説優位が消失"
};

const tokyoDayFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo"
});

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatTimestamp(value) {
  if (!value) {
    return unsetLabel;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}

export function formatStatus(status) {
  return statusLabels[status] ?? status ?? unsetLabel;
}

export function formatPhase(phase) {
  return phaseLabels[phase] ?? phase ?? unsetLabel;
}

export function formatTriggerState(triggerState) {
  return triggerLabels[triggerState] ?? triggerState ?? unsetLabel;
}

export function formatGateStatus(status) {
  return gateLabels[status] ?? status ?? unsetLabel;
}

export function formatBooleanCheck(value) {
  if (value === null || typeof value === "undefined") {
    return "未確認";
  }

  return value ? "OK" : "NG";
}

export function formatFieldLabel(field) {
  return fieldLabels[field] ?? field;
}

export function formatList(values, formatter = (value) => value) {
  if (!values || values.length === 0) {
    return emptyLabel;
  }

  return values.map((value) => formatter(value)).join(" / ");
}

export function formatCodeLabel(value) {
  if (!value) {
    return unsetLabel;
  }

  return codeLabels[value] ?? String(value).replaceAll("_", " ");
}

export function formatCodeList(values) {
  return formatList(values, formatCodeLabel);
}

export function buildPriceGateSummary(gate, fallbackPolicy) {
  if (!gate) {
    return `方針: ${formatCodeLabel(fallbackPolicy)}`;
  }

  if (gate.overall_gate === "pass") {
    return "通過";
  }

  if (gate.overall_gate === "unchecked") {
    return "未確認";
  }

  const suffix = gate.fail_reason_codes.length > 0 ? `: ${formatCodeList(gate.fail_reason_codes)}` : "";
  return `不通過${suffix}`;
}

export function isDue(nextReviewAt, now) {
  if (!nextReviewAt) {
    return false;
  }

  return new Date(nextReviewAt).getTime() <= new Date(now).getTime();
}

export function diffMinutes(later, earlier) {
  if (!later || !earlier) {
    return null;
  }

  return Math.max(0, Math.round((new Date(later).getTime() - new Date(earlier).getTime()) / 60000));
}

export function formatMinuteGap(value) {
  if (value === null || typeof value === "undefined") {
    return unsetLabel;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours === 0) {
    return `${minutes}分`;
  }

  if (minutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${minutes}分`;
}

export function isSameTokyoDay(first, second) {
  if (!first || !second) {
    return false;
  }

  return tokyoDayFormatter.format(new Date(first)) === tokyoDayFormatter.format(new Date(second));
}

export function buildPriceFreshnessSummary(view) {
  if (!view.linked_price_gate_id || view.linked_price_gate === null) {
    return "価格鮮度: 紐づくレビューでは価格確認がありません。";
  }

  if (view.linked_price_gate === "unchecked") {
    return "価格鮮度: 紐づくレビューでは価格条件が未確認です。";
  }

  const gapText = formatMinuteGap(view.gate_decision_gap_minutes);

  if (view.price_freshness_state === "fresh") {
    return `価格鮮度: 新しい（最新判断の${gapText}前に確認）。`;
  }

  if (view.price_freshness_state === "aging") {
    return `価格鮮度: やや古い（最新判断の${gapText}前に確認）。`;
  }

  return `価格鮮度: 古い（最新判断の${gapText}前に確認）。`;
}

function ensureSentence(value) {
  if (!value) {
    return "";
  }

  return /[。.!?]$/.test(value) ? value : `${value}。`;
}

export function buildDecisionSummary(view) {
  const reasonCode = formatCodeLabel(view.latest_reason_code);
  const reasonDetail = view.latest_reason_detail ? formatCodeLabel(view.latest_reason_detail) : "";
  const failReasons = formatCodeList(view.linked_fail_reason_codes);

  let label = "監視継続理由";
  let line = "";

  if (view.current_status === "eligible") {
    label = "候補化理由";
    line =
      view.linked_trigger_state === "confirmed" && view.linked_price_gate === "pass"
        ? "トリガー確認と価格条件通過が揃っています。"
        : ensureSentence(`${reasonCode}${reasonDetail ? `: ${reasonDetail}` : ""}`);
  } else if (view.current_status === "rejected") {
    label = "見送り理由";
    line =
      view.linked_price_gate === "fail"
        ? failReasons !== emptyLabel
          ? `価格条件が不通過です（${failReasons}）。`
          : "価格条件が不通過です。"
        : ensureSentence(`${reasonCode}${reasonDetail ? `: ${reasonDetail}` : ""}`);
  } else if (view.current_status === "invalidated") {
    label = "失効理由";
    line = ensureSentence(reasonDetail || reasonCode);
  } else if (view.linked_trigger_state === "confirmed" && (!view.linked_price_gate_id || view.linked_price_gate === "unchecked")) {
    line = "トリガーは確認済みですが、価格条件はまだ未確認です。";
  } else if (view.linked_trigger_state === "partial") {
    line = "トリガーはまだ一部成立です。";
  } else if (view.linked_trigger_state === "invalidated") {
    line = "最新観測で失効条件に触れています。";
  } else if (view.linked_snapshot_id) {
    line = ensureSentence(`${reasonCode}${reasonDetail ? `: ${reasonDetail}` : ""}`);
  } else {
    line = "まだ紐づくレビューがありません。";
  }

  const compact = `${label}: ${line}`;

  return {
    label,
    line,
    compact
  };
}

export function compareAscWithNulls(first, second) {
  if (!first && !second) {
    return 0;
  }

  if (!first) {
    return 1;
  }

  if (!second) {
    return -1;
  }

  return new Date(first).getTime() - new Date(second).getTime();
}

export function compareDesc(first, second) {
  return new Date(second).getTime() - new Date(first).getTime();
}
