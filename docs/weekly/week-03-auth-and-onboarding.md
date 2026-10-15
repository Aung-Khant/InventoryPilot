# Week 3 Recap — Authentication & Onboarding

**Project:** InventoryPilot  
**Week:** 3 of 10  
**Covered here:** Tasks 7–9  
**Written:** 2026-10-14  
**Status:** Implementation/testing reported complete; final Git/CI verification pending

## Summary

This part of Week 3 focused on making the login experience business-aware and testing access control across the React frontend and Express backend. InventoryPilot supports multiple businesses with separated inventory data. Authentication answers **who is signed in**; business membership and role checks answer **what that person can access**.

## Task 7 — Business-based redirect after login

**Goal:** Send users to the appropriate page according to how many businesses they belong to.

| Business memberships | Expected redirect |
|---|---|
| 0 | `/create-business` |
| 1 | `/:slug/inventory` |
| 2 or more | `/select-business` |

**How it fits:** After login, the app retrieves the user's businesses (`GET /api/v1/businesses/mine`) and selects the correct destination. Selection must not grant access by itself; backend middleware validates membership on every business-scoped request.

**Status:** Marked complete on the Notion roadmap. During development, adding a second business to the same user had caused difficulties; the multi-business path may need regression testing.

## Task 8 — Protected React Router routes

**Goal:** Redirect anyone with no Supabase client session to `/login` before rendering protected frontend pages.

**Relevant files discussed:**
- `client/src/components/ProtectedRoute.tsx`
- `client/src/App.tsx`
- The existing Supabase client module

**Design:**
1. Read the client session during initial loading.
2. Show a loading state until the session check finishes.
3. Redirect unauthenticated users to `/login` via React Router `Navigate`.
4. Render authenticated child routes using `Outlet`.
5. Keep login and registration routes public.

**Testing to confirm:** anonymous URL access redirects to login; logged-in access succeeds; refresh restores session; logout blocks access. Frontend guards are UX controls, not replacements for backend authorization.

**Status:** User reported completing this task. Final code, build, and full browser test evidence were not independently inspected.

## Task 9 — Backend authorization tests

**Goal:** Verify Express middleware prevents unauthenticated, unauthorized-role, and cross-business requests.

**Middleware involved:**
- `requireAuth` — verifies the supplied Supabase token.
- `requireBusinessAccess` — ensures membership of the target business.
- `requireAdmin` — allows `OWNER` and `MANAGER`, rejects other business roles.

**Test evidence from conversation:**

| Scenario | Expected | Evidence | Status |
|---|---|---|---|
| No Authorization header | 401 | Postman screenshot showed 401 and missing/invalid header message | Passed |
| Invalid Bearer token | 401 | User reported 401 | Passed (user-confirmed) |
| Non-admin token on admin route | 403 | User reported 403 after identifying `requireAdmin` use in `server/src/index.ts` | Passed (user-confirmed; exact account not independently verified) |
| ABA-only user accesses other business | 403 | User said testing was done; response not provided | Reported complete, evidence pending |
| Authorized business user accesses own business | 200 | User said testing was done; response not provided | Reported complete, evidence pending |

**Important:** HTTP 403 alone is insufficient proof of the intended wrong-role or cross-tenant case unless the request used a valid authenticated user with the expected role/membership and an existing target business.

## Challenges and lessons

- **Frontend TypeScript errors:** Initial imports and an unused `ProtectedRoute` import prevented a clean build. Connected the wrapper to routed pages; build should be rechecked.
- **Windows PowerShell/npm:** Script execution policy blocked `npm.ps1`; `npm.cmd` or an appropriate PowerShell policy can resolve this.
- **Incorrect working directory:** Running `npm run dev` at the repository root failed because the package manifests live under `client` and `server`.
- **New-PC backend setup:** Prisma generate failed without `DATABASE_URL`. A local `server/.env` containing actual configuration was needed; keep secrets out of Git.
- **Auth versus authorization:** Route redirects are not data security. Backend requests must check both token validity and business membership/role.

## Next steps

1. Verify Task 8 frontend tests and `npm run build`.
2. Confirm Task 9 cross-business and permitted-access status codes with real distinct business memberships.
3. Ensure Week 3 code is pushed and merged through the repository workflow.
4. Start Week 4: `AppContext`, `lib/api.ts`, ingredient list, and add form.

## Security notes

Do not commit `.env`, access tokens, database URLs containing passwords, service-role keys, or screenshots exposing bearer credentials.
