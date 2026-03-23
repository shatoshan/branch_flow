# Repository Guidelines

## Project Overview
BranchFlow is a scenario terminal for conditional option-buying decisions under uncertainty.
- It does not forecast direction.
- It monitors observable conditions and promotes only eligible scenarios.
- It rejects low-quality candidates before surfacing trade ideas.

## README vs AGENTS
- `AGENTS.md`: agent entry point and operating manual.
- Live task state belongs in `status/`.
- Active execution planning belongs in `plan/`.

## Agent Startup Protocol
1. Read `AGENTS.md`.
2. Read `status/current.md`.
3. Read `plan/active.md`.
4. Open the relevant backlog item in `backlog/`.
5. Inspect related `materials/` and recent `worklog/` entries when needed.
6. Confirm acceptance criteria and verification steps before editing.

## Directory Roles
- `backlog/`: canonical task definitions, one Markdown file per task
- `status/`: lightweight state index
- `plan/`: active plans, milestones, and phase breakdowns
- `worklog/`: chronological Japanese implementation logs
- `materials/`: research notes, reference docs, and product background

## Operating Rules
- backlog metadata is the canonical task state
- `status/` must match backlog state
- keep `AGENTS.md` small; do not store live task notes here
- write `worklog/` in Japanese
- commit changes per work unit
- push at each milestone boundary
- keep durable rationale in `materials/` or a future `decisions/` directory if added
