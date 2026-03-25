# 2026-03-25 Scenario Form Foundation Planning

## 実施内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260325_scenario-form-foundation.md`, `plan/20260325_input-write-path.md` を確認し、planning 対象の前提と acceptance を揃えた
- `web/src/pages/home.js`, `web/src/pages/detail.js`, `web/src/render/homePage.js`, `web/src/render/detailPage.js`, `web/src/lib/scenarioViews.js`, `scripts/check.mjs` を読み、read-only prototype の境界と write path を差し込む位置を確認した
- `plan/20260325_scenario-form-foundation-execution.md` を追加し、shared form surface の置き場所、store の責務、実装順、verification を固定した
- `plan/active.md` と `status/current.md` を更新し、現在の主対象と next action の参照先を execution plan に同期した

## 判断
- `scenario form` の最小実装は新規ページ追加よりも、`detail.html` を `mode=new | edit | view` で共有 surface にする方が薄い
- `localStorage` adapter と pure helper を分離しておくと、`npm run check` を維持したまま create/update の検証を足せる
- `review_cadence` は free text にせず checkbox に寄せた方が enum ぶれを防げる
- `tags` は comma-separated text のままでも import-friendly を大きく損なわない

## 検証
- `status/current.md`, `plan/active.md`, 新規 execution plan の参照が噛み合っていることを確認した
- execution plan の内容が backlog の scope / acceptance / verification に反していないことを確認した

## 次にやること
- `web/src/lib` に pure draft / mutation helper と browser record store を追加する
- `detail.html` 側に shared `scenario form` を接続し、create/edit/save/redirect を実装する
- `home` の `New Scenario` action を新規 form route に接続し、`npm run check` と手動確認を通す

## 実装内容
- `web/src/lib/scenarioDraft.js` を追加し、stable thesis の draft 正規化、enum validation、create/update の pure helper を実装した
- `web/src/lib/browserRecordStore.js` を追加し、`prototypeRecords` seed を clone する `localStorage` adapter と upsert 保存導線を実装した
- `web/src/render/scenarioForm.js` を追加し、`detail.html` で共有する `scenario form` renderer を実装した
- `web/src/pages/home.js` を store 読み込みへ切り替え、home の `New Scenario` action を `detail.html?mode=new` に接続した
- `web/src/pages/detail.js` と `web/src/render/detailPage.js` を更新し、`mode=new | edit | view` の 3 状態と create/edit/save/redirect を実装した
- `web/styles.css` を更新し、form panel, field grid, checkbox, error state のスタイルを追加した
- `scripts/check.mjs` を拡張し、scenario create/update が `scenario` 以外の配列を変えないことと、新しい detail render path を検証するようにした

## 実装判断
- `localStorage` access は browser adapter に閉じ、`npm run check` では pure helper だけを直接検証する構成にした
- create と edit の UI は `detail.html` に寄せ、home では route を開く責務だけに絞った
- 既存 `scenario_current_view` selector は変更せず、record snapshot 更新後の再描画だけで `Watch` 反映を成立させた
- `review_cadence` は checkbox、`tags` は comma / semicolon 両対応にし、import-friendly 形の崩れを抑えた

## 実装検証
- `npm run check`
- この環境ではブラウザを開いての手動確認までは未実施
