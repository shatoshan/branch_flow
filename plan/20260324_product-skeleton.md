# 20260324 Product Skeleton

## Intent
`manual-first` で固定した運用を、最初のローカル Web UI 骨格へ落とす。
この文書では、ホーム画面 / 詳細画面の low-fi wire、4 状態の遷移ルール、`scenario_current_view` を含む最小データモデルを固定する。

## Screen Model
- ホーム画面は `scenario_current_view` だけで描画する
- 詳細画面は `scenario` の固定情報に、`observation_snapshot`, `price_gate`, `status_event` の履歴を重ねる
- 入力操作は `scenario form` と `daily review form` に分ける
- `Invalidated` は終端状態とし、同じ相場観を再登録する場合も新しい `scenario_id` を使う

## Home Screen Low-Fi Wire
```
+----------------------------------------------------------------------------------+
| BranchFlow | 2026-03-24 Tue | due_now: 2 | upcoming: 3 | no_trade_today: 4     |
| [New Scenario] [Daily Review] [Only Due Now] [All Scenarios]                    |
+----------------------------------------------------------------------------------+
| Watch (2)                   | Eligible (1)                | Rejected (1)         |
|----------------------------|-----------------------------|----------------------|
| NKY-D-001                  | NKY-D-002                   | NKY-D-003            |
| market: nikkei225          | market: nikkei225           | market: nikkei225    |
| direction: downside        | direction: downside         | direction: downside  |
| horizon: 1d_2w             | horizon: 1d_2w              | horizon: 1d_2w       |
| trigger: usd_jpy_break...  | trigger: cash_open_below... | trigger: event_...   |
| flow: rates -> yen -> ...  | flow: risk_off -> ...       | flow: event -> ...   |
| price: gate not checked    | price: pass                 | price: iv_event_hot  |
| invalidation: usd_jpy_...  | invalidation: opening_...   | invalidation: ...    |
| status: watch              | status: eligible            | status: rejected     |
| next_review: 2026-03-24... | next_review: 2026-03-24...  | next_review: weekly  |
| latest_reason: trigger_... | latest_reason: price_...    | latest_reason: ...   |
| [Open Detail]              | [Open Detail]               | [Open Detail]        |
|----------------------------|-----------------------------|----------------------|
| Invalidated (1)                                                                |
|------------------------------------------------------------------------------  |
| NKY-D-004                                                                  |
| market: nikkei225 | direction: downside | horizon: 1d_2w                    |
| trigger: prior_support_break_fails_to_reverse                               |
| flow: sellers_press -> support_break -> no_follow_bid                        |
| price: n/a                                                                   |
| invalidation: support_recovers_and_breadth_turns                             |
| status: invalidated                                                          |
| next_review: none | latest_reason: thesis_broken                             |
| [Open Detail]                                                                 |
+----------------------------------------------------------------------------------+
```

## Home Screen Rules
- 4 状態 `Watch / Eligible / Rejected / Invalidated` を独立カラムまたはセクションで並べる
- カード本体は `plan/20260323_mvp-onepager.md` の 9 項目に固定する
- 補助表示は `next_review_at` と `latest_reason_code` だけに絞る
- 並び順は `due_now` 優先、その次に `next_review_at` 昇順、同順位は `latest_status_changed_at` 降順にする
- ホーム画面では履歴を展開せず、カード押下で詳細画面へ遷移する

## Candidate Card Mapping
| 表示項目 | 取得元 |
| --- | --- |
| `scenario_id` | `scenario_current_view.scenario_id` |
| 対象市場 | `scenario_current_view.market` |
| 方向 | `scenario_current_view.direction` |
| 想定期限帯 | `scenario_current_view.horizon_bucket` |
| 観測トリガー | `scenario_current_view.observation_trigger` |
| 想定フロー連鎖 | `scenario_current_view.flow_chain` |
| 価格判定サマリ | `scenario_current_view.card_price_gate_summary` |
| 失効条件 | `scenario_current_view.invalidation_rule` |
| ステータス | `scenario_current_view.current_status` |

## Detail Screen Low-Fi Wire
```
+----------------------------------------------------------------------------------+
| < Home | NKY-D-001 | status: watch | next_review: 2026-03-24T15:10+09:00       |
| [Edit Scenario] [Add Daily Review]                                              |
+----------------------------------------------------------------------------------+
| Scenario Thesis                                                                  |
| market: nikkei225 | direction: downside | horizon: 1d_2w | entry: next_5_sessions|
| summary: us_rates_reprice_and_yen_strength_pressure_nikkei                       |
| trigger: usd_jpy_breaks_prior_day_low_and_nky_futures_fail_rebound              |
| flow chain: us_rates_up -> yen_strength -> exporters_weaken -> index_pressure   |
| invalidation: usd_jpy_reclaims_range_or_nky_closes_above_gap                    |
| cadence: morning / intraday / after_close / weekly | tags: rates;yen;exporters  |
+----------------------------------------------------------------------------------+
| Current View                                                                     |
| latest_snapshot_at: 2026-03-24T08:55+09:00 | trigger_state: partial             |
| latest_price_gate: fail | fail_reasons: premium_over_budget                      |
| latest_reason: price_gate_fail | next_review_phase: after_close                  |
+----------------------------------------------------------------------------------+
| Observation Timeline                                                             |
| 08:55 morning  partial  us10y_up;usd_jpy_down;nky_futures_soft                  |
| 12:40 intraday confirmed usd_jpy_break;exporters_weak;breadth_soft              |
| 15:05 after_close partial close_above_low_but_pressure_remains                  |
+----------------------------------------------------------------------------------+
| Price Gate                                                                       |
| 09:02 overall: fail                                                              |
| expiry_ok: true | spread_ok: true | premium_ok: false | iv_heat_ok: true        |
| cooldown_ok: true | fail_reason_codes: premium_over_budget                       |
| note: target_put_premium_exceeded_daily_loss_budget                              |
+----------------------------------------------------------------------------------+
| Status History                                                                   |
| 2026-03-24 09:03 watch -> rejected    reason: price_gate_fail / premium_over... |
| 2026-03-24 15:10 rejected -> watch    reason: trigger_pending                    |
| 2026-03-25 09:15 watch -> invalidated reason: thesis_broken                      |
+----------------------------------------------------------------------------------+
```

## Detail Screen Rules
- 上段には `scenario` の固定情報を置き、毎レビューで変わらない仮説を分離する
- `Current View` では `scenario_current_view` の派生値だけを見せ、今の判断を 1 行で把握できるようにする
- `Observation Timeline` は `observed_at` 降順、`Price Gate` は最新 1 件を強調表示する
- `Status History` では `from_status`, `to_status`, `reason_code`, `reason_detail` を必ず並べる
- `Rejected` と `Invalidated` の差が消えないよう、`price_gate_fail` 系と `thesis_broken` 系を同列表示しない

## Form Split
- `scenario form`
  - 新規登録と固定情報更新だけを扱う
  - `market`, `direction`, `horizon_bucket`, `observation_trigger`, `flow_chain`, `invalidation_rule` を主入力にする
- `daily review form`
  - 1 回の送信で `observation_snapshot`, `price_gate`, `status_event` を追加する
  - `status_event` の `reason_code`, `next_review_phase`, `next_review_at` を必須にする
  - `price_gate` 未確認のレビューでは `overall_gate: unchecked` を許し、`Watch` 更新を残せるようにする

## Transition Principles
- `Invalidated` は最優先で、失効条件接触または期限切れなら他の状態判断を上書きする
- `Eligible` は「観測トリガー確認済み」かつ「価格ガード通過」の両方が揃ったときだけ許可する
- `Rejected` は「今回は見送る」を明示的に残す状態で、主な理由は `price_gate_fail` または品質 / 頻度制約とする
- `Watch` は仮説が生きているが、まだ昇格できないときの既定状態とする
- 状態は再計算ではなく `status_event` の最新行で確定し、`scenario_current_view` はそれを読む

## Transition Table
| From | To | 典型 reason_code | 条件 |
| --- | --- | --- | --- |
| `watch` | `watch` | `trigger_pending` | 仮説は維持。観測条件未達、または gate 未確認のまま継続監視する |
| `watch` | `eligible` | `price_gate_pass` | トリガー確認済みで `price_gate.overall_gate = pass` |
| `watch` | `rejected` | `price_gate_fail` | そのレビュー単位では no-trade。価格、頻度、品質のどれかで見送る |
| `watch` | `invalidated` | `thesis_broken`, `time_expired` | 失効条件に触れた、または時間切れ |
| `eligible` | `eligible` | `price_gate_pass` | 条件維持を再確認した |
| `eligible` | `watch` | `trigger_pending` | 仮説は残るが、即時エントリー条件が崩れた |
| `eligible` | `rejected` | `price_gate_fail` | トリガーは見えても価格悪化や頻度制約で見送る |
| `eligible` | `invalidated` | `thesis_broken`, `time_expired` | 候補だった仮説が壊れた |
| `rejected` | `rejected` | `price_gate_fail` | 見送り判断を継続する |
| `rejected` | `watch` | `trigger_pending` | 見送り理由が消え、次レビュー対象として再オープンする |
| `rejected` | `eligible` | `price_gate_pass` | 同じ仮説が後続レビューで条件を満たした |
| `rejected` | `invalidated` | `thesis_broken`, `time_expired` | 仮説が失効した |
| `invalidated` | `invalidated` | `manual_archive` | 履歴追記のみ許可。運用上は終端で、他状態へは戻さない |

## Minimal Data Model
### Base Records
| Record | 役割 | 最小フィールド |
| --- | --- | --- |
| `scenario` | 数日持ち越す固定仮説 | `scenario_id`, `market`, `direction`, `scenario_summary`, `horizon_bucket`, `entry_window`, `observation_trigger`, `flow_chain`, `price_gate_policy`, `invalidation_rule`, `review_cadence`, `tags`, `notes`, `current_status_seed` |
| `observation_snapshot` | その時点の観測 | `snapshot_id`, `scenario_id`, `observed_at`, `session_phase`, `trigger_state`, `observed_signals`, `event_risk_today`, `market_note`, `operator_action`, `source_refs` |
| `price_gate` | 価格面の最低判定 | `price_gate_id`, `scenario_id`, `checked_at`, `expiry_bucket_ok`, `spread_ok`, `premium_within_budget`, `iv_event_heat_ok`, `theme_cooldown_ok`, `overall_gate`, `fail_reason_codes`, `gate_note` |
| `status_event` | 状態変更履歴 | `status_event_id`, `scenario_id`, `changed_at`, `from_status`, `to_status`, `reason_code`, `reason_detail`, `snapshot_id`, `price_gate_id`, `next_review_phase`, `next_review_at` |

### Derived View
| Field | Source / Rule |
| --- | --- |
| `scenario_id`, `market`, `direction`, `horizon_bucket`, `observation_trigger`, `flow_chain`, `invalidation_rule` | `scenario` |
| `card_price_gate_summary` | 最新 `price_gate` があれば `overall_gate` と `fail_reason_codes` から生成し、なければ `price_gate_policy` を表示用に展開する |
| `current_status` | 最新 `status_event.to_status`。履歴がなければ `scenario.current_status_seed` |
| `latest_reason_code`, `latest_reason_detail`, `latest_status_changed_at` | 最新 `status_event` |
| `latest_snapshot_at`, `latest_trigger_state`, `latest_observed_signals` | 最新 `observation_snapshot` |
| `latest_price_gate`, `latest_fail_reason_codes`, `latest_gate_checked_at` | 最新 `price_gate` |
| `next_review_phase`, `next_review_at` | 最新 `status_event` |
| `is_review_due` | `next_review_at <= now()` なら `true` |

## Data Consistency Rules
- UI は状態表示に `scenario.current_status_seed` を直接使わず、常に `scenario_current_view.current_status` を使う
- `status_event.snapshot_id` と `status_event.price_gate_id` は同一レビュー送信で作られたレコードを指す
- `Rejected` と `Invalidated` の見分けは `status_event.reason_code` に依存し、`scenario` 側へ重複保存しない
- ホーム画面は `scenario_current_view` だけで成立させ、詳細画面だけが履歴テーブルへ降りる

## Prototype Handoff
次フェーズでは以下の順で着手する。
1. `scenario`, `observation_snapshot`, `price_gate`, `status_event` の seed data を downside-first サンプルで用意する
2. `scenario_current_view` 相当の selector または SQL view を作る
3. ホーム画面を 4 状態セクションで描画する
4. 詳細画面で固定情報、最新 view、履歴 3 セクションを描画する
5. その後に `scenario form` と `daily review form` を接続する
