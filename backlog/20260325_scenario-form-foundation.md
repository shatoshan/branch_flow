# 20260325 Scenario Form Foundation

Status: done
Prerequisite: backlog/20260324_prototype-build.md
Worklog: worklog/20260325_scenario-form-foundation.md
Result: web/, scripts/check.mjs

## Goal
静的 prototype に `scenario form` と最小永続化土台を足し、固定仮説を UI から追加 / 更新できるようにする。

## Scope
- `prototypeRecords` seed を clone する browser record store の追加
- home / detail の action から `scenario form` を開ける UI 追加
- `market`, `direction`, `scenario_summary`, `horizon_bucket`, `entry_window`, `observation_trigger`, `flow_chain`, `price_gate_policy`, `invalidation_rule`, `review_cadence`, `tags`, `notes` の create/update
- save 後に `scenario_current_view` を再計算して home/detail に反映
- 既存 sample の review history は変更しない

## Acceptance Criteria
- home から新しい `scenario` を登録すると `Watch` に追加される
- detail から既存 `scenario` の fixed fields を更新できる
- save 内容が reload 後も残り、home/detail の表示が一致する
- `current_status` は `status_event` 最新行または seed から導出され、form が直接上書きしない
- `observation_snapshot`, `price_gate`, `status_event` の配列は scenario edit で変更されない

## Verification
- [20260325_input-write-path.md](../plan/20260325_input-write-path.md) と [20260324_product-skeleton.md](../plan/20260324_product-skeleton.md) に反しない
- `npm run check`
- ブラウザで home から scenario を追加し、reload 後に detail を開いて fixed fields を更新できる

## Risks
- 保存面が page-local state に閉じて home/detail で不一致になる
- form が review fields まで抱え込み、分離境界が崩れる
- `review_cadence` や `tags` の入力が import-friendly 形を失う
