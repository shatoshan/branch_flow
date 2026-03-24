# 20260324 Product Skeleton

Status: open
Prerequisite: plan/20260324_manual-ops-spec.md

## Goal
ローカル Web UI の最初のワイヤー、状態遷移、最小データ構造を決める。

## Scope
- ホーム画面の low-fi wire
- 詳細画面の low-fi wire
- `Watch / Eligible / Rejected / Invalidated` の状態遷移整理
- `scenario_current_view` を含む最小データモデル

## Acceptance Criteria
- ホーム画面で 4 状態の一覧と次レビュー時点が表現できる
- 詳細画面で trigger, flow chain, price gate, status history を見分けられる
- 4 状態の遷移条件が明文化されている
- Manual Ops Spec の 4 record model と矛盾しない最小データモデルがある

## Verification
- [20260324_manual-ops-spec.md](../plan/20260324_manual-ops-spec.md) と整合している
- [20260323_mvp-onepager.md](../plan/20260323_mvp-onepager.md) の 9 項目と一致している
- 成果物が `plan/` または `materials/` に残る

## Risks
- UI を先に飾って運用フォームが弱くなる
- 履歴構造が曖昧になり `Rejected` と `Invalidated` の差が消える
- manual-first 前提を崩して自動化依存になる
