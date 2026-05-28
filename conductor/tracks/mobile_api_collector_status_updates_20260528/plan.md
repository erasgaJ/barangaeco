# Implementation Plan: Mobile API — Collector Status Updates

## Overview

Three phases:

1. **Foundation** — Factory, index verification, and baseline tests for the existing happy-path behavior.
2. **Business Rules** — Authorization guard (unassigned collector), published-schedule guard, and status regression guard with full TDD coverage.
3. **Quality Gates** — Pint, ESLint/Prettier/TypeScript checks, full test suite pass.

All PHP changes are covered by Pest feature tests following Red → Green → Refactor. No frontend changes are required.

---

## Phase 1: Foundation — Factory and Baseline Tests [checkpoint: 494e963]

**Goal:** Create the `CollectionStatusUpdateFactory`, confirm the composite index exists (add migration if missing), and write passing tests for the happy-path `store` endpoint as it currently behaves.

### Tasks

- [x] Task: Create `CollectionStatusUpdateFactory` (TDD: write a test that uses it to seed data, then create the factory until the test passes)
  - Factory definition: `waste_collection_schedule_id` via `WasteCollectionSchedule::factory()`, `collector_id` via `Collector::factory()`, `status` random from `['pending', 'in_progress', 'completed']`, `notes` nullable faker sentence.
  - Run: `php artisan make:factory CollectionStatusUpdateFactory --model=CollectionStatusUpdate`

- [x] Task: Verify composite index on `(waste_collection_schedule_id, collector_id)` in `collection_status_updates`. If missing, generate a migration to add it.
  - Check migration `2026_05_09_034407_create_collection_status_updates_table.php` — index not present in current schema; create `php artisan make:migration add_index_to_collection_status_updates_table`.
  - Migration adds: `$table->index(['waste_collection_schedule_id', 'collector_id']);`

- [x] Task: Create `tests/Feature/Api/Collector/CollectionStatusApiTest.php` — write and pass happy-path tests (TDD: Red → Green)
  - Test: authenticated collector assigned to a published schedule can post `pending` status → `201`.
  - Test: response body contains `id`, `waste_collection_schedule_id`, `collector_id`, `status`, `notes`.
  - Test: posting again updates the existing record (upsert — only one row in DB).
  - Test: `completed` with `notes` stores notes correctly.
  - Helper: extract `collectorWithSchedule()` local helper (mirrors pattern from existing test files).

- [x] Verification: Run `php artisan test --compact --filter=CollectionStatusApiTest` — all tests green. [checkpoint marker] [c3d0d69]

---

## Phase 2: Business Rules and Error Branches

**Goal:** Add and test the three guard conditions — unassigned collector, draft schedule, and status regression — directly in `CollectionStatusController@store`.

### Tasks

- [ ] Task: Guard FR-2 — unassigned collector returns `403` (TDD: Red → Green)
  - Write test: collector not in `schedule_collector` pivot → `403`.
  - Write test: different collector from another user cannot update → `403`.
  - Implement: the existing `abort_unless()` already covers this; confirm the test goes green without code change. If the test fails, the guard is absent — add it.

- [ ] Task: Guard FR-3 — draft schedule returns `422` (TDD: Red → Green)
  - Write test: schedule with `status = 'draft'` → `422` with JSON error key `message` or `errors.schedule`.
  - Implement: add check after collector authorization — `abort_if($schedule->status !== 'published', 422, 'Schedule is not published.')` or use `response()->json(['message' => ...], 422)` for consistency with existing error responses.

- [ ] Task: Guard FR-4 — status regression from `completed` blocked (TDD: Red → Green)
  - Write test: existing status update is `completed`; POST with `in_progress` → `422`.
  - Write test: existing status update is `completed`; POST with `pending` → `422`.
  - Write test: existing status update is `completed`; POST with `completed` → `201` (allowed).
  - Implement: before `updateOrCreate`, load existing record — if exists and `status === 'completed'` and new status !== 'completed', return `422`.

- [ ] Task: Validation edge cases (TDD: Red → Green)
  - Write test: missing `status` field → `422` validation error.
  - Write test: invalid `status` value (e.g., `"done"`) → `422` validation error.
  - Write test: unauthenticated request → `401`.
  - Write test: resident-role token (not collector) → `403`.
  - Existing controller validation handles most of these; confirm tests pass; add rules if any fail.

- [ ] Task: Run Pint on all modified PHP files.
  - `vendor/bin/pint --dirty --format agent`

- [ ] Verification: Run `php artisan test --compact --filter=CollectionStatusApiTest` — all branches green. [checkpoint marker]

---

## Phase 3: Quality Gates

**Goal:** Full CI suite passes; track committed.

### Tasks

- [ ] Task: Run full test suite to ensure no regressions.
  - `php artisan test --compact`

- [ ] Task: Run code quality checks.
  - `vendor/bin/pint --dirty --format agent`
  - `npm run lint:check`
  - `npm run format:check`
  - `npm run types:check`

- [ ] Task: Update `conductor/tracks.md` — move track to Completed with checkpoint commit hash.

- [ ] Verification: All quality gates pass; commit with `phase(3): quality gates — collector status updates API`. [checkpoint marker]

---

## Commit Strategy

| Phase | Commit message |
|-------|----------------|
| 1 | `phase(1): factory and baseline tests — collector status updates` |
| 2 | `phase(2): business rules and error branches — collector status updates` |
| 3 | `phase(3): quality gates — collector status updates` |
