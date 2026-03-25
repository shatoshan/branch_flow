# 20260325 Scenario Form Foundation Execution Plan

## Intent
`backlog/20260325_scenario-form-foundation.md` を implementation-ready にし、最小 write path の最初の 1 本を迷わず着手できる状態にする。

## Fixed Decisions
- `scenario_current_view` と detail selector は既存の pure read path をそのまま使い、write path は records snapshot を更新して再描画する
- `scenario form` の共通 surface は `detail.html` に寄せる
- home の `New Scenario` は `detail.html?mode=new` を開く
- detail の `Edit Scenario` は `detail.html?scenario=<id>&mode=edit` を開く
- create save 後は `index.html` に戻し、新規 `scenario` が `Watch` に見えることを最初の成功条件にする
- edit save 後は同じ `detail.html?scenario=<id>` に戻し、reload 後も固定 fields が維持されることを確認する
- `current_status` は引き続き `status_event` 最新行または `current_status_seed` から導出し、form は `status_event`, `observation_snapshot`, `price_gate` を直接変更しない
- 新規 `scenario` の `current_status_seed` は `watch` 固定とし、既存 `scenario` edit では seed も変更対象に含めない

## Current Gaps
- [home.js](/Users/shingo/dev/branch_flow/web/src/pages/home.js) と [detail.js](/Users/shingo/dev/branch_flow/web/src/pages/detail.js) は `prototypeRecords` を直接読んでおり、永続化境界がない
- [homePage.js](/Users/shingo/dev/branch_flow/web/src/render/homePage.js) と [detailPage.js](/Users/shingo/dev/branch_flow/web/src/render/detailPage.js) の action は placeholder のまま
- `scenario` 固定 fields の form renderer / serializer / validation が未実装
- [scripts/check.mjs](/Users/shingo/dev/branch_flow/scripts/check.mjs) は read-only path の確認に留まっている

## Implementation Order
### 1. Pure Draft / Mutation Layer
- `scenario` の create/update を pure function で扱う helper を追加する
- 入力正規化はここに閉じ、UI から `localStorage` 文字列処理を漏らさない
- `review_cadence` は checkbox 群で受け、helper では配列をそのまま保存する
- `tags` は comma-separated text を trim / empty 除去して配列化する
- required fields と enum 逸脱の最小 validation をここで行い、Node から `check` できる形に寄せる

### 2. Browser Record Store
- `prototypeRecords` を seed として clone し、version 付き key で `localStorage` に保存する薄い adapter を追加する
- 保存 key は `branchflow.prototype-records.v1` とし、後続 backlog の reset/export を追加しやすくする
- store は `loadRecords()` と `saveRecords()` を中心にし、reactive subscription は入れない
- `scenario` update 時も `observationSnapshots`, `priceGates`, `statusEvents`, `prototypeClock` はそのまま保持する

### 3. Shared Scenario Form Surface
- `detail.html` を `mode=view | edit | new` の 3 状態で扱う
- `mode=new` では空の draft を描画し、保存後は home へ戻す
- `mode=edit` では既存 `scenario` を初期値にした form を描画し、保存後は detail view に戻す
- form 自体は shared renderer に切り出し、home と detail で別実装しない
- `scenario_id` は create 時のみ編集可能にし、edit 時は read-only で扱う

### 4. Home Wiring
- home は store から records を読むように変更する
- `New Scenario` action は `detail.html?mode=new` へ差し替える
- 保存後に home を開き直したとき、新規 `scenario` が `Watch` に出ることを確認する
- due filter と status grouping は現行ロジックをそのまま維持する

### 5. Detail Wiring
- detail は store から records を読み、`scenario` 不在時は `mode=new` なら form、通常時は missing message を出す
- edit save 後は selector を再実行し、`Scenario Thesis` と `Current View` の整合を保つ
- 既存の observation / gate / status history は read-only のまま残す

### 6. Verification
- pure helper を [scripts/check.mjs](/Users/shingo/dev/branch_flow/scripts/check.mjs) から読み、create/update で `scenario` 以外の配列が変わらないことを確認する
- `npm run check`
- ブラウザで `detail.html?mode=new` から `scenario` を登録し、home の `Watch` に追加されることを確認する
- 登録した `scenario` の detail から edit を開き、fixed fields 更新と reload persistence を確認する

## File-Level Next Actions
1. `web/src/lib` に pure draft / mutation helper を追加する
2. `web/src/lib` に browser record store を追加する
3. `web/src/render` に shared scenario form renderer を追加する
4. [detail.js](/Users/shingo/dev/branch_flow/web/src/pages/detail.js) と [detailPage.js](/Users/shingo/dev/branch_flow/web/src/render/detailPage.js) を `mode` 対応にする
5. [home.js](/Users/shingo/dev/branch_flow/web/src/pages/home.js) と [homePage.js](/Users/shingo/dev/branch_flow/web/src/render/homePage.js) の action を store / new route に接続する
6. [scripts/check.mjs](/Users/shingo/dev/branch_flow/scripts/check.mjs) を write path helper まで広げる

## Out Of Scope
- `daily review form` と append-only review records
- seed reset, JSON export/import
- `scenario` 既存履歴の編集や削除
- `status_event` を使わない直接 status 書き換え

## Risks And Controls
- form から review 配列を触ってしまう risk は、mutation helper を `scenario` 専用に限定して防ぐ
- browser 専用 API が `check` を壊す risk は、pure helper と `localStorage` adapter を分離して抑える
- enum の揺れで import-friendly key が崩れる risk は、select / checkbox を優先し free text を tags と notes に絞る
- duplicate `scenario_id` の扱いが曖昧になる risk は、create 時も helper では upsert として扱い、save 後の遷移で結果を確認しやすくする
