# Specification: Mobile API Zone Alignment

## Overview

The `single_barangay_zone_refactor_20260525` track removed `barangay_id` from `complaints` and `waste_collection_schedules` tables and replaced it with `zone_id` (FK to `zones`). The admin web app was fully updated as part of that track, but the mobile API layer was not. This track fixes the mobile API controllers so they reference `zone_id` and the `zone` relationship instead of the now-removed `barangay_id` column and `barangay` relationship.

## Background

Four mobile API controllers still reference the old `barangay_id` column or the `barangay` eager-load relationship on models that no longer carry it. This causes 500 errors in production for residents filing complaints, collectors viewing schedules, and any user hitting the dashboard endpoints.

The residents table itself was not changed — residents still have `barangay_id`. The fix scope is limited to the four affected controllers.

## Functional Requirements

### FR-1: Resident Complaint Store

**Description:** `POST /api/resident/complaints` must accept `zone_id` (nullable) instead of `barangay_id`.

**Acceptance Criteria:**
- Validation rule changes from `barangay_id: required|exists:barangays,id` to `zone_id: nullable|exists:zones,id`
- Complaint is created with `zone_id` in the payload
- Response includes the `zone` relationship, not `barangay`

**Priority:** Critical

---

### FR-2: Resident Complaint Show and Index

**Description:** `GET /api/resident/complaints` and `GET /api/resident/complaints/{id}` must eager-load `zone` instead of `barangay`.

**Acceptance Criteria:**
- `index()` returns complaints with `zone` relationship (currently returns no eager-load at all)
- `show()` returns the complaint with `zone` and `createdBy` relationships

**Priority:** Critical

---

### FR-3: Resident Dashboard Schedules

**Description:** `GET /api/resident/dashboard` must not filter schedules by `barangay_id` (column no longer exists on `waste_collection_schedules`).

**Acceptance Criteria:**
- No `WHERE barangay_id = ?` clause on `waste_collection_schedules` queries — the query currently causes a 500 error
- Returns today's published schedules across all zones
- Schedules are eager-loaded with `zone` and `collectors` relationships

**Priority:** Critical

---

### FR-4: Collector Schedule Index and Show

**Description:** `GET /api/collector/schedules` and `GET /api/collector/schedules/{id}` must eager-load `zone` instead of `barangay`.

**Acceptance Criteria:**
- `index()` uses `with('zone', 'statusUpdates')` instead of `with('barangay', 'statusUpdates')`
- `show()` uses `load('zone', 'collectors', 'statusUpdates')` instead of `load('barangay', ...)`

**Priority:** Critical

---

### FR-5: Collector Dashboard Schedules

**Description:** `GET /api/collector/dashboard` today's and upcoming schedule queries must eager-load `zone` instead of `barangay`.

**Acceptance Criteria:**
- Today's schedules use `with('zone', 'statusUpdates')`
- Upcoming schedules use `with('zone')`

**Priority:** Critical

---

## Non-Functional Requirements

### NFR-1: No Regression on Unrelated Controllers

The following controllers must not be modified:
- `Api\Auth\AuthController` — resident still has `barangay_id`; `resident.barangay` load is correct
- `Api\Resident\DocumentRequestController` — no zone dependency
- `Api\Collector\CollectionStatusController` — no zone dependency
- `Http\Requests\Auth\RegisterRequest` — `barangay_id` is correct for resident registration

### NFR-2: Test Coverage

All fixed endpoints must have Pest feature tests covering the corrected behavior. Existing test files in `tests/Feature/Api/` should be extended where they exist. New test files follow the naming convention `Api/Resident/` and `Api/Collector/` subdirectories if no file exists.

### NFR-3: Code Formatting

All modified PHP files must pass `vendor/bin/pint --dirty` before the phase commit.

---

## User Stories

### Story 1: Resident Filing a Complaint

**As** a resident using the mobile app,  
**I want** to submit a complaint that is associated with a zone,  
**So that** the barangay admin can route it to the correct zone.

**Given** I am authenticated as a resident  
**When** I POST to `/api/resident/complaints` with a valid `zone_id`  
**Then** the complaint is created and the response includes the associated `zone` object

---

### Story 2: Resident Viewing Dashboard Without 500 Error

**As** a resident using the mobile app,  
**I want** to see today's waste collection schedules on my dashboard,  
**So that** I know when collectors will be in my area.

**Given** I am authenticated as a resident  
**When** I GET `/api/resident/dashboard`  
**Then** I receive a 200 response with today's published schedules (not a 500 error)

---

### Story 3: Collector Viewing Their Schedules

**As** a waste collector using the mobile app,  
**I want** to see my assigned schedules with zone information,  
**So that** I know which zones I am covering.

**Given** I am authenticated as a collector  
**When** I GET `/api/collector/schedules` or `/api/collector/schedules/{id}`  
**Then** the response includes `zone` data instead of a broken `barangay` reference

---

## Technical Considerations

- `Zone` model: `id`, `name`, `description`, `is_active`, `timestamps`
- `Complaint` model: has `belongsTo(Zone::class)`, `zone_id` in `$fillable`
- `WasteCollectionSchedule` model: has `belongsTo(Zone::class)`, `zone_id` in `$fillable`
- Resident model still has `barangay_id` — do not remove or change resident-to-barangay logic
- The dashboard fix removes the broken `barangay_id` filter entirely; schedules are shown for all zones (the resident's app shows all of today's published routes)

---

## Out of Scope

- Frontend mobile app code (not in this repository)
- Admin web app controllers (already updated in the zone refactor track)
- Any database migration changes (schema changes were completed in the prior track)
- Changing the `barangay_id` on the residents table or registration flow

---

## Open Questions

None. All design decisions are clear from the zone refactor audit.
