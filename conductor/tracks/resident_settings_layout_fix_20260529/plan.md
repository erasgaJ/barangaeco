# Implementation Plan: Resident Settings Layout Fix

## Overview

Two phases. Phase 1 creates the `RoleAwareLayout` wrapper component with a test. Phase 2 wires it into `app.jsx` and runs quality gates.

The entire fix touches two files in production code:
1. `resources/js/layouts/role-aware-layout.jsx` — new component (created in Phase 1)
2. `resources/js/app.jsx` — one-line swap (done in Phase 2)

---

## Phase 1: RoleAwareLayout Component

**Goal:** A tested React component that reads `auth.user.role` and renders the correct outer shell.

Tasks:

- [x] Task: Write a Pest feature test that asserts a resident visiting `/settings/profile` receives an Inertia response whose `component` is a settings page (backend already works — this confirms the route is accessible to residents and the shared `auth.user.role` prop equals `'resident'`). Run it to confirm it passes, establishing the baseline.
  - File: `tests/Feature/ResidentSettingsLayoutTest.php`
  - Use `php artisan make:test --pest ResidentSettingsLayoutTest`
  - Assert: `$response->assertInertia(fn ($page) => $page->where('props.auth.user.role', 'resident'))`

- [x] Task: Create `resources/js/layouts/role-aware-layout.jsx`.
  - Import `usePage` from `@inertiajs/react`, `AdminLayout`, and `ResidentLayout`.
  - Read `auth.user?.role` from `usePage().props`.
  - If role is `'resident'` render `<ResidentLayout>`, otherwise render `<AdminLayout>`.
  - Export as default.

- [x] Verification: Run `npm run lint:check` and `npm run format:check` to confirm the new file is clean. [checkpoint marker]

---

## Phase 2: Wire Into app.jsx + Quality Gates

**Goal:** Replace `AdminLayout` with `RoleAwareLayout` in the settings case of the Inertia layout resolver, then pass all quality gates.

Tasks:

- [x] Task: In `resources/js/app.jsx`:
  - Add import: `import RoleAwareLayout from '@/layouts/role-aware-layout';`
  - Change the settings case from `return [AdminLayout, SettingsLayout];` to `return [RoleAwareLayout, SettingsLayout];`

- [x] Task: Run `npm run build` to confirm no Vite/TypeScript errors with the updated import graph.

- [x] Task: Run the full quality gate suite and confirm all checks pass:
  ```bash
  php artisan test --compact --filter=ResidentSettingsLayout
  npm run lint:check
  npm run format:check
  ```

- [x] Task: Commit Phase 1 and Phase 2 together as one atomic fix commit: [f2bc239]
  ```bash
  git add resources/js/layouts/role-aware-layout.jsx resources/js/app.jsx tests/Feature/ResidentSettingsLayoutTest.php
  git commit -m "phase(1-2): role-aware layout wrapper for resident settings pages"
  ```

- [x] Verification: Manually log in as a resident account and navigate to `/settings/profile`. Confirm the green sidebar with "Resident Portal" is shown. Log in as an admin and confirm the blue sidebar with "Admin Portal" is shown. [checkpoint marker]
