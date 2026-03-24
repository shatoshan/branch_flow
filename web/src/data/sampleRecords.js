export const prototypeClock = "2026-03-24T15:20:00+09:00";

export const scenarios = [
  {
    scenario_id: "NKY-D-001",
    market: "nikkei225",
    direction: "downside",
    scenario_summary: "us_rates_reprice_and_yen_strength_pressure_nikkei",
    horizon_bucket: "1d_2w",
    entry_window: "next_5_sessions",
    observation_trigger: "usd_jpy_breaks_prior_day_low_and_nky_futures_fail_rebound",
    flow_chain: "us_rates_up -> yen_strength -> exporters_weaken -> index_pressure",
    price_gate_policy: "standard_min_gate",
    invalidation_rule: "usd_jpy_reclaims_range_or_nky_closes_above_gap",
    review_cadence: ["morning", "intraday", "after_close", "weekly"],
    tags: ["rates", "yen", "exporters"],
    notes: "",
    current_status_seed: "watch"
  },
  {
    scenario_id: "NKY-D-002",
    market: "nikkei225",
    direction: "downside",
    scenario_summary: "gap_down_rebound_failure_extends_sell_pressure",
    horizon_bucket: "1d_2w",
    entry_window: "same_week",
    observation_trigger: "cash_open_below_prior_range_and_first_hour_reclaim_fails",
    flow_chain: "overnight_risk_off -> futures_sell_programs -> local_long_unwind -> downside_extension",
    price_gate_policy: "standard_min_gate",
    invalidation_rule: "opening_gap_fills_and_breadth_recovers",
    review_cadence: ["morning", "intraday", "after_close"],
    tags: ["risk_off", "gap", "breadth"],
    notes: "",
    current_status_seed: "watch"
  },
  {
    scenario_id: "NKY-D-003",
    market: "nikkei225",
    direction: "downside",
    scenario_summary: "event_hedge_demand_overheats_puts_ahead_of_macro_event",
    horizon_bucket: "1d_2w",
    entry_window: "next_3_sessions",
    observation_trigger: "event_anxiety_pushes_put_demand_before_scheduled_macro_event",
    flow_chain: "event_risk -> put_demand_jump -> iv_expansion -> headline_downside_thesis",
    price_gate_policy: "event_guarded_gate",
    invalidation_rule: "event_passes_cleanly_or_index_holds_support_without_follow_through",
    review_cadence: ["morning", "after_close", "weekly"],
    tags: ["event", "iv", "hedging"],
    notes: "",
    current_status_seed: "watch"
  },
  {
    scenario_id: "NKY-D-004",
    market: "nikkei225",
    direction: "downside",
    scenario_summary: "prior_support_break_lacks_follow_bid",
    horizon_bucket: "1d_2w",
    entry_window: "same_day",
    observation_trigger: "prior_support_break_fails_to_reverse",
    flow_chain: "sellers_press -> support_break -> no_follow_bid",
    price_gate_policy: "standard_min_gate",
    invalidation_rule: "support_recovers_and_breadth_turns",
    review_cadence: ["intraday", "after_close"],
    tags: ["support", "breadth", "momentum"],
    notes: "terminate once support recovery invalidates the thesis",
    current_status_seed: "watch"
  }
];

export const observationSnapshots = [
  {
    snapshot_id: "OBS-20260324-001",
    scenario_id: "NKY-D-001",
    observed_at: "2026-03-24T08:55:00+09:00",
    session_phase: "morning",
    trigger_state: "partial",
    observed_signals: ["us10y_up", "usd_jpy_down", "nky_futures_soft"],
    event_risk_today: "none_major_before_open",
    market_note: "overnight_rates_repricing_persisted",
    operator_action: "keep_watch",
    source_refs: ["futures_board", "fx_board", "rates_dashboard"]
  },
  {
    snapshot_id: "OBS-20260324-002",
    scenario_id: "NKY-D-001",
    observed_at: "2026-03-24T12:40:00+09:00",
    session_phase: "intraday",
    trigger_state: "confirmed",
    observed_signals: ["usd_jpy_break", "exporters_weak", "breadth_soft"],
    event_risk_today: "us_data_later",
    market_note: "cash_market_failed_to_reclaim_opening_gap",
    operator_action: "check_price_gate",
    source_refs: ["fx_board", "breadth_sheet", "nky_futures"]
  },
  {
    snapshot_id: "OBS-20260324-003",
    scenario_id: "NKY-D-001",
    observed_at: "2026-03-24T15:05:00+09:00",
    session_phase: "after_close",
    trigger_state: "partial",
    observed_signals: ["close_above_low", "pressure_remains", "yen_firm"],
    event_risk_today: "us_data_pending",
    market_note: "sell_pressure_remained_but_no_clean_close_break",
    operator_action: "reset_to_watch",
    source_refs: ["cash_close", "fx_board"]
  },
  {
    snapshot_id: "OBS-20260324-004",
    scenario_id: "NKY-D-002",
    observed_at: "2026-03-24T09:18:00+09:00",
    session_phase: "morning",
    trigger_state: "partial",
    observed_signals: ["gap_down_open", "risk_off_breadth", "weak_opening_bid"],
    event_risk_today: "none_major",
    market_note: "open_failed_to_fill_gap_in_first_minutes",
    operator_action: "stay_alert",
    source_refs: ["cash_open", "breadth_sheet"]
  },
  {
    snapshot_id: "OBS-20260324-005",
    scenario_id: "NKY-D-002",
    observed_at: "2026-03-24T10:02:00+09:00",
    session_phase: "intraday",
    trigger_state: "confirmed",
    observed_signals: ["first_hour_reclaim_failed", "futures_sell_programs", "banks_weak"],
    event_risk_today: "none_major",
    market_note: "rebound_attempt_stalled_under_prior_range",
    operator_action: "promote_eligible",
    source_refs: ["cash_chart", "breadth_sheet", "futures_board"]
  },
  {
    snapshot_id: "OBS-20260324-006",
    scenario_id: "NKY-D-003",
    observed_at: "2026-03-24T08:40:00+09:00",
    session_phase: "morning",
    trigger_state: "confirmed",
    observed_signals: ["event_calendar_dense", "put_skew_up", "term_structure_firm"],
    event_risk_today: "scheduled_us_macro_event",
    market_note: "hedge_demand_arrived_before_open",
    operator_action: "check_price_gate",
    source_refs: ["vol_board", "macro_calendar"]
  },
  {
    snapshot_id: "OBS-20260324-007",
    scenario_id: "NKY-D-003",
    observed_at: "2026-03-24T11:10:00+09:00",
    session_phase: "intraday",
    trigger_state: "confirmed",
    observed_signals: ["spread_widening", "iv_jump", "headline_risk_unchanged"],
    event_risk_today: "scheduled_us_macro_event",
    market_note: "option_market_overheated_relative_to_thesis_quality",
    operator_action: "keep_rejected",
    source_refs: ["vol_board", "options_chain"]
  },
  {
    snapshot_id: "OBS-20260324-008",
    scenario_id: "NKY-D-004",
    observed_at: "2026-03-24T09:10:00+09:00",
    session_phase: "morning",
    trigger_state: "partial",
    observed_signals: ["prior_support_break", "breadth_deteriorates", "buyers_absent"],
    event_risk_today: "none_major",
    market_note: "support_break_needs_follow_through",
    operator_action: "watch_for_invalidation",
    source_refs: ["cash_chart", "breadth_sheet"]
  },
  {
    snapshot_id: "OBS-20260324-009",
    scenario_id: "NKY-D-004",
    observed_at: "2026-03-24T11:35:00+09:00",
    session_phase: "intraday",
    trigger_state: "invalidated",
    observed_signals: ["support_recovers", "breadth_turns", "sellers_stall"],
    event_risk_today: "none_major",
    market_note: "thesis_lost_edge_after_support_recovery",
    operator_action: "invalidate",
    source_refs: ["cash_chart", "breadth_sheet"]
  }
];

export const priceGates = [
  {
    price_gate_id: "PG-20260324-001",
    scenario_id: "NKY-D-001",
    checked_at: "2026-03-24T09:02:00+09:00",
    expiry_bucket_ok: true,
    spread_ok: true,
    premium_within_budget: false,
    iv_event_heat_ok: true,
    theme_cooldown_ok: true,
    overall_gate: "fail",
    fail_reason_codes: ["premium_over_budget"],
    gate_note: "target_put_premium_exceeded_daily_loss_budget"
  },
  {
    price_gate_id: "PG-20260324-002",
    scenario_id: "NKY-D-002",
    checked_at: "2026-03-24T10:05:00+09:00",
    expiry_bucket_ok: true,
    spread_ok: true,
    premium_within_budget: true,
    iv_event_heat_ok: true,
    theme_cooldown_ok: true,
    overall_gate: "pass",
    fail_reason_codes: [],
    gate_note: "near_term_puts_remained_inside_daily_risk_budget"
  },
  {
    price_gate_id: "PG-20260324-003",
    scenario_id: "NKY-D-003",
    checked_at: "2026-03-24T08:45:00+09:00",
    expiry_bucket_ok: true,
    spread_ok: false,
    premium_within_budget: true,
    iv_event_heat_ok: false,
    theme_cooldown_ok: true,
    overall_gate: "fail",
    fail_reason_codes: ["spread_too_wide", "iv_event_hot"],
    gate_note: "event_premium_spike_removed_edge_from_downside_hedge"
  }
];

export const statusEvents = [
  {
    status_event_id: "ST-20260324-001",
    scenario_id: "NKY-D-001",
    changed_at: "2026-03-24T09:03:00+09:00",
    from_status: "watch",
    to_status: "rejected",
    reason_code: "price_gate_fail",
    reason_detail: "premium_over_budget",
    snapshot_id: "OBS-20260324-001",
    price_gate_id: "PG-20260324-001",
    next_review_phase: "after_close",
    next_review_at: "2026-03-24T15:10:00+09:00"
  },
  {
    status_event_id: "ST-20260324-002",
    scenario_id: "NKY-D-001",
    changed_at: "2026-03-24T15:10:00+09:00",
    from_status: "rejected",
    to_status: "watch",
    reason_code: "trigger_pending",
    reason_detail: "pressure_remains_but_not_clean_enough_to_promote",
    snapshot_id: "OBS-20260324-003",
    price_gate_id: "PG-20260324-001",
    next_review_phase: "after_close",
    next_review_at: "2026-03-24T15:10:00+09:00"
  },
  {
    status_event_id: "ST-20260324-003",
    scenario_id: "NKY-D-002",
    changed_at: "2026-03-24T10:06:00+09:00",
    from_status: "watch",
    to_status: "eligible",
    reason_code: "price_gate_pass",
    reason_detail: "trigger_confirmed_and_gate_passed",
    snapshot_id: "OBS-20260324-005",
    price_gate_id: "PG-20260324-002",
    next_review_phase: "after_close",
    next_review_at: "2026-03-24T15:15:00+09:00"
  },
  {
    status_event_id: "ST-20260324-004",
    scenario_id: "NKY-D-003",
    changed_at: "2026-03-24T08:46:00+09:00",
    from_status: "watch",
    to_status: "rejected",
    reason_code: "price_gate_fail",
    reason_detail: "iv_event_hot_and_spread_too_wide",
    snapshot_id: "OBS-20260324-006",
    price_gate_id: "PG-20260324-003",
    next_review_phase: "weekly",
    next_review_at: "2026-03-31T09:00:00+09:00"
  },
  {
    status_event_id: "ST-20260324-005",
    scenario_id: "NKY-D-004",
    changed_at: "2026-03-24T11:36:00+09:00",
    from_status: "watch",
    to_status: "invalidated",
    reason_code: "thesis_broken",
    reason_detail: "support_recovered_and_breadth_turned",
    snapshot_id: "OBS-20260324-009",
    price_gate_id: null,
    next_review_phase: null,
    next_review_at: null
  }
];

export const prototypeRecords = {
  prototypeClock,
  scenarios,
  observationSnapshots,
  priceGates,
  statusEvents
};
