# InventoryPilot — Development Documentation

This folder records progress against the 10-week InventoryPilot roadmap.

## Navigation
- [Progress dashboard](PROGRESS.md): week-by-week status and next actions.
- [Week 3: Auth and onboarding](weekly/week-03-auth-and-onboarding.md): Task 7–9 recap.
- [Weekly recap template](templates/weekly-recap-template.md): copy when a new week begins.

## Documentation convention
- Record **what was built**, **why**, **important files**, **how it was tested**, **results**, **issues**, and **next steps**.
- Distinguish **reported complete** from **verified**. A passing API test does not itself prove all code was committed or merged.
- Do not include access tokens, database connection strings, service-role keys, `.env` values, customer inventory, or personal account information.
- Store docs in Git with the same codebase, ideally as part of the weekly completion PR.

## Adding a new week
1. Copy `templates/weekly-recap-template.md` to `weekly/week-04-ingredient-list.md` (adapt the number and title).
2. Fill in task outcomes and actual test evidence.
3. Update `PROGRESS.md` and link the new recap here.
4. Commit the documentation together with your verified changes.

Source of tasks: InventoryPilot Notion Tasks roadmap. Status updated from the team's reported work in the project discussion on 2026-10-14; it is not a fresh audit of repository code or CI.
