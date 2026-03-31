# 2026-03-31 Operator Translation Guide

## 方針
- operator-facing UI では固定語彙を日本語表示に寄せる
- `scenario_id`, record ID, JSON key, enum 値そのものは storage / import 用に英語スネークケースのまま維持する
- formatter では固定 enum / reason / fail reason / source shorthand を日本語化し、未知の値は `snake_case` を人が読める形へ崩すだけに留める
- operator が自由入力する `notes`, `market_note`, `gate_note`, `reason_detail` は入力文を尊重し、そのまま表示する

## 主要用語
- `watch`: 監視
- `eligible`: 候補
- `rejected`: 見送り
- `invalidated`: 失効

## 状態差の扱い
- `見送り` は「今回の条件では入らない」。主因は価格条件、頻度、品質の不足
- `失効` は「仮説そのものが死んだ」。失効条件接触や時間切れで終端扱い
- UI では `price_gate_fail` 系を `見送り理由`、`thesis_broken` 系を `失効理由` として分けて表示する

## フェーズ / 価格条件
- `morning`: 朝
- `intraday`: 場中
- `after_close`: 引け後
- `weekly`: 週次
- `pass`: 通過
- `fail`: 不通過
- `unchecked`: 未確認

## 表示ポリシー
- field label は日本語化し、raw key 名を operator-facing 画面へ直接出さない
- fixed reason code と fail reason は日本語 label に変換する
- source ref や observed signal は既知 shorthand のみ日本語対応し、未対応値は fallback 表示に回す
- import/export/debug 用の surface を後から追加しても、表示専用の日本語化が record model に侵食しない構造を維持する
