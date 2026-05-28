# Spec: Mobile API — Collector Status Updates

## Overview

Allow waste collectors to post status updates for their assigned collection schedules via the mobile API. The feature surfaces real-time field progress to barangay admins and provides collectors with a clear audit trail of their activity. The core infrastructure (model, migration, route, controller stub) already exists; this track completes the feature with full validation, authorization, business rules, and test coverage.

## Background

The `collection_status_updates` table, `CollectionStatusUpdate` model, `CollectionStatusController@store`, and the route `POST /api/collector/schedules/{schedule}/status` are already scaffolded. The controller uses `updateOrCreate` so only one status record exists per collector-schedule pair at any time. No tests exist for this endpoint yet, and several edge cases (unassigned collector, wrong schedule status, state regression) are unhandled.

## Functional Requirements

### FR-1 — Post a status update

**Description:** A collector can submit a status update (`pending`, `in_progress`, `completed`) with an optional notes field for any published schedule assigned to them.

**Acceptance Criteria:**
- `POST /api/collector/schedules/{schedule}/status` returns `201` with the created/updated status update record.
- Payload must include `status` (one of `pending`, `in_progress`, `completed`).
- `notes` is optional and stored as-is.
- The response body includes `id`, `waste_collection_schedule_id`, `collector_id`, `status`, `notes`, `created_at`, `updated_at`.
- Submitting again for the same schedule updates the existing record (upsert).

**Priority:** High

---

### FR-2 — Authorization: only assigned collectors

**Description:** A collector must be assigned to the schedule before they can post a status update.

**Acceptance Criteria:**
- If the authenticated collector is not assigned to the schedule, the endpoint returns `403 Forbidden`.
- Admins using the collector token path are also subject to the same assignment check.

**Priority:** High

---

### FR-3 — Schedule must be published

**Description:** Status updates are only valid on published schedules. Draft schedules are not yet actionable in the field.

**Acceptance Criteria:**
- If the schedule's `status` is not `published`, the endpoint returns `422 Unprocessable Entity` with a descriptive error message.

**Priority:** High

---

### FR-4 — Status state progression guard

**Description:** A collector cannot revert a `completed` status back to `pending` or `in_progress`.

**Acceptance Criteria:**
- If the existing status is `completed` and the incoming `status` is `pending` or `in_progress`, the endpoint returns `422` with an error indicating the status cannot be reverted.
- `completed` → `completed` (re-confirm) is allowed.

**Priority:** Medium

---

### FR-5 — Retrieve status updates for a schedule

**Description:** The schedule detail endpoint (`GET /api/collector/schedules/{schedule}`) already loads `statusUpdates`. No new endpoint is required; the requirement is that status updates are visible in that response and include collector information.

**Acceptance Criteria:**
- `status_updates` array in the schedule detail includes `collector_id`, `status`, `notes`.
- Already satisfied by existing `show()` eager-load; verified by test.

**Priority:** Low (verification only)

---

## Non-Functional Requirements

### NFR-1 — Performance

- The `collection_status_updates` table should have a composite index on `(waste_collection_schedule_id, collector_id)` to support the `updateOrCreate` lookup. Verify this index exists; add a migration if not.

### NFR-2 — Security

- All routes protected by `auth:sanctum` + `role:collector,admin` middleware (already applied at the group level).
- No collector can read or modify another collector's status update via this endpoint.

### NFR-3 — Test coverage

- All acceptance criteria covered by Pest feature tests.
- Happy path + all error branches tested.

---

## User Stories

**Story 1 — Submit a progress update**

As a waste collector in the field,
I want to mark my assigned schedule as `in_progress`,
So that the barangay admin can see real-time collection progress.

*Given* I am authenticated as a collector and assigned to a published schedule,
*When* I `POST /api/collector/schedules/{id}/status` with `{"status": "in_progress"}`,
*Then* I receive `201` with the status update record.

---

**Story 2 — Mark collection complete**

As a waste collector,
I want to mark a schedule as `completed` with optional notes,
So that the admin can confirm the route was serviced.

*Given* I am assigned to a published schedule with no existing status update,
*When* I post `{"status": "completed", "notes": "All bags collected"}`,
*Then* the record is created and returned with `201`.

---

**Story 3 — Update an existing status**

As a waste collector,
I want to update my status from `pending` to `in_progress`,
So that the latest state is always reflected without duplicate records.

*Given* I previously submitted `pending` for a schedule,
*When* I post `{"status": "in_progress"}` for the same schedule,
*Then* the existing record is updated and returned with `201`.

---

**Story 4 — Blocked on unassigned schedule**

As a waste collector,
I want to be prevented from updating a schedule I'm not assigned to,
So that no cross-collector data corruption occurs.

*Given* I am not assigned to the target schedule,
*When* I post a status update,
*Then* I receive `403 Forbidden`.

---

## Technical Considerations

- The controller already uses `updateOrCreate` keyed on `(waste_collection_schedule_id, collector_id)`. The status regression guard (FR-4) must be added before the upsert call.
- The `CollectionStatusUpdate` model has no factory yet; one must be created for tests.
- The published-schedule check (FR-3) should be a clean guard inside the controller (or a Form Request).
- No database schema changes are required unless the composite index is missing.
- Pint formatting must be run after all PHP changes.

---

## Out of Scope

- Admin-side overriding of collector status updates.
- Notifications (push or in-app) triggered by status changes.
- Photo/media attachments to status updates.
- Bulk status updates across multiple schedules in one request.

---

## Open Questions

- Should `completed` → `completed` update the `notes` field? (Assumed yes, for correction purposes.)
- Is there a business need for a `cancelled` status (e.g., route skipped due to weather)? (Out of scope for this track; can be added later.)
