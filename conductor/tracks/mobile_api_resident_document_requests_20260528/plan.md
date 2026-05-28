# Implementation Plan: Mobile API — Resident Document Requests

## Overview

Three phases covering: existing endpoint tests + cancel migration + cancel implementation + quality gates.

The controller skeleton (index, store, show) is already in place. The route is registered. Phase 1 tests the existing three endpoints to establish a green baseline. Phase 2 adds the `cancel` capability (migration, factory state, route, controller method) test-first. Phase 3 runs quality gates and commits.

---

## Phase 1: Test Coverage for Existing Endpoints (index, store, show) [checkpoint: 18c8034]

**Goal:** Every existing endpoint has a full Pest test suite — happy paths, validation, authorization, and auth guard.

### Tasks

- [x] Task: Create test file `tests/Feature/Api/Resident/DocumentRequestApiTest.php` using `php artisan make:test --pest DocumentRequestApiTest`. Add a `residentWithToken()` helper (same shape as `ComplaintApiTest` — create Barangay, User with `resident()` factory state, Resident record, and Sanctum token). (TDD: Write the helper and first failing test, then confirm scaffolding is correct)

- [x] Task: Write and green test — `index` happy path. Assert HTTP 200, paginated `data` array, only returns requests belonging to the authenticated resident. Use `DocumentRequest::factory()->count(2)->create(['resident_id' => $resident->id])` and a second resident's request to verify isolation. (TDD: Red → add assertions → run → Green)

- [x] Task: Write and green test — `index` unauthenticated returns 401. (TDD: Red → Green — no implementation changes needed, middleware already in place)

- [x] Task: Write and green test — `store` happy path. POST valid `document_type`, `purpose`, `reason`. Assert 201, response contains correct field values, DB has the record with `status = 'pending'` and correct `resident_id`. (TDD: Red → Green)

- [x] Task: Write and green tests — `store` validation failures. Missing `document_type` → 422 with `errors.document_type`. Missing `purpose` → 422. Missing `reason` → 422. (TDD: Red → Green)

- [x] Task: Write and green test — `store` unauthenticated returns 401. (TDD: Red → Green)

- [x] Task: Write and green test — `show` happy path. Assert 200, response includes `resolved_by` key (null for pending). (TDD: Red → Green)

- [x] Task: Write and green test — `show` ownership enforcement. Create a request owned by a different resident; assert 403. (TDD: Red → Green)

- [x] Task: Write and green test — `show` non-existent ID returns 404. (TDD: Red → Green)

- [x] Task: Write and green test — `show` unauthenticated returns 401. (TDD: Red → Green)

- [x] Verification: Run `php artisan test --compact --filter=DocumentRequestApiTest`. All Phase 1 tests must be green before proceeding. [checkpoint: 18c8034]

---

## Phase 2: Cancel Endpoint (migration + factory state + route + controller)

**Goal:** `PATCH /api/resident/document-requests/{id}/cancel` is implemented TDD-first and all cancel edge cases pass.

### Tasks

- [ ] Task: Write failing test — `cancel` happy path. Call `PATCH /api/resident/document-requests/{id}/cancel` on a `pending` request owned by the resident. Assert 200 and `status = 'cancelled'` in the response body and in the database. (TDD: Red — test fails because route does not exist yet)

- [ ] Task: Write failing tests — `cancel` state guard. Create a `resolved` request and assert 422. Create a `rejected` request and assert 422. Create an already `cancelled` request and assert 422. (TDD: Red)

- [ ] Task: Write failing test — `cancel` ownership enforcement. Another resident's `pending` request → 403. (TDD: Red)

- [ ] Task: Write failing tests — `cancel` 404 on non-existent ID, 401 when unauthenticated. (TDD: Red)

- [ ] Task: Create migration `php artisan make:migration alter_document_requests_status_add_cancelled`. In `up()`, run a raw SQL `ALTER TABLE document_requests MODIFY COLUMN status ENUM('pending','resolved','rejected','cancelled') NOT NULL DEFAULT 'pending'`. In `down()`, reverse to the original three values. Run `php artisan migrate`. (TDD: Green prerequisite — schema must support the new value)

- [ ] Task: Add `cancelled()` factory state to `DocumentRequestFactory`. State sets `status = 'cancelled'`, clears `admin_remarks`, `rejection_feedback`, `resolved_at`, `resolved_by`. (TDD: Green prerequisite — tests can now use `->cancelled()` state)

- [ ] Task: Add cancel route. In `routes/api.php`, inside the resident middleware group, add `Route::patch('document-requests/{documentRequest}/cancel', [ResidentDocumentRequestController::class, 'cancel'])` below the existing `apiResource` line. (TDD: Green prerequisite — 404 becomes 500/method-not-found, tests move forward)

- [ ] Task: Implement `cancel()` method on `DocumentRequestController`. Pattern: resolve resident via `firstOrFail()`, ownership check via `abort_unless`, status guard (if `$documentRequest->status !== 'pending'` return 422 JSON error), then `$documentRequest->update(['status' => 'cancelled'])` and return 200 JSON with the updated model. (TDD: Green — all cancel tests pass)

- [ ] Verification: Run `php artisan test --compact --filter=DocumentRequestApiTest`. All Phase 1 and Phase 2 tests green. [checkpoint marker]

---

## Phase 3: Quality Gates and Commit

**Goal:** Code is formatted, types check, all tests pass, track committed.

### Tasks

- [ ] Task: Run `vendor/bin/pint --dirty --format agent` on all modified PHP files. Fix any formatting issues.

- [ ] Task: Run `php artisan test --compact` (full suite). Confirm zero failures and no regressions in other test files.

- [ ] Task: Run `npm run lint:check && npm run format:check && npm run types:check`. No frontend files were changed, but gate must pass clean.

- [ ] Task: Update `conductor/tracks.md` — add `mobile_api_resident_document_requests_20260528` to the Active table with status `complete`.

- [ ] Verification: All quality gate commands exit with code 0. Commit with `git commit -m "phase(5): mobile api resident document requests complete"` (adjust phase number to match the actual next phase in the repo's commit sequence). [checkpoint marker]
