# Spec: Mobile API — Resident Announcements Feed

## Overview

Expose a read-only announcements feed to authenticated residents via the mobile API. Residents can list published announcements relevant to them and view a single announcement's full detail. The feed is read-only — residents cannot create, edit, or delete announcements.

## Background

Announcements are already managed by admins through the web dashboard (`Admin\AnnouncementController`). The `announcements` table records `published_at`, `scheduled_at`, and `target_audience` (`all`, `residents`, `collectors`). The mobile resident API currently has no endpoint to surface these announcements. This track adds two endpoints under the existing `/api/resident` prefix, matching the pattern established by `ComplaintController` and `DocumentRequestController`.

## Functional Requirements

### FR-1 — List Published Announcements

**Description:** Authenticated residents can retrieve a paginated list of announcements that are published and targeted to them.

**Acceptance Criteria:**
- `GET /api/resident/announcements` returns HTTP 200 with a paginated JSON response.
- Only announcements where `published_at` is not null and `published_at <= now()` are returned.
- Only announcements where `target_audience` is `all` or `residents` are returned (collector-only announcements are excluded).
- Results are ordered by `published_at` descending (most recent first).
- Each item includes: `id`, `title`, `message`, `target_audience`, `published_at`, `scheduled_at`, `created_at`.
- Pagination follows the existing 15-per-page convention used in complaints and document requests.
- Unauthenticated requests return HTTP 401.

**Priority:** High

### FR-2 — View Single Announcement

**Description:** Authenticated residents can retrieve the full detail of a single published announcement targeted to them.

**Acceptance Criteria:**
- `GET /api/resident/announcements/{announcement}` returns HTTP 200 with the announcement JSON.
- Returns HTTP 404 if the announcement does not exist.
- Returns HTTP 403 if the announcement is not published (`published_at` is null or in the future) or is targeted exclusively to collectors (`target_audience = collectors`).
- Unauthenticated requests return HTTP 401.

**Priority:** High

## Non-Functional Requirements

### NFR-1 — Security

- Routes are protected by `auth:sanctum` middleware and `role:resident,admin`, consistent with the existing resident route group.
- Residents cannot access announcements intended only for collectors.

### NFR-2 — Performance

- The `index` query must use a database-level scope (not PHP-side filtering) to limit rows before pagination.
- No N+1 queries — `createdBy` relation is not required for the list endpoint to avoid unnecessary joins.

### NFR-3 — Consistency

- Response shape and pagination structure must match the existing resident API endpoints (raw `paginate()` result serialized to JSON, not a custom resource wrapper).

## User Stories

**Story 1 — Browse Announcements**

As a resident using the mobile app,
I want to see a list of published community announcements,
So that I stay informed about barangay news and events.

Given I am authenticated as a resident,
When I call `GET /api/resident/announcements`,
Then I receive a paginated list of announcements with `published_at <= now()` and `target_audience` in (`all`, `residents`), ordered newest first.

**Story 2 — Read Full Announcement**

As a resident using the mobile app,
I want to open a specific announcement and read its full content,
So that I can get complete details about an item in my feed.

Given I am authenticated as a resident,
When I call `GET /api/resident/announcements/{id}` for a published, resident-visible announcement,
Then I receive the full announcement object with HTTP 200.

Given the announcement is unpublished or collector-only,
When I call `GET /api/resident/announcements/{id}`,
Then I receive HTTP 403.

## Technical Considerations

- **No new model scopes are strictly required** — the filter logic (`published_at <= now()`, `target_audience in [all, residents]`) is small enough to inline in the controller, consistent with how `ComplaintController` and `DocumentRequestController` inline their query logic.
- **Announcement model** has no existing scopes; the controller will apply `whereNotNull('published_at')->where('published_at', '<=', now())->whereIn('target_audience', ['all', 'residents'])`.
- **Factory states** — `AnnouncementFactory` already has a `scheduled()` state (unpublished). A `collectorsOnly()` state will be added to support test coverage.
- **Route registration** — add `Route::apiResource('announcements', AnnouncementController::class)->only(['index', 'show'])` inside the existing `resident` middleware group in `routes/api.php`.
- **Controller location** — `app/Http/Controllers/Api/Resident/AnnouncementController.php`, matching directory convention.
- **Test location** — `tests/Feature/Api/Resident/AnnouncementApiTest.php`, matching naming convention.

## Out of Scope

- Push notifications for new announcements.
- Marking an announcement as read (per-resident read state).
- Pagination cursor-based strategy (standard Laravel page-based pagination is sufficient).
- Admin CRUD — already handled by `Admin\AnnouncementController`.

## Open Questions

- None. Requirements are fully derivable from existing model, migration, and admin controller.
