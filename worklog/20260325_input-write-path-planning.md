# 2026-03-25 Input Write Path Planning

## 実施内容
- `AGENTS.md`, `status/current.md`, `plan/active.md` を確認した
- `backlog/20260324_prototype-build.md`, `plan/20260324_manual-ops-spec.md`, `plan/20260324_product-skeleton.md`, `materials/20260324_prototype-stack.md`, 直近 worklog を読み、read-only prototype の完了境界と次の入力面要件を整理した
- `web/` の現状を確認し、`scenario_current_view` selector と home/detail の action 導線がそのまま write path に拡張できることを確かめた
- `plan/20260325_input-write-path.md` を追加し、next action の優先順位、`localStorage` 前提の最小保存面、backlog の分割方針を固定した
- `backlog/20260325_scenario-form-foundation.md` と `backlog/20260325_daily-review-append-path.md` を追加し、`scenario form` 先行の実装順を backlog 化した
- `status/current.md`, `status/next.md`, `plan/active.md` を更新し、現在の主対象と次着手順を同期した

## 判断
- 静的 prototype のまま最小 write path を足すには、browser record store と `localStorage` を使うのが最短
- `scenario form` を先に実装すると、固定情報更新と append-only review を分離したまま保存面を固められる
- `daily review form` では `overall_gate: unchecked` を明示しないと `Watch` 継続と gate fail の差が崩れる
- import-friendly な seed/export surface は必要だが、最初の 2 backlog と混ぜると検証軸が増えすぎるため 3 番目に置く

## 検証
- planning, backlog, status の相互参照が矛盾しないことを確認した

## 次にやること
- `scenario form` foundation を実装し、home/detail の両方から `scenario` を新規登録 / 更新できるようにする
- 後続で `daily review form` と append-only review records を追加する
