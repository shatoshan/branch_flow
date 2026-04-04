# Current

1) 現在の主対象: `import-friendly surface` は完了。次は CSV 受け口へ寄せる列名 / キー名整理を planning する
2) 次着手バックログ: 未設定。まず `status/next.md` の CSV 候補を backlog 化する
3) 直近完了: home/detail に seed reset / JSON export / JSON import surface を追加し、shape 検証と invalid import 時の store 保護を実装した
4) ブロッカー: なし
5) 参照ファイル: [active.md](../plan/active.md), [20260331_import-friendly-surface.md](../backlog/20260331_import-friendly-surface.md), [20260331_import-friendly-surface.md](../worklog/20260331_import-friendly-surface.md), [20260331_operator-translation-guide.md](../materials/20260331_operator-translation-guide.md), [next.md](../status/next.md)
6) まず実行すること: JSON export/import surface から逆算して、CSV 受け口で共有する列名 / key 名 / nullable field policy を backlog と plan に固定する
7) 完了条件: CSV/JSON で共有する import contract が document 上で固定され、後続の受け口実装へ分割できること
