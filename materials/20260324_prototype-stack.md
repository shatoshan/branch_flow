# 2026-03-24 Prototype Stack

## Decision
Prototype Build の初期スタックは、依存追加なしの静的 HTML / CSS / JavaScript とする。

## Why
- `manual-first` の read path を最短で確認できる
- ネットワークや package install に依存せずローカルで即起動できる
- `scenario_current_view` selector を pure function として切り出せるため、UI とデータ整合を軽量に検証しやすい

## Shape
- `web/index.html`: home
- `web/detail.html`: detail
- `web/src/data/sampleRecords.js`: seed data
- `web/src/lib/scenarioViews.js`: derived current view selector
- `scripts/check.mjs`: smoke check

## Deferred
- `scenario form` と `daily review form` の write path
- import-friendly な JSON / CSV 受け口
- 永続化レイヤー
