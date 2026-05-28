# Implementation Plan: Mobile API Zone Alignment

## Overview

Four-phase fix to align mobile API controllers with the zone refactor. Each phase targets one controller group, follows Red-Green TDD, and ends with a Pint + test verification checkpoint before committing.

Affected files:
- `app/Http/Controllers/Api/Resident/ComplaintController.php`
- `app/Http/Controllers/Api/Resident/ResidentDashboardController.php`
- `app/Http/Controllers/Api/Collector/CollectionScheduleController.php`
- `app/Http/Controllers/Api/Collector/CollectorDashboardController.php`

Existing test files to extend or create alongside:
- `tests/Feature/Api/AuthTest.php` (reference only — do not modify)
- New: `tests/Feature/Api/Resident/ComplaintApiTest.php`
- New: `tests/Feature/Api/Resident/ResidentDashboardApiTest.php`
- New: `tests/Feature/Api/Collector/CollectionScheduleApiTest.php`
- New: `tests/Feature/Api/Collector/CollectorDashboardApiTest.php`

---

## Phase 1: Fix Resident Complaint API

**Goal:** `store()`, `show()`, and `index()` all use `zone_id` / `zone` relationship. No reference to `barangay_id` or `barangay` remains.

### Tasks

- [x] Task: Write failing Pest feature test for `POST /api/resident/complaints` — assert `zone_id` is accepted, `barangay_id` is rejected, and response JSON contains `zone` key (TDD: Red)
  - Create `tests/Feature/Api/Resident/ComplaintApiTest.php`
  - Test `store()` with valid `zone_id` → 201, response has `data.zone`
  - Test `store()` with `barangay_id` instead → 422 validation error
  - Test `store()` with no zone fields → 201 (zone_id is nullable)

- [x] Task: Write failing tests for `GET /api/resident/complaints` (index) and `GET /api/resident/complaints/{id}` (show) — assert response JSON contains `zone` key (TDD: Red)
  - `index()` returns list where each complaint has `zone`
  - `show()` returns complaint with `zone` and `createdBy`

- [x] Task: Fix `ComplaintController::store()` — change validation from `barangay_id` to `zone_id: nullable|exists:zones,id`, update `create()` payload, change `load('barangay')` to `load('zone')` (TDD: Green)

- [x] Task: Fix `ComplaintController::index()` — add `with('zone')` eager-load (TDD: Green)

- [x] Task: Fix `ComplaintController::show()` — change `load('barangay', 'createdBy')` to `load('zone', 'createdBy')` (TDD: Green)

- [x] Verification [checkpoint: 11cf7d1]: Run `php artisan test --compact --filter=ComplaintApiTest`, confirm all green. Run `vendor/bin/pint --dirty --format agent` on modified files. [5c90aa2]

---

## Phase 2: Fix Resident Dashboard API

**Goal:** `ResidentDashboardController::__invoke()` no longer queries `waste_collection_schedules.barangay_id` (column does not exist). Returns today's published schedules for all zones with `zone` and `collectors` eager-loaded.

### Tasks

- [x] Task: Write failing Pest feature test for `GET /api/resident/dashboard` — assert 200 response, schedules include `zone` key, no 500 error (TDD: Red)
  - Create `tests/Feature/Api/Resident/ResidentDashboardApiTest.php`
  - Test: authenticated resident hits dashboard → 200
  - Test: response JSON has `today_schedules` key where each schedule has `zone` and `collectors`
  - Test: schedules are filtered to today's date and `is_published = true`

- [x] Task: Fix `ResidentDashboardController::__invoke()` — remove `where('barangay_id', $resident->barangay_id)` from the schedules query; change `with('collectors')` to `with('zone', 'collectors')`; scope to today's date and published status (TDD: Green)

- [x] Verification: Run `php artisan test --compact --filter=ResidentDashboardApiTest`, confirm all green. Run `vendor/bin/pint --dirty --format agent`. [checkpoint: fb356d3] [4713400]

---

## Phase 3: Fix Collector Schedule and Dashboard APIs

**Goal:** Both `CollectionScheduleController` and `CollectorDashboardController` load `zone` instead of `barangay` in all eager-load calls.

### Tasks

- [x] Task: Write failing Pest feature test for `GET /api/collector/schedules` (index) — assert response schedules have `zone` key, not `barangay` (TDD: Red)
  - Create `tests/Feature/Api/Collector/CollectionScheduleApiTest.php`
  - Test `index()`: authenticated collector → 200, each schedule has `zone` and `status_updates`
  - Test `show()`: authenticated collector → 200, schedule has `zone`, `collectors`, `status_updates`

- [x] Task: Write failing Pest feature test for `GET /api/collector/dashboard` — assert today's schedules and upcoming schedules include `zone` (TDD: Red)
  - Create `tests/Feature/Api/Collector/CollectorDashboardApiTest.php`
  - Test: authenticated collector → 200, `today_schedules` items have `zone` and `status_updates`
  - Test: `upcoming_schedules` items have `zone`

- [x] Task: Fix `CollectionScheduleController::index()` — change `with('barangay', 'statusUpdates')` to `with('zone', 'statusUpdates')` (TDD: Green)

- [x] Task: Fix `CollectionScheduleController::show()` — change `load('barangay', 'collectors', 'statusUpdates')` to `load('zone', 'collectors', 'statusUpdates')` (TDD: Green)

- [x] Task: Fix `CollectorDashboardController` — change both `with('barangay', 'statusUpdates')` and `with('barangay')` to `with('zone', 'statusUpdates')` and `with('zone')` respectively (TDD: Green)

- [x] Verification: Run `php artisan test --compact --filter=CollectionScheduleApiTest`, then `--filter=CollectorDashboardApiTest`. Run `vendor/bin/pint --dirty --format agent`. [checkpoint: f61d7c7] [b381e20]

---

## Phase 4: Quality Gates

**Goal:** Full test suite passes, no formatting violations, no type errors. Commit and update tracks.md.

### Tasks

- [x] Task: Run full test suite — `php artisan test --compact` — confirm zero failures and no regressions against existing complaint, schedule, and dashboard tests (135/135 passed)

- [x] Task: Run `composer run ci:check` — confirm Pint, ESLint, Prettier, and TypeScript checks all pass (TypeScript and ESLint are no-ops for this PHP-only track but must not regress)

- [x] Task: Update `conductor/tracks.md` — move `mobile_api_zone_alignment_20260527` from Active to Completed with checkpoint SHA

- [x] Verification: Commit with `git commit -m "phase(4): quality gates — mobile API zone alignment complete"`. Record SHA in tracks.md. [checkpoint: 6578d26]
