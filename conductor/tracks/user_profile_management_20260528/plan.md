# Implementation Plan: User Profile Management

**Track ID:** `user_profile_management_20260528`
**Spec:** `conductor/tracks/user_profile_management_20260528/spec.md`

---

## Overview

The backend (controllers, routes, form requests, validation) is already implemented by the Laravel starter template. The work is:

1. **Phase 1** — Integrate settings pages into `AdminLayout` (layout wiring + sidebar entry).
2. **Phase 2** — Add account info panel to the profile page (read-only role + joined date display).
3. **Phase 3** — Test coverage for all HTTP interactions (profile update, password update, page renders with admin layout).
4. **Phase 4** — Quality gates (lint, format, types, full test run).

No new routes, controllers, or form request classes are needed. All backend logic is already present and tested at a basic level; this track extends coverage and connects the frontend.

---

## Phase 1: Admin Shell Integration

**Goal:** Settings pages render inside `AdminLayout` with a Settings link in the admin sidebar.

### Tasks

- [x] Task: Add "Settings" nav entry to `AdminLayout` — import `Settings` icon from `lucide-react`, add a nav item with `href="/settings/profile"` that highlights when `url.startsWith('/settings')`.

  TDD: Write a test that loads `/settings/profile` as an authenticated admin and asserts the Inertia component is `settings/profile` (page renders, not a redirect). This test already exists in `ProfileUpdateTest` (`profile page is displayed`) — confirm it still passes as a baseline before making changes.

- [x] Task: Update `resources/js/pages/settings/profile.jsx` to use `AdminLayout` as the outer persistent layout.

  The page's `Component.layout` static property currently defines only breadcrumbs. Change it to set `AdminLayout` as the layout wrapper (following the Inertia v3 layout prop pattern used by other admin pages). Wrap inner content with `SettingsLayout` to preserve the tab navigation between Profile / Security / Appearance.

- [x] Task: Update `resources/js/pages/settings/security.jsx` to use `AdminLayout` as the outer persistent layout, same approach as profile page.

- [x] Task: Update `resources/js/pages/settings/appearance.jsx` to use `AdminLayout` as the outer persistent layout for consistency.

- [x] Verification: Navigate to `https://barangaeco.test/settings/profile` in a browser. The admin sidebar should be visible. The inner Settings tab nav (Profile / Security / Appearance) should render. Clicking the sidebar "Settings" link from another admin page should work. [checkpoint Phase 1] [c4b568e]

---

## Phase 2: Account Info Panel [checkpoint Phase 2] [0e15bac]

**Goal:** Profile settings page shows a read-only panel with the user's role and join date.

### Tasks

- [x] Task: Create `resources/js/components/account-info-panel.jsx` — a read-only display component that accepts `role` and `createdAt` props and renders them as labeled fields (using Shadcn/ui `Card` or plain `div` with Tailwind styling consistent with the admin app style). Format role as title case (e.g., `"admin"` → `"Admin"`). Format `createdAt` as a localized date string (e.g., `new Date(createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })`). [8a1e9df]

  TDD: No backend test needed. This is a pure presentational component; verify via the Phase 2 verification step.

- [x] Task: Import and render `AccountInfoPanel` in `resources/js/pages/settings/profile.jsx`, passing `auth.user.role` and `auth.user.created_at` from `usePage().props`. Place it below the profile form and above `DeleteUser`. [8a1e9df]

- [x] Verification: On the profile settings page, a panel showing "Role: Admin" and "Member since: [date]" is visible. [checkpoint Phase 2] [0e15bac]

---

## Phase 3: Test Coverage

**Goal:** Feature tests cover all HTTP interactions. Existing tests must not regress.

### Tasks

- [ ] Task: Review existing tests in `tests/Feature/Settings/ProfileUpdateTest.php` and `tests/Feature/Settings/SecurityTest.php`. Confirm all existing tests pass with `php artisan test --compact --filter=Settings`.

- [ ] Task: Add test — `profile page requires authentication` — unauthenticated `GET /settings/profile` redirects to login. Add to `ProfileUpdateTest.php`.

- [ ] Task: Add test — `profile page returns correct Inertia component` — authenticated request returns component `settings/profile` with `mustVerifyEmail` prop. Add to `ProfileUpdateTest.php`.

  TDD cycle: Write failing assertion for Inertia component and props → run to confirm red → implement (no backend change needed, just asserting existing behavior) → green.

- [ ] Task: Add test — `password update requires authentication` — unauthenticated `PUT /settings/password` redirects to login. Add to `SecurityTest.php`.

- [ ] Task: Add test — `security page requires authentication` — unauthenticated `GET /settings/security` redirects to login. Add to `SecurityTest.php`.

- [ ] Task: Add test — `profile update requires name` — `PATCH /settings/profile` with empty name returns validation error on `name` field. Add to `ProfileUpdateTest.php`.

- [ ] Task: Add test — `profile update rejects duplicate email` — `PATCH /settings/profile` with an email already belonging to another user returns validation error on `email`. Add to `ProfileUpdateTest.php`.

- [ ] Task: Add test — `password update requires matching confirmation` — `PUT /settings/password` with mismatched `password` and `password_confirmation` returns validation error. Add to `SecurityTest.php`.

- [ ] Verification: Run `php artisan test --compact --filter=Settings`. All tests green, no regressions. [checkpoint Phase 3]

---

## Phase 4: Quality Gates

**Goal:** All linting, formatting, type checking, and tests pass.

### Tasks

- [ ] Task: Run `vendor/bin/pint --dirty --format agent` to auto-fix any PHP style issues introduced by new test code.

- [ ] Task: Run `npm run lint:check` — fix any ESLint issues in new/modified JSX files.

- [ ] Task: Run `npm run format:check` — fix any Prettier issues.

- [ ] Task: Run `npm run build` — confirm frontend builds without errors (required before manual verification).

- [ ] Task: Run `php artisan test --compact` — confirm full test suite is green.

- [ ] Verification: All quality gate commands exit with code 0. [checkpoint Phase 4]
