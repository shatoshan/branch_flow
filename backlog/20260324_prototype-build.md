# 20260324 Prototype Build

Status: done
Prerequisite: plan/20260324_product-skeleton.md
Worklog: worklog/20260324_prototype-build.md
Result: web/, materials/20260324_prototype-stack.md

## Goal
Product Skeleton で固定した wire とデータモデルを、動くローカル Web UI の最小プロトタイプに落とす。

## Scope
- ローカル Web UI の初期技術選定と scaffold
- `scenario_current_view` を前提にした seed data / store の用意
- ホーム画面で 4 状態一覧を描画
- 詳細画面で固定情報、最新 view、履歴を描画
- 可能なら `scenario form` と `daily review form` の骨格だけ先に置く

## Acceptance Criteria
- ローカルで home / detail の 2 画面を開ける
- downside 先行サンプルを 4 状態で描画できる
- `next_review_at` と `latest_reason_code` がホーム画面で見える
- 詳細画面で trigger, flow chain, price gate, status history が分離表示される
- データの主語が `scenario`, `observation_snapshot`, `price_gate`, `status_event`, `scenario_current_view` に揃っている

## Verification
- [20260324_product-skeleton.md](../plan/20260324_product-skeleton.md) の wire と矛盾しない
- [20260324_manual-ops-spec.md](../plan/20260324_manual-ops-spec.md) の 4 record model と一致している
- 外部データ取得や自動発注に依存していない

## Risks
- 技術選定に時間を使いすぎて wire の確認が遅れる
- 永続化を作り込みすぎて `manual-first` 検証が遅れる
- 入力フォームを先に広げすぎて read path の確認が薄くなる
