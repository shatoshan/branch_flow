# 2026-03-31 Import-Friendly Surface

## 実装内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260331_import-friendly-surface.md`, `materials/20260331_operator-translation-guide.md`, 直近 worklog を確認し、record model を変えずに import/export/reset を追加する方針で着手した
- `web/src/lib/browserRecordStore.js` を拡張し、records snapshot の厳密な shape 検証、JSON parse/export helper、sample seed reset、JSON import の store 置換 API を追加した
- `web/src/render/operatorSurface.js`, `web/src/pages/operatorSurface.js` を追加し、home/detail 共通で使う operator surface と browser-side binding を分離した
- `web/src/render/homePage.js`, `web/src/render/detailPage.js`, `web/src/pages/home.js`, `web/src/pages/detail.js`, `web/styles.css` を更新し、JSON export, sample seed reset, JSON import, 成功 notice, import error 表示を home/detail から開けるようにした
- `scripts/check.mjs` を更新し、render surface 表示、export JSON の再読込、invalid import の検証、localStorage スタブ上での export -> reset -> import 往復を追加した

## 実装判断
- import 時は top-level shape だけでなく field 名、enum、nullable field、ID 参照整合まで確認し、失敗時は `saveRecords` に入らないようにして部分反映を防いだ
- `sample seed に戻す` と JSON import はどちらも現在 store を丸ごと置き換えるため、helper copy と confirm を両方入れて operator が誤って上書きしづらい導線にした
- detail 画面で reset/import 後に対象 scenario が消えても詰まらないよう、missing state でも operator surface は残し、その場で import し直せる構成にした

## 検証
- `npm run check`
- bundle 生成、node syntax check、render assertion、JSON parse/export validation、store roundtrip assertion が通ることを確認した
- この環境ではブラウザを開いての手動確認までは未実施

## 次にやること
- CSV 受け口へ寄せる列名 / key 名 / nullable field policy を backlog 化し、JSON import surface と矛盾しない import contract を先に固定する
