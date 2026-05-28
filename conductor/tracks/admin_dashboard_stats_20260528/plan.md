# Implementation Plan: Admin Dashboard — Real Stats and Metrics

## Overview

Three phases. Phase 1 fixes the controller (data shaping bugs + real monthly count). Phase 2 fixes the frontend to consume the corrected shape. Phase 3 adds proper feature test coverage for all props.

All work is in two files: `DashboardController.php` and `dashboard.jsx`. No migrations, no new models, no new routes required.

---

## Phase 1: Fix DashboardController — correct data shape

**Goal:** Controller passes correctly shaped data — real `residents_this_month` count, `zone_name` per schedule, `status_update` singular object per schedule, and `resident_name` per document request. No stale `barangay` eager load.

### Tasks

- [x] Task: Write failing tests for `stats` shape (Red)

  Write a Pest feature test in `tests/Feature/DashboardTest.php` that:
  - Seeds known data using factories (e.g., 3 residents created this month, 2 pending document requests, 1 open complaint, 1 published today-schedule)
  - GETs `route('dashboard')` as an authenticated admin user
  - Asserts `inertia()->component('admin/dashboard')`
  - Asserts the Inertia prop `stats` contains keys: `total_residents`, `pending_document_requests`, `active_routes`, `open_complaints`, `residents_this_month`
  - Asserts `stats.residents_this_month` equals the seeded count
  - Run: `php artisan test --compact --filter=DashboardTest` — should fail (key missing)

- [x] Task: Add `residents_this_month` to controller stats + fix eager load (Green)

  In `DashboardController::__invoke()`:
  - Replace `with('barangay', 'collectors', 'statusUpdates')` with `with('zone', 'collectors', 'statusUpdates')`
  - Add `'residents_this_month' => Resident::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count()` to the `stats` array
  - Run tests: `php artisan test --compact --filter=DashboardTest` — stats shape test should pass

- [x] Task: Write failing tests for `today_schedules` shape (Red)

  Extend `DashboardTest.php`:
  - Assert each item in the `today_schedules` prop has a `zone_name` key (string or null)
  - Assert each item in the `today_schedules` prop has a `status_update` key (null or array with `status` and `time` keys)
  - Seed a schedule with a zone and a `CollectionStatusUpdate`, assert `zone_name` matches zone name and `status_update.status` matches
  - Run tests — should fail (`zone_name` missing)

- [x] Task: Shape `today_schedules` in controller (Green)

  After the `$todaySchedules` query, map the collection before passing to Inertia:

  ```php
  $todaySchedules = $todaySchedules->map(function ($schedule) {
      $latestUpdate = $schedule->statusUpdates->sortByDesc('updated_at')->first();
      return array_merge($schedule->toArray(), [
          'zone_name' => $schedule->zone?->name ?? 'Unknown Zone',
          'status_update' => $latestUpdate ? [
              'status' => $latestUpdate->status,
              'time' => $latestUpdate->updated_at->format('g:i A'),
          ] : null,
      ]);
  });
  ```

  Run tests: `php artisan test --compact --filter=DashboardTest` — shape tests should pass.

- [x] Task: Write failing test for `recent_document_requests` resident_name (Red)

  Extend `DashboardTest.php`:
  - Seed a document request linked to a resident with `full_name = 'Juan Dela Cruz'`
  - Assert `recent_document_requests[0].resident_name` equals `'Juan Dela Cruz'`
  - Run tests — should fail (`resident_name` missing)

- [x] Task: Add `resident_name` mapping in controller (Green)

  Map `recent_document_requests` before passing:

  ```php
  'recent_document_requests' => DocumentRequest::with('resident')
      ->latest()
      ->limit(5)
      ->get()
      ->map(fn ($req) => array_merge($req->toArray(), [
          'resident_name' => $req->resident?->full_name ?? 'Unknown Resident',
      ])),
  ```

  Run tests: `php artisan test --compact --filter=DashboardTest` — all Phase 1 tests green.

- [x] Task: Run Pint

  ```
  vendor/bin/pint --dirty --format agent
  ```

- [x] Verification: All Phase 1 tests pass [checkpoint: cafda39] [7f23a62]

  ```
  php artisan test --compact --filter=DashboardTest
  ```

  Confirm output is all green with no failures. 7 tests, 7 passed.

---

## Phase 2: Fix Frontend — consume corrected prop shape

**Goal:** `dashboard.jsx` reads `zone_name` instead of `route_name`, reads the `status_update` object correctly, displays `residents_this_month` in the badge, and handles null gracefully.

### Tasks

- [ ] Task: Update Residents stat card badge (real monthly count)

  In `dashboard.jsx`, in the `statCards` array, change the Residents card badge from the hardcoded `'+24 this mo'` to:
  ```js
  badge: `+${stats.residents_this_month} this mo`,
  ```

- [ ] Task: Update Today's Waste Collection — use `zone_name` instead of `route_name`

  In the `today_schedules.map()` render block, change:
  ```js
  {schedule.route_name}
  ```
  to:
  ```js
  {schedule.zone_name ?? 'Unknown Zone'}
  ```

- [ ] Task: Confirm `status_update` consumption is consistent with new shape

  The frontend already reads `schedule.status_update?.status` and `schedule.status_update?.time`. Now that the controller passes a proper shaped object (not a collection), confirm:
  - `RouteIcon` receives `schedule` with `status_update` as the shaped object — no change needed to reading pattern.
  - The completed-time display `schedule.status_update?.time` will now render the formatted time string from the controller.
  - No JS-side transformation needed — just verify no `statusUpdates` (plural) references remain in the JSX file.

- [ ] Task: Run lint and format checks

  ```
  npm run lint:check
  npm run format:check
  ```

  Fix any issues with `npm run lint` and `npm run format`.

- [ ] Verification: Build and visual smoke check [checkpoint marker]

  ```
  npm run build
  ```

  Open `https://barangaeco.test/admin/dashboard` and verify:
  - The Residents card badge shows "+N this mo" with a real number (not "+24").
  - Today's Waste Collection route cards display zone names.
  - The Recent Certificate Requests table shows resident full names.
  - Status icons render (green check for completed, blue truck for others).
  - No JS console errors.

---

## Phase 3: Complete test coverage

**Goal:** All spec acceptance criteria have test coverage. Run the full CI suite clean.

### Tasks

- [ ] Task: Add edge-case tests to `DashboardTest.php`

  Add tests for:
  - Dashboard with zero residents this month — `stats.residents_this_month` equals 0
  - Dashboard with no today schedules — `today_schedules` is empty array
  - Dashboard with a schedule that has no zone (null zone_id) — `zone_name` is `'Unknown Zone'`
  - Dashboard with a schedule that has no status update — `status_update` is null
  - Dashboard with no recent document requests — `recent_document_requests` is empty array
  - Dashboard with a document request whose resident is null (edge case) — `resident_name` is `'Unknown Resident'`
  - Guest redirect test (already exists — verify it still passes)

  Run: `php artisan test --compact --filter=DashboardTest`

- [ ] Task: Run full CI suite

  ```
  composer run ci:check
  ```

  All checks must pass: Pint, tests, ESLint, Prettier, TypeScript.

- [ ] Verification: Full CI green [checkpoint marker]

  Confirm `composer run ci:check` exits with code 0. All dashboard tests pass. No regressions in other test files.

---

## Commit Strategy

- After Phase 1: `git commit -m "phase(1): fix dashboard controller — zone eager load, resident name, status_update shape, monthly count"`
- After Phase 2: `git commit -m "phase(2): fix dashboard frontend — zone_name, real monthly badge, status_update consumption"`
- After Phase 3: `git commit -m "phase(3): dashboard stats test coverage — edge cases and full CI green"`
