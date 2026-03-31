# 2026-03-25 Japanese Operator Surface

## 実装内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260325_japanese-operator-surface.md`, `plan/20260323_foundation.md`, `plan/20260324_manual-ops-spec.md`, `plan/20260324_product-skeleton.md` を確認し、日本語化の責務を formatter と render copy に寄せる方針を固定した
- `web/src/lib/formatters.js` を更新し、status / phase / trigger / gate / field label / fixed code vocabulary の日本語 map、価格鮮度要約、decision summary の日本語文面を集約した
- `web/src/lib/scenarioDraft.js`, `web/src/lib/dailyReview.js` の validation error を日本語化し、field label と enum 候補も operator-facing に揃えた
- `web/src/render/homePage.js`, `web/src/render/detailPage.js`, `web/src/render/scenarioForm.js`, `web/src/render/dailyReviewForm.js` を更新し、見出し、ボタン、helper copy、empty state、status / gate / phase ラベルを日本語中心に差し替えた
- `materials/20260331_operator-translation-guide.md` を追加し、固定語彙の翻訳方針と `Rejected` / `Invalidated` の意味差を残す表示ポリシーを整理した
- `scripts/check.mjs` を日本語 UI 前提の assertion に更新し、`backlog/20260325_japanese-operator-surface.md`, `status/current.md`, `status/closed.md`, `status/next.md`, `plan/active.md` を同期した

## 実装判断
- storage / import 用の enum と field 名は変更せず、表示だけ formatter 経由で日本語化して record model を汚さない形に保った
- `見送り` と `失効` の違いが UI 上で崩れないよう、decision summary と status history の label を分けた
- fixed reason code や fail reason は日本語変換しつつ、operator 自由入力の note 系は入力値尊重を優先してそのまま表示する方針にした

## 検証
- `npm run check`
- bundle 生成、node syntax check、日本語 UI 前提の render assertion が通ることを確認した
- この環境ではブラウザを開いての手動確認までは未実施

## 次にやること
- `20260331_import-friendly-surface.md` に進み、seed reset と JSON export / import をまとめた import-friendly surface を追加する
