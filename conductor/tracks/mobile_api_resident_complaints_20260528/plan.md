# Implementation Plan: Mobile API — Resident Complaints

## Overview

Two phases. Phase 1 fills all test coverage gaps for the three existing endpoints (auth guards, ownership isolation, validation, database persistence). Phase 2 adds the cancel endpoint end-to-end (route, controller method, factory states, tests).

All tasks follow Red-Green-Refactor. The existing `residentWithToken()` helper in `ComplaintApiTest.php` is the base setup pattern.

---

## Phase 1: Test Coverage Gaps for Existing Endpoints

**Goal:** Bring `ComplaintApiTest.php` to full parity with `DocumentRequestApiTest.php` — covering auth guards, isolation, ownership enforcement, validation errors, and persistence.

### Tasks

- [x] Task: Auth guard tests — add three failing tests asserting 401 on unauthenticated requests to `GET /api/resident/complaints`, `POST /api/resident/complaints`, and `GET /api/resident/complaints/{id}`. (TDD: tests fail immediately since no code change needed — they should already pass; confirm they pass, or identify any route/middleware gap) [143d0cc]

- [x] Task: Ownership isolation on index — write a test that creates two residents, creates complaints for each, authenticates as resident A, and asserts only resident A's complaints appear in `data`. Confirm the existing `index` implementation correctly scopes by `resident_id` via the `resident->complaints()` relation. [143d0cc]

- [x] Task: Ownership 403 on show — write a test that authenticates as resident A and requests a complaint belonging to resident B, asserting 403. Confirm `abort_unless($complaint->resident_id === $resident->id, 403)` in the existing controller handles this. [143d0cc]

- [x] Task: Not-found 404 on show — write a test asserting `GET /api/resident/complaints/99999` returns 404 when authenticated. [143d0cc]

- [x] Task: Validation error tests for store — write three separate tests each omitting one required field (`complaint_type`, `complaint_against`, `description`) and asserting 422 with the correct field validation error. [143d0cc]

- [x] Task: Database persistence assertion on store — add `assertDatabaseHas` to the existing happy-path store tests (or add a dedicated persistence test) confirming the complaint record is written to the database with correct `resident_id` and `status: open`. [143d0cc]

- [x] Verification: Run `php artisan test --compact --filter=ComplaintApi` — all Phase 1 tests must be green. 15/15 passed. [143d0cc]

---

## Phase 2: Cancel Endpoint

**Goal:** Implement `PATCH /api/resident/complaints/{complaint}/cancel` with full guard logic and test coverage.

### Tasks

- [ ] Task: ComplaintFactory states — add `cancelled()`, `inProgress()`, and `resolved()` factory states to `ComplaintFactory.php` so cancel guard tests can set up non-cancellable fixtures cleanly. (TDD: write a test that uses `Complaint::factory()->cancelled()->create(...)` — it fails because the state doesn't exist, then add the states)

- [ ] Task: Cancel tests (all cases) — write failing tests for the cancel endpoint covering:
  - 200 + `status: cancelled` for an open complaint owned by the resident
  - `assertDatabaseHas` confirming the status is persisted
  - 422 when already `cancelled`
  - 422 when status is `in_progress`
  - 422 when status is `resolved`
  - 403 when the complaint belongs to another resident
  - 404 for a non-existent complaint ID
  - 401 when unauthenticated

- [ ] Task: Register cancel route — add `Route::patch('complaints/{complaint}/cancel', [ResidentComplaintController::class, 'cancel'])` in `routes/api.php` inside the resident middleware group, after the `apiResource` line.

- [ ] Task: Implement `cancel` method in `ComplaintController` — resolve the authenticated resident, enforce ownership (403), abort if status is not `open` (422 via `ValidationException` or `abort(422)`), update status to `cancelled`, return 200 JSON with the updated complaint. (TDD: run tests after each step, go green)

- [ ] Task: Run Pint — `vendor/bin/pint --dirty --format agent` to format any modified PHP files.

- [ ] Verification: Run `php artisan test --compact --filter=ComplaintApi` — all Phase 1 and Phase 2 tests pass. Then run `composer run ci:check` for full quality gate. [checkpoint marker]
