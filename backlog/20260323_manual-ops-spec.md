# 20260323 Manual Ops Spec

Status: done
Worklog: worklog/20260324_manual-ops-spec.md
Result: plan/20260324_manual-ops-spec.md

## Goal
日経平均向け manual-first 運用の入力テンプレートと日次ループを固定し、ローカル Web UI の最初の土台を作る。

## Scope
- 日次運用ループ
- 手入力テンプレート
- 手入力を楽にする候補手段の整理
- downside 先行サンプルシナリオ
- 初期ワイヤーと最小データ構造への受け渡し条件

## Acceptance Criteria
- 朝 / 日中 / 引け後 / 週次の運用ループが定義されている
- 手入力テンプレートで scenario, price gate, status reason を記録できる
- 後で CSV/JSON へ寄せやすい入力構造になっている
- 日経平均 downside 先行のサンプルシナリオが 3 件前後ある
- 次に作るワイヤーまたはデータ構造の受け渡しが明記されている

## Verification
- [20260323_mvp-onepager.md](../plan/20260323_mvp-onepager.md) と矛盾しない
- [active.md](../plan/active.md) の Phase 3 手前の内容と一致している
- 成果物が `plan/` または `materials/` に残る

## Risks
- 入力負荷を軽視して継続運用できない
- 自動化前提を持ち込みすぎる
- downside サンプルだけで市場全体の器を狭めてしまう
