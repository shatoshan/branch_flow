# 20260323 MVP One Pager

## Product Shape
BranchFlow の MVP は、日経平均のオプション買い候補を「少数だけ残す」ためのローカル Web UI である。
予測を出すのではなく、`Watch / Eligible / Rejected / Invalidated` の 4 状態で、監視、昇格、見送り、失効を管理する。

## Fixed Decisions
- 初期対象市場: `日経平均`
- 初期 UI: `ローカル Web UI`
- 初期入力: `manual-first`
- 価格判定: `最低限ガードのみ`
- 初期サンプル: データモデルは両方向対応、サンプルは `downside 先行`

## Daily Output
MVP が返すべきものは以下の 4 つだけ。
- 監視継続する `Watch`
- 条件が揃った `Eligible`
- 見送った `Rejected`
- 仮説が壊れた `Invalidated`

## Candidate Card
候補カードは 9 項目に固定する。
- scenario_id
- 対象市場
- 方向
- 想定期限帯
- 観測トリガー
- 想定フロー連鎖
- 価格判定サマリ
- 失効条件
- ステータス

## Minimum Price Gate
価格面は精緻な評価ではなく、まず以下の見送り条件だけを持つ。
- 期限が短すぎない
- スプレッドが広すぎない
- プレミアム額が損失予算を超えない
- 既知イベント直前の IV 過熱を避ける
- 同一テーマの連続エントリーを制限できる

## First Screens
- ホーム画面: 4 状態のカード一覧を並べる
- 詳細画面: 観測トリガー、想定フロー連鎖、価格メモ、失効条件、状態履歴を見る

## Minimal Data Shape
最初に必要な構造は以下の 4 つ。
- scenario: 仮説本体
- observation_snapshot: 観測条件の時点記録
- price_gate: 最低価格判定
- status_event: 状態変更履歴

## Input Policy
- 最初は手入力で成立させる
- ただし後で楽にするため、構造は import-friendly に保つ
- Phase 2B では、フォーム入力を基本にしつつ、コピペや CSV/JSON 取り込みに繋げやすい形を検討する

## Out Of Scope
- 自動発注
- 複数市場同時最適化
- 高度な IV モデル
- LLM による最終判定
- 常時シグナル配信

## Next Build Order
1. 日次 manual ops spec を作る
2. 日経平均 downside 先行のサンプルシナリオを 3 件前後作る
3. ホーム画面と詳細画面のワイヤーを作る
4. 最小データモデルを実装に落とす
