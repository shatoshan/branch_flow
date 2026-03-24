# 20260324 Manual Ops Spec

## Intent
Phase 2B の目的は、日経平均向け `manual-first` 運用を、同じシナリオを別日に再評価できる粒度まで固定することにある。
この文書では、日次運用ループ、手入力テンプレート、downside 先行サンプル、次フェーズの UI / データ構造への受け渡し条件をまとめる。

## Operating Assumptions
- 単一オペレーターが毎営業日レビューする
- 初期対象は `日経平均`、ただしデータ構造は両方向対応に保つ
- 入力は手動で成立させるが、キー名と enum は `import-friendly` に保つ
- 1 回のレビューで更新するのは `scenario`, `observation_snapshot`, `price_gate`, `status_event` の 4 単位だけに絞る
- `No trade` は正常出力であり、`Rejected` と `Invalidated` を積極的に記録する

## Daily Manual Ops Loop
### 朝
- 前日から持ち越した `Watch` と `Eligible` を確認する
- 当日の既知イベント、夜間の指数先物、金利、為替、ボラティリティの変化を見て `observation_snapshot` を追加する
- 新規または継続シナリオごとに、観測トリガーと失効条件が今日も有効かを確認する
- 条件が近いものだけ `price_gate` を先行記録し、明らかに高すぎる候補はこの時点で `Rejected` にできるようにする
- 出力は `Watch 継続 / Eligible 候補 / Rejected / Invalidated` のいずれかで閉じる

### 日中
- 更新対象は「観測トリガーが実際に進んだ」「失効条件に触れた」「価格条件が変わった」の 3 ケースだけに絞る
- トリガーを観測したら、その時点の `observation_snapshot` と `price_gate` を同じタイムスタンプ帯で追加する
- `観測条件が成立` かつ `price_gate が pass` のときだけ `Eligible` に昇格させる
- トリガー成立でも価格が悪ければ `Rejected` に送り、理由コードを残す
- 失効条件に触れたら、価格確認を挟まず `Invalidated` に送る

### 引け後
- 当日触った全シナリオについて最終 `status_event` を記録する
- `Rejected` と `Invalidated` は理由の文章ではなく reason code で残し、あとで集計できる形にする
- 翌営業日に持ち越す `Watch` と `Eligible` には `next_review_phase` と `next_review_at` を付ける
- 新規に監視するテーマがある場合だけ、新しい `scenario` を登録する

### 週次
- `Watch` のまま長く動かないシナリオを棚卸しし、重複テーマを統合する
- `Rejected` の理由分布を見て、価格ガードが緩すぎるか厳しすぎるかを点検する
- `Invalidated` の理由分布を見て、失効条件の質を見直す
- 将来の半手動化に向けて、手入力で冗長だった項目と、逆に不足した項目を整理する

## Record Model
### Stable Record
- `scenario`: 仮説本体。数日持ち越す前提の固定情報を持つ

### Per Review Records
- `observation_snapshot`: その時点で何を見たか
- `price_gate`: 最低価格ガードを通過したか
- `status_event`: 状態変更と理由

### Input Conventions
- ID は `NKY-D-001`, `OBS-20260324-001` のように prefix 付きで管理する
- 日時は ISO 8601 で保存する
- enum は小文字スネークケースで統一する
- 複数値は JSON では配列、CSV では `;` 区切りで表現できる形にする
- reason code は文章ではなく固定語彙を使う

## Manual Input Templates
### 1. scenario
```yaml
scenario_id: NKY-D-001
market: nikkei225
direction: downside
current_status: watch
scenario_summary: us_rates_reprice_and_yen_strength_pressure_nikkei
horizon_bucket: 1d_2w
entry_window: next_5_sessions
observation_trigger: usd_jpy_breaks_prior_day_low_and_nky_futures_fail_rebound
flow_chain: us_rates_up -> yen_strength -> exporters_weaken -> index_pressure
price_gate_policy: standard_min_gate
invalidation_rule: usd_jpy_reclaims_range_or_nky_closes_above_gap
review_cadence: morning;intraday;after_close;weekly
tags: rates;yen;exporters
notes: ""
```

### 2. observation_snapshot
```yaml
snapshot_id: OBS-20260324-001
scenario_id: NKY-D-001
observed_at: 2026-03-24T08:55:00+09:00
session_phase: morning
trigger_state: partial
observed_signals: us10y_up;usd_jpy_down;nky_futures_soft
event_risk_today: none_major_before_open
market_note: overnight_rates_repricing_persisted
operator_action: keep_watch
source_refs: futures_board;fx_board;rates_dashboard
```

### 3. price_gate
```yaml
price_gate_id: PG-20260324-001
scenario_id: NKY-D-001
checked_at: 2026-03-24T09:02:00+09:00
expiry_bucket_ok: true
spread_ok: true
premium_within_budget: false
iv_event_heat_ok: true
theme_cooldown_ok: true
overall_gate: fail
fail_reason_codes: premium_over_budget
gate_note: target_put_premium_exceeded_daily_loss_budget
```

### 4. status_event
```yaml
status_event_id: ST-20260324-001
scenario_id: NKY-D-001
changed_at: 2026-03-24T09:03:00+09:00
from_status: watch
to_status: rejected
reason_code: price_gate_fail
reason_detail: premium_over_budget
snapshot_id: OBS-20260324-001
price_gate_id: PG-20260324-001
next_review_phase: after_close
next_review_at: 2026-03-24T15:10:00+09:00
```

## Recommended Reason Codes
### Price Gate
- `expiry_too_short`
- `spread_too_wide`
- `premium_over_budget`
- `iv_event_hot`
- `theme_cooldown`

### Status
- `trigger_pending`
- `trigger_confirmed`
- `price_gate_pass`
- `price_gate_fail`
- `thesis_broken`
- `time_expired`
- `manual_archive`

## Entry-Lightening Options
### 優先順 1
- ローカル Web UI に `scenario` 登録フォームと `daily review` 更新フォームを分ける
- `reason_code`, `session_phase`, `current_status` は選択式にする
- 直前の `observation_snapshot` を複製して差分だけ更新できるようにする

### 優先順 2
- YAML ライクな雛形をコピペできる入力欄を用意する
- 同じキー名を JSON にそのまま流用できるようにする

### 優先順 3
- 後続で CSV/JSON import を足せるよう、テンプレートのキーと列名を一致させる
- 一括投入は `scenario` の初期登録と `status_event` の履歴追加から始める

### 今はやらないこと
- 外部サイトからの自動スクレイピング前提
- OCR や自然言語だけでの状態変更
- 価格判定の自動スコア化

## Downside-First Sample Scenarios
### NKY-D-001: 米金利再上昇と円高進行
- 想定ステータス: `watch`
- 観測トリガー: `usd_jpy_breaks_prior_day_low_and_nky_futures_fail_rebound`
- 想定フロー連鎖: `us_rates_up -> yen_strength -> exporters_weaken -> nikkei_pressure`
- 価格判定サマリ: 2 週間以上の期限、スプレッド許容、損失予算内なら検討。プレミアム超過なら見送り
- 失効条件: `usd_jpy_reclaims_range_or_nky_closes_above_gap`

### NKY-D-002: ギャップダウン後の戻り失敗
- 想定ステータス: `eligible`
- 観測トリガー: `cash_open_below_prior_range_and_first_hour_reclaim_fails`
- 想定フロー連鎖: `overnight_risk_off -> futures_sell_programs -> local_long_unwind -> downside_extension`
- 価格判定サマリ: 出来高とスプレッドが保たれ、近すぎる満期でなければ通す
- 失効条件: `opening_gap_fills_and_breadth_recovers`

### NKY-D-003: 既知イベント前のヘッジ需要急増
- 想定ステータス: `rejected`
- 観測トリガー: `event_anxiety_pushes_put_demand_before_scheduled_macro_event`
- 想定フロー連鎖: `event_risk -> put_demand_jump -> iv_expansion -> headline_downside_thesis`
- 価格判定サマリ: シナリオが見えても `iv_event_hot` または `spread_too_wide` なら見送る
- 失効条件: `event_passes_cleanly_or_index_holds_support_without_follow_through`

## Handoff To Product Skeleton
### Home Screen Requirements
- 4 状態 `Watch / Eligible / Rejected / Invalidated` の列またはセクションを持つ
- カード表示項目は `plan/20260323_mvp-onepager.md` の 9 項目に固定する
- カードの補助情報として `next_review_at` と最新 `reason_code` を表示できるようにする

### Detail Screen Requirements
- `scenario` の固定情報を上段に置く
- 最新 `observation_snapshot` を時系列で確認できるようにする
- 最新 `price_gate` と fail reason を独立表示する
- `status_event` 履歴を一覧し、`Rejected` と `Invalidated` の理由を追えるようにする

### Form Split
- `scenario form`: 新規登録または固定情報の更新に限定する
- `daily review form`: `observation_snapshot`, `price_gate`, `status_event` を同一操作で追加する

### Minimal Data Handoff
- 永続単位は `scenario`, `observation_snapshot`, `price_gate`, `status_event` の 4 つ
- UI 用の派生 view として `scenario_current_view` を作り、`current_status`, `latest_snapshot_at`, `latest_price_gate`, `latest_reason_code`, `next_review_at` を引けるようにする
- 次フェーズでは、この view を前提に low-fi wire と最小データモデルを決める
