# 20260323 MVP Definition

Status: open
Worklog: worklog/20260323_初期セットアップ.md

## Goal
BranchFlow の最小プロダクト定義を 1 ページで固定する。

## Scope
- 対象市場の初期範囲
- シナリオカードの最小入出力
- 監視状態と候補昇格条件
- オプション価格判定の最低条件

## Acceptance Criteria
- MVP 対象市場が明記されている
- 候補カード項目が 10 個以内に整理されている
- `Watch / Eligible / Rejected / Invalidated` の状態定義がある
- 次に実装すべき最初の画面またはデータ構造が決まっている

## Verification
- `status/current.md` と整合している
- `plan/active.md` の Phase 2 と一致している
- 成果物が `materials/` または `plan/` に残る

## Risks
- 予測ツール化してしまう
- データ取得前提を広げすぎる
- オプション市場側の価格判定が後回しになる
