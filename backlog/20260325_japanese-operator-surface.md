# 20260325 Japanese Operator Surface

Status: todo
Prerequisite: backlog/20260325_operator-surface-hardening.md
Worklog: worklog/20260325_japanese-operator-surface.md
Result: web/, scripts/check.mjs, materials/

## Goal
operator-facing UI と入力面を日本語中心に揃え、日本の単一オペレーターが日次運用しやすい surface に寄せる。

## Scope
- home / detail / `scenario form` / `daily review form` の見出し、ボタン、empty state、helper copy を日本語化する
- `Watch / Eligible / Rejected / Invalidated`, `session_phase`, `trigger_state`, `price_gate` 表示ラベルを日本語化しつつ、内部 enum は英語のまま保つ
- reason code や gate fail reason の表示方針を決め、必要なら operator 向け用語対応表を `materials/` に残す
- import-friendly な key 名、ID、enum、JSON shape は変えず、表示文言だけを分離できる構造へ寄せる

## Acceptance Criteria
- operator-facing 画面を end-to-end で見たとき、日本語 UI として自然に読める
- storage / import 用の field 名、ID、enum は既存の英語スネークケースから変わらない
- `Rejected` と `Invalidated` の意味差が、翻訳後のラベルでも崩れない
- 日本語化の責務が formatter や copy map に集約され、record model を汚さない

## Verification
- [20260323_foundation.md](../plan/20260323_foundation.md), [20260324_manual-ops-spec.md](../plan/20260324_manual-ops-spec.md) の用語と矛盾しない
- `npm run check`
- ブラウザで home/detail/form を開き、日本語 copy と raw enum の境界が意図通りか確認する

## Risks
- 逐語訳で status の意味が弱まり、運用判断が曖昧になる
- 途中段階の混在 UI が長く残り、英日が不自然に混ざる
- 表示文言と内部 enum の対応が散らばり、後続 import/export 面で齟齬が出る
