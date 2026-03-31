# 2026-03-25 Daily Review Append Path

## 実装内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260325_daily-review-append-path.md`, `plan/20260325_input-write-path.md`, `plan/20260324_manual-ops-spec.md`, `plan/20260324_product-skeleton.md` を確認し、append-only review path の受け入れ条件を揃えた
- `web/src/lib/dailyReview.js` を追加し、`daily review` 入力の正規化、`overall_gate: unchecked` の扱い、review 系 ID 自動採番、`observation_snapshot` / `price_gate` / `status_event` の 3 record 同時追記を pure helper に閉じた
- `web/src/lib/browserRecordStore.js` に review append API を追加し、`localStorage` 永続化を home/detail で共有できるようにした
- `web/src/render/dailyReviewForm.js` を追加し、`detail.html?mode=review` で shared `daily review form` を表示できるようにした
- `web/src/pages/detail.js`, `web/src/render/detailPage.js`, `web/src/render/homePage.js`, `web/styles.css` を更新し、home/detail から `Add Daily Review` を開き、submit 後に detail view へ戻す導線を実装した
- `web/src/lib/formatters.js` と `scripts/check.mjs` を更新し、unchecked gate 表示と append path の自動検証を追加した
- `status/current.md`, `status/closed.md`, `status/next.md`, `plan/active.md`, `backlog/20260325_daily-review-append-path.md` を更新し、完了状態と次着手を同期した

## 実装判断
- review 追加は `scenario form` と混ぜず、`detail.html` の `mode=review` に寄せて shared surface を維持した
- `status_event.from_status` は form 入力を信じず、records 上の最新状態から導出して append-only 一貫性を崩さないようにした
- `overall_gate: unchecked` のときだけ 5 つの gate sub-check を `null` に正規化し、`Watch` 継続レビューを失敗判定と混同しないようにした
- `prototypeClock` は append した review 時刻の最新値へ進め、home の due 判定と as-of 表示が review 追加直後に更新されるようにした

## 検証
- `npm run check`
- `appendDailyReviewRecords` の pass / unchecked 2 ケースで、3 record 追加、参照整合、`scenario_current_view` 更新、detail history latest-first を確認した
- この環境ではブラウザを開いての手動確認までは未実施

## 次にやること
- `20260325_operator-surface-hardening.md` に進み、home/detail で判断理由、観測根拠、価格鮮度を一瞥で読める surface を追加する
