# Spec: Mobile API — Resident Document Requests

## Overview

Expose a complete document-request lifecycle to resident mobile clients via the existing Sanctum-authenticated API.
Three endpoints already have skeleton implementations (index, store, show). This track adds the `cancel` action and full test coverage across all four endpoints.

## Background

The `DocumentRequest` model and migration already exist. The admin web app (approve/reject) is complete. The resident API controller (`App\Http\Controllers\Api\Resident\DocumentRequestController`) already implements `index`, `store`, and `show` but has no tests and no `cancel` endpoint. The route file already registers an `apiResource` for `['index', 'store', 'show']`; `cancel` requires a dedicated route addition.

## Status values (from migration)

`pending` → `resolved` (admin) | `rejected` (admin) | `cancelled` (resident, new)

The `cancel` action must add `cancelled` to the enum. The factory has states for `pending`, `resolved`, and `rejected`.

## Functional Requirements

### FR-1 — List document requests (index)
**Description:** Authenticated resident retrieves their own document requests, paginated, newest first.

**Acceptance criteria:**
- `GET /api/resident/document-requests` returns HTTP 200 with a paginated JSON structure (`data`, `meta` or Laravel default pagination shape).
- Only requests belonging to the authenticated resident are returned; other residents' requests are never included.
- Requests unauthenticated: returns HTTP 401.
- Response items include at minimum: `id`, `document_type`, `purpose`, `reason`, `status`, `created_at`.

**Priority:** High

---

### FR-2 — Submit a document request (store)
**Description:** Authenticated resident submits a new document request.

**Acceptance criteria:**
- `POST /api/resident/document-requests` with valid body returns HTTP 201 and the created resource.
- Required fields: `document_type` (string, max 255), `purpose` (string, max 255), `reason` (string).
- Missing or invalid fields return HTTP 422 with `errors` keyed by field name.
- Created record has `status = 'pending'` and `resident_id` set to the authenticated resident.
- Unauthenticated request returns HTTP 401.

**Priority:** High

---

### FR-3 — View a single document request (show)
**Description:** Resident retrieves full details of one of their document requests.

**Acceptance criteria:**
- `GET /api/resident/document-requests/{id}` returns HTTP 200 with the document request and `resolvedBy` relationship loaded.
- Attempting to view another resident's request returns HTTP 403.
- Non-existent ID returns HTTP 404.
- Unauthenticated request returns HTTP 401.

**Priority:** High

---

### FR-4 — Cancel a document request (cancel)
**Description:** Resident cancels a `pending` request they own. Resolved or rejected requests cannot be cancelled.

**Acceptance criteria:**
- `PATCH /api/resident/document-requests/{id}/cancel` returns HTTP 200 with the updated resource (`status = 'cancelled'`).
- Cancelling a non-`pending` request (`resolved`, `rejected`, `cancelled`) returns HTTP 422 with a descriptive error message.
- Attempting to cancel another resident's request returns HTTP 403.
- Non-existent ID returns HTTP 404.
- Unauthenticated request returns HTTP 401.

**Priority:** High

---

## Non-Functional Requirements

### NFR-1 — Authorization scope
All four endpoints enforce `auth:sanctum` + `role:resident,admin` middleware (already configured at the route group level). No request should ever leak data across resident boundaries.

### NFR-2 — Consistency
Controller patterns (resident lookup via `$request->user()->resident()->firstOrFail()`, ownership via `abort_unless`) must match the existing `ComplaintController` conventions exactly.

### NFR-3 — Database integrity
The `status` column enum must be extended to include `cancelled`. A migration must add the new value without destroying existing data.

### NFR-4 — Test coverage
All four actions must have Pest feature tests covering happy path, validation errors, authorization failures, and unauthenticated access.

---

## User Stories

**US-1**
As a resident,
I want to see a list of all my document requests,
So that I can track the status of my past submissions.

*Given* I am authenticated as a resident,
*When* I call `GET /api/resident/document-requests`,
*Then* I receive a paginated list of only my requests in descending creation order.

---

**US-2**
As a resident,
I want to submit a new document request,
So that I can request a barangay document without visiting the office.

*Given* I am authenticated as a resident,
*When* I post valid `document_type`, `purpose`, and `reason`,
*Then* a new request is created with `status = 'pending'` and I receive HTTP 201.

---

**US-3**
As a resident,
I want to view the details of a specific request,
So that I can see any admin remarks or rejection feedback.

*Given* I am authenticated as a resident and own the request,
*When* I call `GET /api/resident/document-requests/{id}`,
*Then* I receive the full request details including `resolvedBy` if set.

---

**US-4**
As a resident,
I want to cancel a pending request,
So that I can withdraw a submission I no longer need.

*Given* I am authenticated as a resident and the request is `pending`,
*When* I call `PATCH /api/resident/document-requests/{id}/cancel`,
*Then* the request status changes to `cancelled` and I receive the updated resource.

*Given* the request is already `resolved`, `rejected`, or `cancelled`,
*When* I attempt to cancel,
*Then* I receive HTTP 422 indicating the request cannot be cancelled.

---

## Technical Considerations

- **Migration required:** Alter `document_requests.status` enum to add `'cancelled'`. Use a raw `ALTER TABLE` statement inside a new migration (MySQL enum alteration).
- **Route addition:** Add `Route::patch('document-requests/{documentRequest}/cancel', ...)` inside the existing resident middleware group. Do not change the existing `apiResource` registration.
- **Factory state:** Add a `cancelled()` state to `DocumentRequestFactory` for test convenience.
- **Fillable:** `status` is already fillable on the model via the `#[Fillable]` attribute. No model changes needed beyond confirming `cancelled` is a valid cast value.
- **No new middleware:** Authorization is handled identically to `ComplaintController` — `abort_unless` for ownership checks.

---

## Out of Scope

- Residents cannot re-open a cancelled request (admin-only workflow).
- File/document uploads are not part of this track.
- Push notifications on status change are not part of this track.
- Admin-side changes to document request handling are already complete.

---

## Open Questions

- None. All schema, model, factory, and route scaffolding already exist or are clearly defined above.
