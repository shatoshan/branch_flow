# BranchFlow

BranchFlow is a local scenario terminal for conditional option-buying decisions under uncertainty.
It does not forecast direction. It keeps manual-first scenario review visible through `Watch / Eligible / Rejected / Invalidated` states.

## Prototype
- `web/`: static home/detail prototype
- `web/src/data/sampleRecords.js`: downside-first sample records for `scenario`, `observation_snapshot`, `price_gate`, `status_event`
- `web/src/lib/scenarioViews.js`: `scenario_current_view` selector
- `web/dist/*.bundle.js`: `file://` 直開き用の browser bundle
- `scripts/build-web-bundle.mjs`: `web/src` から browser bundle を再生成
- `scripts/check.mjs`: smoke check for selector and render output

## Run Locally
1. `npm run build:web`
2. Open `web/index.html`
3. Open `web/detail.html?scenario=NKY-D-001`

HTTP で確認したい場合:
- `npm run serve`
- Open `http://127.0.0.1:4173/index.html`
- Open `http://127.0.0.1:4173/detail.html?scenario=NKY-D-001`

## Verify
- `npm run check`
