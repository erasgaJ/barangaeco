# Implementation Plan: Mobile API — Resident Announcements Feed

## Overview

Two phases. Phase 1 builds and tests the core read-only API endpoints (index + show) with all edge cases. Phase 2 runs quality gates and commits. No migrations are needed — the `announcements` table already exists.

**Endpoints delivered:**
- `GET /api/resident/announcements` — paginated published feed
- `GET /api/resident/announcements/{announcement}` — single announcement detail

---

## Phase 1: Controller, Routes, and Tests

**Goal:** Both endpoints exist, pass all test cases, and match the patterns established by `ComplaintController` and `DocumentRequestController`.

### Tasks

- [x] Task: Add `collectorsOnly()` factory state to `AnnouncementFactory`

  `AnnouncementFactory` already has a `scheduled()` state. Add a `collectorsOnly()` state that sets `target_audience` to `'collectors'` and `published_at` to `now()`. This state is needed before writing tests so factories can construct the fixture data cleanly.

  TDD: No dedicated test for the factory state itself — it is exercised implicitly by the controller tests that follow.

- [x] Task: Write failing tests for `GET /api/resident/announcements` (index)

  Create `tests/Feature/Api/Resident/AnnouncementApiTest.php` using the helper function pattern from `ComplaintApiTest.php`. Define a `residentWithAnnouncementToken()` (or reuse the same name scoped to this file) helper that creates a Barangay, resident User, Resident record, and Sanctum token.

  Write these failing tests (Red):
  - Returns 401 when unauthenticated.
  - Returns 200 with paginated structure when authenticated.
  - Returns only published announcements (`published_at <= now()`); scheduled/unpublished are excluded.
  - Returns only `all` and `residents` target_audience; `collectors`-only announcements are excluded.
  - Results are ordered by `published_at` descending.
  - Paginated at 15 per page (create 16, assert `data` has 15 and `next_page_url` is present).

  Run `php artisan test --compact --filter=AnnouncementApiTest` — all should fail with 404 (route not registered yet).

- [x] Task: Write failing tests for `GET /api/resident/announcements/{id}` (show)

  In the same test file, add:
  - Returns 200 with full announcement when authenticated and the announcement is published + resident-visible.
  - Returns 401 when unauthenticated.
  - Returns 404 when announcement does not exist.
  - Returns 403 when announcement is not published (`published_at` is null — use `scheduled()` factory state).
  - Returns 403 when announcement is published but `target_audience` is `collectors` (use new `collectorsOnly()` state).

  Run tests — all show failures.

- [x] Task: Create `Api\Resident\AnnouncementController` with `index` and `show` methods

  Create `app/Http/Controllers/Api/Resident/AnnouncementController.php`.

  `index` method:
  - Returns `response()->json(...)` of a paginated query.
  - Filters: `whereNotNull('published_at')`, `where('published_at', '<=', now())`, `whereIn('target_audience', ['all', 'residents'])`.
  - Ordered `latest('published_at')`, paginated at 15.

  `show` method:
  - Accepts `Announcement $announcement` via route model binding.
  - Aborts with 403 if `published_at` is null or in the future.
  - Aborts with 403 if `target_audience` is `'collectors'`.
  - Returns `response()->json($announcement)` on success.

  No auth guard logic in the controller — that is handled at the route group level.

- [x] Task: Register the announcements routes in `routes/api.php`

  Inside the existing `role:resident,admin` resident middleware group, add:

  ```php
  Route::apiResource('announcements', AnnouncementController::class)
      ->only(['index', 'show']);
  ```

  Add the corresponding `use` import for `AnnouncementController as ResidentAnnouncementController` (alias to avoid collision with any future admin import in the same file).

- [x] Task: Run tests to green

  Run `php artisan test --compact --filter=AnnouncementApiTest`.

  All tests should pass. If any fail, fix the controller/factory/routes until green. Do not move on while red.

- [x] Verification: Manual spot-check [checkpoint: 0f9c657]

  Using a REST client (or `curl`) against `https://barangaeco.test`:

  1. Obtain a resident token via `POST /api/auth/login`.
  2. `GET /api/resident/announcements` — confirm paginated JSON with only published resident-visible announcements.
  3. `GET /api/resident/announcements/{id}` for a valid published announcement — confirm 200 and full fields.
  4. `GET /api/resident/announcements/{id}` for a scheduled (unpublished) announcement — confirm 403.
  5. `GET /api/resident/announcements` without token — confirm 401.

---

## Phase 2: Quality Gates and Commit

**Goal:** All code quality checks pass and the phase is committed.

### Tasks

- [ ] Task: Run PHP formatter

  ```bash
  vendor/bin/pint --dirty --format agent
  ```

  Fix any style issues reported before proceeding.

- [ ] Task: Run full test suite

  ```bash
  php artisan test --compact
  ```

  All tests (not just `AnnouncementApiTest`) must pass. Fix any regressions.

- [ ] Task: Run frontend quality checks

  ```bash
  npm run lint:check
  npm run format:check
  npm run types:check
  ```

  No frontend files are modified in this track, so these should pass trivially. If any fail, investigate unrelated drift.

- [ ] Task: Commit

  ```bash
  git add app/Http/Controllers/Api/Resident/AnnouncementController.php
  git add database/factories/AnnouncementFactory.php
  git add routes/api.php
  git add tests/Feature/Api/Resident/AnnouncementApiTest.php
  git commit -m "phase(1): mobile API resident announcements feed — index and show endpoints"
  ```

- [ ] Verification: Final checkpoint [checkpoint marker]

  Confirm:
  - `php artisan test --compact` is green.
  - `vendor/bin/pint --dirty --format agent` reports no changes.
  - Commit is present in `git log`.
