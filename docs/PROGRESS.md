# InventoryPilot — Progress Dashboard

**Last updated:** 2026-10-14  
**Roadmap:** 10 weeks  
**Current milestone:** Week 3 — Authentication and onboarding; preparing Week 4

| Week | Focus | Status | Documentation |
|---|---|---|---|
| 1 | Setup and foundations | Marked complete in Notion (12/12) | Not yet written |
| 2 | Backend routes and validation | Marked complete in Notion (12/12) | Not yet written |
| 3 | Auth and onboarding | Tasks 1–7 marked complete in Notion; Tasks 8–9 reported completed in conversation; verify final repo/PR | [Week 3 recap](weekly/week-03-auth-and-onboarding.md) |
| 4 | Ingredient list and add form | Not started | Planned |
| 5 | Stock updates and audit log | Not started | Planned |
| 6 | Low-stock alerts | Not started | Planned |
| 7 | Mobile UI and TypeScript tightening | Not started | Planned |
| 8 | Deployment | Not started | Planned |
| 9 | User testing and bug fixes | Not started | Planned |
| 10 | Documentation and wrap-up | Not started | Planned |

## Latest milestone — Week 3 Tasks 7–9

- **Task 7 — Business redirects:** Redirect users based on business membership count (`0` → create; `1` → inventory; `>1` → selection). Marked complete in Notion; previously encountered an issue adding a second business, so retest that path as needed.
- **Task 8 — Protected routes:** React Router wrapper checks the Supabase session and redirects logged-out users to `/login`. Implementation discussed and user indicated the setup was complete; full browser test/build evidence not independently reviewed here.
- **Task 9 — API authorization:** No token → `401` (observed); fake token → `401` (user-confirmed); disallowed role → `403` (user-confirmed); user reported completing remaining tests, but cross-business `403` and authorized `200` response details were not shared.

## Next action
1. Confirm Week 3 final code is committed/merged and tests 4–5 are documented with status codes.
2. Begin Week 4 Task 1: `AppContext` holding `user`, `currentBusiness`, `businesses`, and `setCurrentBusiness`, with safe persistence of the selected business.
3. Continue Week 4 Task 2: `lib/api.ts` wrapper to inject the current business slug.

## Verification notes
The checkmarks and statuses reflect the roadmap and conversation, not an independent inspection of the local Windows checkout. Update after checking Git branches, PRs, builds, and tests.
