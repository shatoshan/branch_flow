# 2026-03-25 Operator Surface Hardening

## 実装内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260325_operator-surface-hardening.md`, `plan/20260323_foundation.md`, `plan/20260324_manual-ops-spec.md`, `plan/20260324_product-skeleton.md` を確認し、latest linked records を中心に surface を強化する方針を固定した
- `web/src/lib/scenarioViews.js` に linked `observation_snapshot` / `price_gate` の参照、decision 時点とのギャップ分、price freshness state を追加し、selector 側で派生値を集約した
- `web/src/lib/formatters.js` に decision summary, price freshness summary, code-like value の可読化 helper, Tokyo 日付比較 helper を追加した
- `web/src/render/homePage.js` を更新し、card 上段に `Why now / Why not now / Kill switch` の要約、観測根拠、価格鮮度を表示し、summary metric を `No Trade Today` と `Invalidated Total` に分離した
- `web/src/render/detailPage.js` を更新し、`Current View` を latest linked decision context 中心へ組み替え、`decision_at`, linked snapshot / gate 時刻, gap, `event_risk_today`, `operator_action`, `source_refs`, `market_note` を一瞥で読めるようにした
- `web/styles.css` に decision summary block と timeline facts 用の最小スタイルを追加し、`scripts/check.mjs` で linked record / freshness / metric 表示の検証を強化した
- `backlog/20260325_operator-surface-hardening.md`, `status/current.md`, `status/closed.md`, `plan/active.md` を更新し、完了状態と次着手を同期した

## 実装判断
- `Current View` の判断理由は最新 `status_event` が参照した snapshot / gate から読むようにし、単なる最新 snapshot と current status の不整合を UI に持ち込まないようにした
- price freshness は最新 decision と linked gate の時間差から `fresh / aging / stale / unchecked` を決め、render では文言生成だけにとどめた
- home card の 1 行 summary には判断理由だけを置き、価格鮮度は別行に分離して、要約の重複と情報の詰め込みすぎを避けた
- `No Trade Today` は当日 `Rejected` のみを数え、`Invalidated` は累積別指標へ分けて「見送り」と「失効」の意味差を維持した

## 検証
- `npm run check`
- `buildScenarioCurrentViews` で latest linked snapshot / gate, freshness gap, `Rejected` / `Invalidated` の読み分けを確認した
- この環境ではブラウザを開いての手動確認までは未実施

## 次にやること
- `20260325_japanese-operator-surface.md` に進み、operator-facing copy と label を日本語中心へ寄せる
