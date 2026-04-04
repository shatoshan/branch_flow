# 20260331 Import-Friendly Surface

Status: done
Prerequisite: backlog/20260325_japanese-operator-surface.md
Worklog: worklog/20260331_import-friendly-surface.md
Result: web/, scripts/check.mjs

## Goal
browser record store を operator が壊さず持ち運べるようにし、seed reset と JSON export / import をまとめた import-friendly surface を整える。

## Scope
- home / detail に seed reset, JSON export, JSON import の導線を追加する
- export では既存 record model の shape をそのまま JSON として保存できるようにする
- import では shape 検証と失敗時エラー表示を行い、破損 JSON で store を壊さない
- seed reset は sample records への復元に限定し、operator が現状 store を失うことを UI 上で明示する
- import/export/reset 後に home/detail の current view が即時再描画されるようにする

## Acceptance Criteria
- operator がブラウザ上で sample seed への復元、現行 records の export、export 済み JSON の import を一通り実行できる
- JSON shape, field 名, ID, enum は既存 record model から変わらない
- invalid JSON や不足 field を import しても既存 store が壊れず、修正可能なエラーが表示される
- reset / import 後に home/detail の scenario count, status 列, detail history が整合した状態に戻る

## Verification
- `npm run check`
- ブラウザで export -> reset -> import の往復を行い、home/detail の表示が元に戻ることを確認する
- import 時に invalid JSON を与え、store 不変とエラー表示を確認する

## Risks
- import 失敗時に部分反映が起きると record 参照整合が壊れる
- reset 導線が軽すぎると operator が意図せず sample seed に戻してしまう
- export/import 導線を急ぎすぎると browser record store と render 再描画の責務が混ざる
