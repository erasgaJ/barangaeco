# Spec: Admin Dashboard — Real Stats and Metrics

## Overview

The admin dashboard `DashboardController` already queries four real stat counts and passes them via Inertia, and the frontend `dashboard.jsx` already renders them. However, two specific issues exist:

1. **The "Residents" stat card shows a hardcoded badge of "+24 this mo"** — this should be a real count of residents created in the current calendar month.
2. **The `today_schedules` section references `schedule.barangay` in the controller** (`with('barangay', ...)`) but the model no longer has a `barangay` relationship — it uses `zone` after the refactor. The controller also references `schedule.route_name` in the frontend but no such column exists; the schedule display name comes from the zone's `name` field.
3. **The `recent_document_requests` table uses `req.resident_name`** but `DocumentRequest` has no `resident_name` attribute — the resident's full name comes via `resident.full_name` through the relationship.
4. **The `status_update` shape consumed by the frontend** (singular, with a `.time` property) does not match the `statusUpdates` hasMany collection returned by the controller. The frontend expects a single latest status update per schedule.
5. **No feature test coverage** for the specific stats shape passed by the controller (only a smoke test that returns 200 exists).

## Background

The controller was built before the zone refactor. The four stat cards are real database counts. The display bugs are in data shaping: wrong relationship names in the `with()` call, missing accessor for `resident_name`, and a mismatch between the `statusUpdates` collection and what the frontend expects as `status_update` (singular with a derived `time` string).

## Functional Requirements

### FR-1: Residents "this month" badge
**Description:** The Residents stat card badge must show the actual count of residents created in the current calendar month (e.g., "12 this mo"), not the hardcoded "+24 this mo".

**Acceptance Criteria:**
- `stats.residents_this_month` is passed from the controller as an integer count of `residents` with `created_at >= start of current month`.
- The frontend badge renders "+{n} this mo" using this real value.
- When no residents were created this month the badge shows "+0 this mo".

**Priority:** Medium

---

### FR-2: Fix `today_schedules` — zone name as display label
**Description:** The `with('barangay', ...)` eager load in the controller is a dead relationship post-refactor. Schedules should eager-load `zone` instead. The frontend reads `schedule.route_name` which does not exist as a column; the zone name should be used as the display label.

**Acceptance Criteria:**
- Controller eager-loads `zone` (not `barangay`) for today's schedules.
- Each schedule object passed to the frontend includes a `zone_name` string (computed in the controller or as a resource) derived from `schedule->zone->name`.
- Frontend reads `schedule.zone_name` for the route label display.
- Schedules with a null zone still render gracefully (show "Unknown Zone").

**Priority:** High

---

### FR-3: Fix `recent_document_requests` — resident name display
**Description:** The frontend reads `req.resident_name` but no such attribute exists. The actual name is `req.resident.full_name` via the already-eager-loaded `resident` relationship.

**Acceptance Criteria:**
- Controller maps each document request to include a `resident_name` key derived from `resident->full_name`.
- Frontend continues to read `req.resident_name` without change, or is updated to read `req.resident.full_name` — either approach is acceptable but must be consistent and not throw undefined errors.
- Requests where the resident relationship is null still render gracefully (show "Unknown Resident").

**Priority:** High

---

### FR-4: Fix `today_schedules` — `status_update` shape
**Description:** The frontend expects a singular `schedule.status_update` object with keys `status` and `time`. The controller returns `statusUpdates` as a hasMany collection. The controller must derive and attach the latest single status update per schedule in the correct shape.

**Acceptance Criteria:**
- Each schedule in `today_schedules` has a `status_update` key that is either `null` or an object with `{ status: string, time: string }`.
- `time` is a human-readable string derived from the `CollectionStatusUpdate.updated_at` timestamp (e.g., `"10:30 AM"`).
- The `RouteIcon` and status text logic in the frontend render correctly (completed = green icon, in_progress = blue highlight, else pending).

**Priority:** High

---

### FR-5: Remove stale `barangay` eager load from controller
**Description:** The controller calls `with('barangay', 'collectors', 'statusUpdates')`. The `barangay` relationship no longer exists on `WasteCollectionSchedule` — this causes a silent no-op eager load and should be cleaned up to `with('zone', 'collectors', 'statusUpdates')`.

**Acceptance Criteria:**
- `with('barangay', ...)` is replaced with `with('zone', ...)`.
- No runtime errors when loading the dashboard.

**Priority:** High (part of FR-2)

---

### FR-6: Feature test coverage for stats shape
**Description:** The only existing dashboard test is a 200 smoke test. Tests must verify the exact shape of `stats`, `today_schedules`, and `recent_document_requests` passed via Inertia props.

**Acceptance Criteria:**
- Test asserts `stats` contains keys: `total_residents`, `pending_document_requests`, `active_routes`, `open_complaints`, `residents_this_month`.
- Test asserts each item in `today_schedules` has `zone_name` and `status_update` (null or object).
- Test asserts each item in `recent_document_requests` has `resident_name`.
- Tests use factories to seed known data and assert the counts match.

**Priority:** High

---

## Non-Functional Requirements

### NFR-1: Performance
- All stats are computed in a single controller invocation. No N+1 queries — eager-load relationships, do not lazy-load per-row data.
- `today_schedules` query uses `with()` to batch load all sub-relations.

### NFR-2: Graceful nulls
- Any nullable foreign key (zone, resident) must not cause a PHP null-dereference or a JS undefined error. Use null-safe operators in PHP and optional chaining in JS where applicable.

---

## User Stories

### Story 1: Admin sees real monthly resident growth
**As** a barangay admin,
**I want** the Residents card to show how many residents registered this month,
**So that** I can track community growth at a glance.

**Given** 5 residents were created this month and 100 total,
**When** I open the dashboard,
**Then** the Residents card shows "100" and the badge shows "+5 this mo".

---

### Story 2: Admin sees today's waste route zones correctly
**As** a barangay admin,
**I want** each waste route card to display the zone name,
**So that** I know which area is being serviced.

**Given** a schedule is published for today assigned to "Zone A",
**When** I open the dashboard,
**Then** the route card label reads "Zone A".

---

### Story 3: Admin sees the correct requester name on document requests
**As** a barangay admin,
**I want** the Recent Certificate Requests table to show the resident's real name,
**So that** I can identify who submitted each request.

**Given** a document request submitted by resident "Juan Dela Cruz",
**When** I open the dashboard,
**Then** the table row shows "Juan Dela Cruz" in the Resident Name column.

---

### Story 4: Admin sees real-time collection progress
**As** a barangay admin,
**I want** the Today's Waste Collection panel to show the correct status (pending/in progress/completed) per route,
**So that** I can monitor field operations in real time.

**Given** one route is "in_progress" and one is "completed",
**When** I open the dashboard,
**Then** the in_progress route highlights in blue and the completed route shows a green check icon.

---

## Technical Considerations

- `WasteCollectionSchedule` no longer has a `barangay` relationship — only `zone` (via `zone_id`). Using `with('barangay')` silently produces an empty collection.
- `DocumentRequest` has no `resident_name` attribute. The resident's full name is `$request->resident->full_name`.
- `CollectionStatusUpdate` timestamps (`updated_at`) can be used for the `time` display string using `format('g:i A')`.
- The controller should use `->map()` with `->toArray()` or `->append()`/computed properties to shape data before passing to Inertia, keeping the view layer passive.
- The Residents model has `verification_status` — the `total_residents` count includes all residents regardless of verification status (no change needed).
- `DocumentRequest` status enum (post-latest migration) includes: `pending`, `resolved`, `rejected`, `cancelled`. The frontend `StatusBadge` only handles `pending`, `resolved`, `rejected` — no change needed for the dashboard display since cancelled requests can fall through with no badge style.

## Out of Scope

- Adding new stat cards beyond the four existing ones.
- Charting or time-series visualization.
- Real-time WebSocket/pusher updates.
- Pagination for `recent_document_requests` (stays at 5).
- Collector-specific dashboard stats.
- Announcements count on the dashboard.

## Open Questions

- Should `total_residents` count only `verified` residents, or all residents? **Decision: all residents** (no change to existing behavior).
- Should cancelled document requests appear in `recent_document_requests`? **Decision: yes** — the query returns latest 5 regardless of status; no frontend badge style for `cancelled` but it won't crash.
