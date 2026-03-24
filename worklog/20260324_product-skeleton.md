# 2026-03-24 Product Skeleton

## 実施内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260324_product-skeleton.md` を確認した
- `plan/20260324_manual-ops-spec.md`, `plan/20260323_mvp-onepager.md`, `plan/20260323_mvp-planning.md`, `worklog/20260324_manual-ops-spec.md` を読み、受け入れ条件と前提を整理した
- `plan/20260324_product-skeleton.md` を追加し、home/detail の low-fi wire、4 状態の遷移、`scenario_current_view` を含む最小データモデル、Prototype Build への受け渡し順を固定した
- `backlog/20260324_product-skeleton.md` を `done` に更新し、成果物と worklog を紐付けた
- 次フェーズ用に `backlog/20260324_prototype-build.md` を追加した
- `status/current.md`, `status/next.md`, `plan/active.md` を更新し、現在地を Prototype Build に進めた

## 判断
- ホーム画面は `scenario_current_view` だけで描画し、詳細画面だけが履歴 3 record へ降りる構成が最小
- `Rejected` は終端ではなく再オープン可能、`Invalidated` は終端という差を UI とデータモデルの両方で明示する必要がある
- `scenario.current_status` は初期 seed に留め、運用時の表示は `status_event` 最新行から派生させる方が整合しやすい
- 次フェーズは read path を先に確認し、入力フォームは骨格に留める方が `manual-first` 検証に合う

## 次にやること
- ローカル Web UI の技術スタックと scaffold を決める
- sample scenario と `scenario_current_view` selector を用意する
- home/detail の read-only 画面をつないで wire と差分がないか確認する
