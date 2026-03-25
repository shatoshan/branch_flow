# 2026-03-24 Prototype Build

## 実施内容
- `AGENTS.md`, `status/current.md`, `plan/active.md`, `backlog/20260324_prototype-build.md` を確認した
- `plan/20260324_product-skeleton.md`, `plan/20260324_manual-ops-spec.md`, `plan/20260323_mvp-onepager.md`, 直近 worklog を読み、受け入れ条件と read path の境界を整理した
- `materials/20260324_prototype-stack.md` を追加し、依存追加なしの静的 HTML / CSS / JavaScript を初期スタックとして固定した
- `web/` を追加し、home / detail の 2 画面、sample data、`scenario_current_view` selector、4 状態表示、detail の履歴 3 セクションを実装した
- `file://` 直開きでは ES modules が CORS 制約で落ちるため、`scripts/build-web-bundle.mjs` と `web/dist/*.bundle.js` を追加し、home / detail をクラシックスクリプトで開けるようにした
- `scripts/check.mjs` を追加し、4 状態、due 判定、home/detail の主要セクションを smoke check できるようにした
- `README.md`, `status/current.md`, `status/next.md`, `status/closed.md`, `plan/active.md`, `backlog/20260324_prototype-build.md` を更新した

## 判断
- 初回は build tool や framework を入れず、`manual-first` 検証に必要な read-only 骨格を最短で成立させる方がよい
- `scenario_current_view` を pure function にしておくと、後で store や SQL view に移しても UI 側の責務が崩れにくい
- `Rejected` と `Invalidated` の差は、home の最新 reason code と detail の status history を分けて見せると保ちやすい
- フォームはこの段階では接続せず、home 下部の split 表示に留める方が backlog の境界が明確になる
- ブラウザの `file://` 制約は「静的ファイルだから即起動できる」と相性が悪いため、source module は維持しつつ browser bundle を生成して配布面だけ分けるのが妥当

## 検証
- `node scripts/check.mjs`
- `python -m http.server 4173 --directory web` で `index.html` と `detail.html?scenario=NKY-D-001` が 200 を返すことを確認した
- `node scripts/build-web-bundle.mjs`
- `node --check web/dist/home.bundle.js`
- `node --check web/dist/detail.bundle.js`

## 次にやること
- `scenario form` 骨格と固定情報更新 path の backlog 化
- `daily review form` 骨格と append-only write path の追加
- seed data の import-friendly 化と JSON / CSV 受け口の整理
