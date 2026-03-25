# Current

1) 現在の主対象: `scenario form` foundation は完了。次着手は `daily review append path`
2) 実行中バックログ: [20260325_daily-review-append-path.md](../backlog/20260325_daily-review-append-path.md) を `ready` に更新
3) 進行中: browser record store, `localStorage` 永続化, `detail.html` shared scenario form, home/detail の create/update 導線まで実装した
4) ブロッカー: なし
5) 参照ファイル: [active.md](../plan/active.md), [20260325_input-write-path.md](../plan/20260325_input-write-path.md), [20260325_scenario-form-foundation-execution.md](../plan/20260325_scenario-form-foundation-execution.md), [20260325_daily-review-append-path.md](../backlog/20260325_daily-review-append-path.md), [20260325_scenario-form-foundation.md](../backlog/20260325_scenario-form-foundation.md), [20260325_scenario-form-foundation.md](../worklog/20260325_scenario-form-foundation.md)
6) まず実行すること: home/detail の `Add Daily Review` を append-only form に差し替え、1 submit で `observation_snapshot`, `price_gate`, `status_event` を追加する
7) 完了条件: review 追記が reload を跨いで残り、`scenario_current_view`, detail history, status 表示が即時更新されること
