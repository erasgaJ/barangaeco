# Spec: Mobile API — Resident Complaints

## Overview

Extend and harden the resident complaints mobile API. The core endpoints (index, store, show) already exist and have partial test coverage. This track adds a `cancel` endpoint and fills all test coverage gaps identified against the DocumentRequest API pattern.

## Background

The `ComplaintController` at `app/Http/Controllers/Api/Resident/ComplaintController.php` implements `index`, `store`, and `show`. Tests at `tests/Feature/Api/Resident/ComplaintApiTest.php` cover happy-path cases for zone alignment but miss: auth guards, ownership isolation on index, 403/404 guards on show, individual validation errors on store, database persistence assertion, and the cancel flow entirely.

The DocumentRequestApiTest is the established pattern for this module — all resident mobile API endpoints must match its coverage depth.

## Functional Requirements

### FR-1: Cancel a Complaint

**Description:** A resident can cancel their own complaint if it is in `open` status. Cancelled complaints cannot be cancelled again.

**Acceptance Criteria:**
- `PATCH /api/resident/complaints/{complaint}/cancel` returns 200 with `status: cancelled`
- Database record is updated to `cancelled`
- Returns 422 if complaint status is already `cancelled`
- Returns 422 if complaint status is `resolved` or `in_progress` (cannot cancel non-open)
- Returns 403 if the complaint belongs to another resident
- Returns 404 for a non-existent complaint
- Returns 401 when unauthenticated

### FR-2: Auth Guard Coverage (existing endpoints)

**Description:** All three existing endpoints must reject unauthenticated requests.

**Acceptance Criteria:**
- `GET /api/resident/complaints` returns 401 when unauthenticated
- `POST /api/resident/complaints` returns 401 when unauthenticated
- `GET /api/resident/complaints/{complaint}` returns 401 when unauthenticated

### FR-3: Ownership Isolation on Index

**Description:** The index must only return the authenticated resident's own complaints — not other residents' complaints.

**Acceptance Criteria:**
- Response `data` contains only complaints belonging to the authenticated resident
- Another resident's complaints do not appear in the response

### FR-4: Ownership and Not-Found Guards on Show

**Description:** Show must enforce ownership and return correct error codes.

**Acceptance Criteria:**
- Returns 403 when a resident attempts to view another resident's complaint
- Returns 404 for a non-existent complaint ID

### FR-5: Validation Coverage on Store

**Description:** Each required field missing from the store payload must return a specific 422 validation error.

**Acceptance Criteria:**
- Missing `complaint_type` returns 422 with `complaint_type` validation error
- Missing `complaint_against` returns 422 with `complaint_against` validation error
- Missing `description` returns 422 with `description` validation error
- Successful store persists record in the database (`assertDatabaseHas`)

## Non-Functional Requirements

### NFR-1: Test Coverage

All new and gap-filling tests must pass. The complaints test file must reach parity with the DocumentRequestApiTest coverage depth.

### NFR-2: Consistency

The cancel endpoint must follow the same route registration pattern as document-requests cancel: `Route::patch('complaints/{complaint}/cancel', ...)`.

## User Stories

**As a resident**, I want to cancel a complaint I filed so that I can withdraw it if the issue is resolved informally.

- Given I am authenticated and own an open complaint
- When I PATCH `/api/resident/complaints/{id}/cancel`
- Then the complaint status changes to `cancelled` and I receive a 200 response

**As a resident**, I want my complaint list to only show my own complaints so that my privacy is protected.

- Given I am authenticated as resident A
- When I GET `/api/resident/complaints`
- Then only resident A's complaints appear in the response

## Technical Considerations

- The cancel endpoint should guard against statuses other than `open` — use `abort_unless` with a 422 or an `Illuminate\Validation\ValidationException`
- The route must be added to `routes/api.php` in the resident group alongside the existing `apiResource`
- Factory states for `cancelled`, `in_progress`, and `resolved` may need to be added to `ComplaintFactory` if not present
- Follow the `residentWithToken()` helper pattern already established in the complaints test file

## Out of Scope

- Admin-facing complaint status updates (already handled by web admin)
- Complaint priority changes by residents
- Complaint update/edit (residents cannot edit filed complaints)
- Pagination metadata structure changes

## Open Questions

- None — scope is fully bounded by the DocumentRequest pattern and existing implementation.
