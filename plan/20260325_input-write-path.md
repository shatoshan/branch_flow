# 20260325 Input Write Path Planning

## Intent
Phase 5 の read-only prototype を、手入力で 1 日のレビューを回せる最小 write path へ広げる。
この文書では、next action の優先順位、write path の形、backlog の分割境界を固定する。

## Constraints
- 初期スタックは静的 HTML / CSS / JavaScript のまま維持する
- 外部 DB や server を入れず、ブラウザだけで create/update/append を成立させる
- データ主語は `scenario`, `observation_snapshot`, `price_gate`, `status_event` の 4 record model に固定する
- `scenario_current_view` は派生 selector のまま維持し、UI はそこから読む
- キー名と enum は import-friendly を崩さない

## Next Action Decision
- 最初の着手は `scenario form` foundation とする
- `daily review form` と append-only write path はその次に置く
- import-friendly な seed / export surface は 3 番目に置く

## Why This Order
- `daily review form` は `scenario_id`, current dataset, persistence boundary が先にないと検証しづらい
- `scenario form` だけなら固定情報更新に閉じるため、状態遷移と append-only 履歴を混ぜずに保存面を固められる
- read path がすでに pure selector で分かれているため、先に record store を入れても UI 責務を崩しにくい

## Proposed Write Path Shape
### Storage Boundary
- `prototypeRecords` は seed として残し、実行時は browser record store に clone して扱う
- store は `localStorage` に全 record snapshot を保存し、home/detail が同じ state を読む
- 保存キーは version を含め、seed へ戻す reset 導線を後続で足しやすい形にする

### Mutation Rules
- `scenario form` は `scenario` のみを create/update する
- `daily review form` は 1 submit で `observation_snapshot`, `price_gate`, `status_event` を追加する
- `status_event` は必ず最新判断を閉じ、`scenario_current_view` は再計算で更新する
- `Rejected` と `Invalidated` の差は `reason_code` と append-only history で保つ

### ID / Timestamp Handling
- `scenario_id` は operator 入力を基本とし、重複時は update として扱う
- review 系 ID は prefix 付きで自動採番し、ISO 8601 timestamp を初期値にする
- `price_gate` 未確認レビューでは `overall_gate: unchecked` を許し、下位 check は `null` を許容する

## Backlog Split
### 1. Scenario Form Foundation
- browser record store を追加する
- home の `New Scenario` と detail の `Edit Scenario` を実フォームへ置き換える
- `scenario` の stable fields を新規登録 / 更新できるようにする
- save 後に home/detail を同じ store から再描画する

### 2. Daily Review Append Path
- `Add Daily Review` を append-only form にする
- `observation_snapshot`, `price_gate`, `status_event` を同一操作で追記する
- `reason_code`, `next_review_phase`, `next_review_at` を必須にする
- submit 後に current view / timeline / history が即時更新されるようにする

### 3. Import-Friendly Seed Surface
- seed reset と JSON export/import を追加する
- 将来の CSV 受け口に寄せて列名 / キー名の整合を保つ

## Verification Strategy
- `npm run check` を維持し、selector と render の既存 read path を壊していないことを確認する
- scenario create/edit の manual flow を `index.html` と `detail.html` の両方で確認する
- daily review 追加後に `Watch / Eligible / Rejected / Invalidated` の遷移、detail history, reload persistence を確認する

## Risks To Control
- `scenario` update と review append を同じ backlog で始めると検証軸が混ざる
- localStorage だけ先に入れると seed の再現性が落ちるため、reset/export を後続 backlog に明示する
- `overall_gate: unchecked` の扱いが曖昧だと `Watch` 継続と gate fail が混ざる
