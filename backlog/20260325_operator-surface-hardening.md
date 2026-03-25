# 20260325 Operator Surface Hardening

Status: todo
Prerequisite: backlog/20260325_daily-review-append-path.md
Worklog: worklog/20260325_operator-surface-hardening.md
Result: web/, scripts/check.mjs

## Goal
home / detail を read-only viewer から一段進め、manual-first の判断端末として「今なぜ待つのか / 見送るのか / 候補化できるのか」を一目で読めるようにする。

## Scope
- home card と detail `Current View` に、`why now`, `why not now`, `kill switch`, `price stale` を要約する decision summary を追加する
- home summary metric を見直し、当日 `Rejected` と累積 `Invalidated` が混ざらないようにする
- detail timeline に `event_risk_today`, `operator_action`, `source_refs` を表示し、観測根拠を追えるようにする
- 最新 `status_event` が依拠した `observation_snapshot` / `price_gate` と、その鮮度差を UI で把握できるようにする
- 追加表示に必要な派生値を `scenario_current_view` または関連 selector に寄せ、UI 側の重複ロジックを避ける

## Acceptance Criteria
- home で各 scenario の `Eligible` にならない理由、または候補化できる理由が 1 行で分かる
- home summary で `Rejected` と `Invalidated` が別の意味として読め、`No trade` の意味が壊れない
- detail で `何を見たか / どこで見たか / 価格チェックが新鮮か` を status history 全読破なしに把握できる
- decision summary は hand-written な説明文ではなく、最新 linked records から導出される

## Verification
- [20260323_foundation.md](../plan/20260323_foundation.md), [20260324_manual-ops-spec.md](../plan/20260324_manual-ops-spec.md), [20260324_product-skeleton.md](../plan/20260324_product-skeleton.md) に反しない
- `npm run check`
- ブラウザで `Watch / Eligible / Rejected / Invalidated` の各 sample を開き、判断理由と鮮度表示を確認する

## Risks
- decision summary を作り込みすぎて selector と render の責務が混ざる
- 情報量を増やしすぎて home/detail の一瞥性が落ちる
- 鮮度判定のルールが曖昧だと、逆に operator の判断を迷わせる
