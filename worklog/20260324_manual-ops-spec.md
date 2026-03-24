# 2026-03-24 Manual Ops Spec

## 実施内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260323_manual-ops-spec.md` を確認した
- `plan/20260323_mvp-onepager.md`, `plan/20260323_mvp-planning.md`, `worklog/20260323_計画詳細化.md` を読み、受け入れ条件と前提を整理した
- `plan/20260324_manual-ops-spec.md` を追加し、日次運用ループ、手入力テンプレート、reason code、手入力軽量化案、downside 先行サンプル、UI / データ構造への受け渡し条件を固定した
- `backlog/20260323_manual-ops-spec.md` を `done` に更新し、成果物と worklog を紐付けた
- 次フェーズ用に `backlog/20260324_product-skeleton.md` を追加した
- `status/current.md` と `plan/active.md` を更新し、現在地を Product Skeleton へ進めた

## 判断
- manual-first 運用は `scenario` と 3 種の時点記録に分けると再評価しやすい
- 日次更新フォームは `observation_snapshot`, `price_gate`, `status_event` を同時追加できる形がよい
- downside サンプルは `watch`, `eligible`, `rejected` を含めると運用ループの使い方が見えやすい
- `Rejected` と `Invalidated` は文章ではなく reason code を持たせた方が後で見直しやすい

## 次にやること
- ホーム画面と詳細画面の low-fi wire を作る
- 4 状態の状態遷移を図または表で固定する
- `scenario_current_view` を含む最小データモデルを整理する
