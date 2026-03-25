# Active Plan

## Objective
BranchFlow を「予測装置」ではなく、「条件付きの賭けを管理するシナリオ端末」として初期定義する。

## Key Docs
- [Foundation](./20260323_foundation.md): ここまでの壁打ち内容を集約した基礎設計メモ
- [MVP Detailed Planning](./20260323_mvp-planning.md): MVP 像、ロードマップ、意思決定を整理した実行計画
- [MVP One Pager](./20260323_mvp-onepager.md): 固定済みの MVP 定義
- [Manual Ops Spec](./20260324_manual-ops-spec.md): 日次運用ループ、入力テンプレート、サンプルシナリオ、次フェーズへの受け渡し条件
- [Product Skeleton](./20260324_product-skeleton.md): home/detail wire、状態遷移、`scenario_current_view` を含む最小データモデル
- [Input Write Path Planning](./20260325_input-write-path.md): `scenario form` 先行の next action、localStorage 前提の保存面、backlog 分割方針
- [Scenario Form Execution Plan](./20260325_scenario-form-foundation-execution.md): `scenario form` foundation の実装順、shared form surface、verification の固定

## Phase Plan
1. Bootstrap
- repo scaffold を作成する
- operating docs を置く
- 初回 worklog を作成する

2. MVP Definition
- 対象市場を固定する
- シナリオカードの最小項目を 10 個以内に固定する
- 入力データと観測トリガーの最小境界を決める
- `Watch / Eligible / Rejected / Invalidated` の状態定義を固定する
- 最低価格判定条件を決める

3. Manual Ops Spec
- 日次運用ループを決める
- 手入力の手順を定める
- 手入力を楽にする候補手段を整理する
- サンプルシナリオと記録テンプレートを作る

4. Product Skeleton
- ホーム画面の状態遷移を決める
- 候補カードの表示項目を決める
- 詳細画面で見る情報を決める
- 監視 / 候補 / 除外 / 失効 の運用ループを固める

5. Prototype Build
- `scenario_current_view` を使う seed data / store を作る
- 最初の UI 骨格を作る
- home / detail の read path を確認する

6. Post-MVP
- データ取得自動化を追加する
- `portfolio policy` との境界を整理する
- LLM の説明レイヤーを追加する

## Current Focus
- Phase 5 の core read-only prototype と `scenario form` foundation は完了
- 固定済み: 日経平均 / ローカル Web UI / 手動入力先行 / 最低限価格ガード / downside 先行サンプル / 4 record model / Product Skeleton / static prototype stack / browser record store / `localStorage` 永続化 / `detail.html` shared scenario form
- 次着手は `daily review append path`。`observation_snapshot`, `price_gate`, `status_event` を 1 submit で追記する append-only write path を入れる
- その後に operator surface hardening と日本語化 backlog を進める
- 3 本目で seed reset と JSON export/import を含む import-friendly surface を整える
