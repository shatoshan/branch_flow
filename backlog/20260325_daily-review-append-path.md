# 20260325 Daily Review Append Path

Status: done
Prerequisite: backlog/20260325_scenario-form-foundation.md
Worklog: worklog/20260325_daily-review-append-path.md
Result: web/, scripts/check.mjs

## Goal
`daily review form` から append-only records を追記し、最新判断を home/detail に反映できるようにする。

## Scope
- home / detail の action から `daily review form` を開ける UI 追加
- 1 submit で `observation_snapshot`, `price_gate`, `status_event` を追加する write path の実装
- `reason_code`, `next_review_phase`, `next_review_at` を必須にし、review 系 ID を自動採番する
- `price_gate` 未確認時は `overall_gate: unchecked` と `null` sub-checks を許容する
- submit 後に `scenario_current_view`, timeline, price gate, status history を再描画する

## Acceptance Criteria
- 1 回の送信で `observation_snapshot`, `price_gate`, `status_event` の参照関係が壊れずに追加される
- review 追加後に home の status 列、`latest_reason_code`, `next_review_at` が更新される
- detail で observation / price gate / status history が latest-first のまま増える
- `Rejected` と `Invalidated` の理由差が `reason_code` で追える
- reload 後も append した review records が残る

## Verification
- [20260324_manual-ops-spec.md](../plan/20260324_manual-ops-spec.md) と [20260324_product-skeleton.md](../plan/20260324_product-skeleton.md) に反しない
- `npm run check`
- ブラウザで sample scenario に daily review を追加し、status 遷移と履歴反映を確認する

## Risks
- 部分保存で `status_event.snapshot_id` や `status_event.price_gate_id` の参照が壊れる
- `overall_gate: unchecked` の扱いが曖昧で `Watch` 継続と gate fail が混ざる
- 過去 review の編集を許して append-only 前提が崩れる
