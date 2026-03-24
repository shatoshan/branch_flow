# BranchFlow

BranchFlow is a local scenario terminal for conditional option-buying decisions under uncertainty.
It does not forecast direction. It keeps manual-first scenario review visible through `Watch / Eligible / Rejected / Invalidated` states.

## Prototype
- `web/`: static home/detail prototype
- `web/src/data/sampleRecords.js`: downside-first sample records for `scenario`, `observation_snapshot`, `price_gate`, `status_event`
- `web/src/lib/scenarioViews.js`: `scenario_current_view` selector
- `scripts/check.mjs`: smoke check for selector and render output

## Run Locally
1. `python -m http.server 4173 --directory web`
2. Open `http://127.0.0.1:4173/index.html`
3. Open `http://127.0.0.1:4173/detail.html?scenario=NKY-D-001`

## Verify
- `node scripts/check.mjs`
