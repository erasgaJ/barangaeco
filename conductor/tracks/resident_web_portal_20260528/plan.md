# Implementation Plan: Resident Web Portal

## Overview

Six phases build the resident portal end-to-end using TDD. Each phase is independently testable and ends with a verification checkpoint. Phases 1–2 establish the backend foundation (routes, controllers, middleware redirect). Phases 3–6 build each of the four feature pages with their corresponding frontend components. Phase 7 runs the full quality gate suite.

## Phase 1: Route Group, Middleware, and Controller Scaffolding

**Goal:** Register all resident web routes and scaffold empty controllers; verify role guard blocks non-residents; update post-login redirect to send residents to `/resident/dashboard`.

Tasks:
- [x] Task: Write Pest feature tests asserting that `GET /resident/dashboard`, `GET /resident/document-requests`, `GET /resident/complaints`, and `GET /resident/announcements` return 403 for an admin user and redirect to `/login` for a guest (TDD: Red — tests fail because routes don't exist yet)
- [x] Task: Write test asserting that a `resident` role user gets a redirect from `GET /dashboard` to `/resident/dashboard` (TDD: Red)
- [x] Task: Create `app/Http/Controllers/Resident/` directory with stub controllers: `DashboardController`, `DocumentRequestController`, `ComplaintController`, `AnnouncementController` — each returning a placeholder `Inertia::render()` for their respective pages (use `php artisan make:class`)
- [x] Task: Register the `Route::middleware(['auth', 'verified', 'role:resident'])->prefix('resident')->name('resident.')` group in `routes/web.php` with all eight routes (GET dashboard, GET/POST document-requests, DELETE document-requests/{documentRequest}, GET/POST complaints, DELETE complaints/{complaint}, GET announcements)
- [x] Task: Update the generic `GET /dashboard` controller (or add role-based redirect logic) so that resident users are redirected to `/resident/dashboard`; admin users continue to render the admin overview page
- [x] Task: Run `php artisan route:list --name=resident` to confirm all routes are registered; run tests — all role/guest guard tests should now be green
- [x] Verification: `php artisan test --compact --filter=ResidentRoute` passes; `php artisan route:list --name=resident` shows all 8 routes; logging in as a resident user redirects to `/resident/dashboard` [checkpoint marker]

## Phase 2: Resident Dashboard Controller (Backend)

**Goal:** Implement `Resident\DashboardController` with real data — resident profile, stat counts, today's schedule for the resident's zone, and recent announcements — using `Inertia::render()`.

Tasks:
- [x] Task: Write feature test for `GET /resident/dashboard` as an authenticated resident: asserts Inertia component is `resident/dashboard`, response contains `resident`, `pending_document_requests`, `open_complaints`, `today_schedule`, and `announcements` props (TDD: Red) [eef5ba1]
- [x] Task: Write feature test covering the edge case where the authenticated resident user has no linked `Resident` record: asserts redirect to `/dashboard` with a flash error message (TDD: Red) [eef5ba1]
- [x] Task: Implement `Resident\DashboardController::__invoke()` — load `auth()->user()->resident()`, abort/redirect if null; query pending document requests count, open/in_progress complaints count, today's published schedule for the resident's zone, and 5 most recent published announcements for `all`/`residents` audience; return `Inertia::render('resident/dashboard', [...])` (TDD: Green) [eef5ba1]
- [x] Task: Run Pint on all modified PHP files (`vendor/bin/pint --dirty --format agent`) [eef5ba1]
- [x] Task: Run `php artisan test --compact --filter=ResidentDashboard` — all tests green [eef5ba1]
- [x] Verification: `php artisan test --compact --filter=ResidentDashboard` passes; visiting `https://barangaeco.test/resident/dashboard` as a resident renders the page with no 500 error [checkpoint marker] [eef5ba1]

## Phase 3: Resident Layout + Dashboard Frontend Page

**Goal:** Create `ResidentLayout` and the `resident/dashboard` Inertia page component so the dashboard renders correctly in a browser.

Tasks:
- [x] Task: Create `resources/js/layouts/resident-layout.jsx` modeled after `admin-layout.jsx` — sidebar with: BarangaECO brand + "Resident Portal" subtitle (green accent instead of blue), nav items (Dashboard `/resident/dashboard`, Document Requests `/resident/document-requests`, Complaints `/resident/complaints`, Announcements `/resident/announcements`), Settings link `/settings/profile`, and a POST logout link; active state detection uses `usePage().url` [7961fd4]
- [x] Task: Create `resources/js/pages/resident/dashboard.jsx` — imports `ResidentLayout`, wraps content in layout; shows a greeting header with resident name; four stat/info sections: "Pending Requests" card (count + link), "Open Complaints" card (count + link), today's waste schedule panel (zone name + status, or empty state), recent announcements list (title + published date, up to 3 items) [7961fd4]
- [x] Task: Wire `ResidentLayout` as the default layout for the dashboard page using the Inertia persistent layout pattern (`Dashboard.layout = (page) => <ResidentLayout>{page}</ResidentLayout>`) [7961fd4]
- [x] Task: Run `npm run build` to verify no build errors [7961fd4]
- [x] Task: Run `npm run lint:check` and `npm run format:check` — fix any issues [7961fd4]
- [ ] Verification: Browse to `https://barangaeco.test/resident/dashboard` as a resident — sidebar visible with green accent, stat cards populated, no console errors [checkpoint marker]

## Phase 4: Document Requests Controller and Page

**Goal:** Implement the document requests list, submit, and cancel flows with full backend tests and a working frontend page.

Tasks:
- [x] Task: Write feature tests for `Resident\DocumentRequestController`:
  - `GET /resident/document-requests` returns Inertia page `resident/document-requests/index` with paginated `requests` prop scoped to the authenticated resident
  - A resident cannot see another resident's requests (items from another resident are absent from the response)
  - `POST /resident/document-requests` with valid payload creates a `pending` request and redirects back
  - `POST /resident/document-requests` with missing fields returns 422 with validation errors
  - `DELETE /resident/document-requests/{id}` on a `pending` request sets status to `cancelled` and redirects
  - `DELETE /resident/document-requests/{id}` on a `resolved` request returns 422
  - `DELETE /resident/document-requests/{id}` owned by another resident returns 403
  (TDD: Red) [162312e]
- [x] Task: Implement `Resident\DocumentRequestController::index()` — scope to `$resident->documentRequests()->latest()->paginate(20)`, return `Inertia::render('resident/document-requests/index', ['requests' => $paginated])` [162312e]
- [x] Task: Implement `Resident\DocumentRequestController::store()` — validate `document_type`, `purpose`, `reason` (all required, string, max:255/string); create with `status = 'pending'`; redirect to `resident.document-requests.index` [162312e]
- [x] Task: Implement `Resident\DocumentRequestController::cancel()` — load resident, enforce ownership (403), check `status === 'pending'` (422 otherwise), update to `cancelled`, redirect back [162312e]
- [x] Task: Create `resources/js/pages/resident/document-requests/index.jsx` — table listing with status badges (amber/green/red/slate); "New Request" button that toggles an inline dialog/modal with the three-field form; cancel button on pending rows that sends an Inertia DELETE; pagination links [162312e]
- [x] Task: Run `vendor/bin/pint --dirty --format agent`; run `npm run build` [162312e]
- [x] Task: Run `php artisan test --compact --filter=ResidentDocumentRequest` — all tests green [162312e]
- [ ] Verification: Browse to `https://barangaeco.test/resident/document-requests`; submit a new request; confirm it appears with `pending` status; cancel it; confirm status changes to `cancelled` [checkpoint marker]

## Phase 5: Complaints Controller and Page

**Goal:** Implement the complaints list, submit, and cancel flows with full backend tests and a working frontend page.

Tasks:
- [x] Task: Write feature tests for `Resident\ComplaintController`:
  - `GET /resident/complaints` returns Inertia page `resident/complaints/index` with `complaints` and `zones` props; complaints are scoped to the authenticated resident
  - A resident cannot see another resident's complaints
  - `POST /resident/complaints` with valid payload creates an `open` complaint with `priority = 'low'`, `created_by = auth()->id()`, and redirects
  - `POST /resident/complaints` missing required fields returns 422
  - `DELETE /resident/complaints/{id}` on an `open` complaint sets status to `cancelled` and redirects
  - `DELETE /resident/complaints/{id}` on an `in_progress` complaint returns 422
  - `DELETE /resident/complaints/{id}` owned by another resident returns 403
  (TDD: Red)
- [x] Task: Implement `Resident\ComplaintController::index()` — scope to `$resident->complaints()->with('zone')->latest()->paginate(20)`; pass active `zones` for the form; return `Inertia::render('resident/complaints/index', [...])`
- [x] Task: Implement `Resident\ComplaintController::store()` — validate `zone_id` (nullable, exists:zones,id), `complaint_type`, `complaint_against`, `description` (all required); create with `priority = 'low'`, `status = 'open'`, `created_by = auth()->id()`; redirect to `resident.complaints.index`
- [x] Task: Implement `Resident\ComplaintController::cancel()` — enforce ownership (403), check `status === 'open'` (422 otherwise), update to `cancelled`, redirect back
- [x] Task: Create `resources/js/pages/resident/complaints/index.jsx` — table listing with status badges; "File Complaint" button opening a modal/dialog with zone select (optional) and required text/textarea fields; cancel button on open complaints rows
- [x] Task: Run `vendor/bin/pint --dirty --format agent`; run `npm run build`
- [x] Task: Run `php artisan test --compact --filter=ResidentComplaint` — all tests green
- [ ] Verification: Browse to `https://barangaeco.test/resident/complaints`; file a complaint; confirm it appears with `open` status; cancel it; confirm status changes to `cancelled` [checkpoint marker]

## Phase 6: Announcements Controller and Page

**Goal:** Implement the announcements read-only feed with backend tests and frontend page.

Tasks:
- [x] Task: Write feature tests for `Resident\AnnouncementController`:
  - `GET /resident/announcements` returns Inertia page `resident/announcements/index` with paginated `announcements` prop
  - Response only includes announcements where `published_at` is not null, not in the future, and `target_audience` is `all` or `residents`
  - Announcements with `target_audience = 'collectors'` are excluded
  - Unpublished announcements (null `published_at`) are excluded
  (TDD: Red) [cbb0d9e]
- [x] Task: Implement `Resident\AnnouncementController::index()` — query published announcements for `all`/`residents` audience, `paginate(15)`, return `Inertia::render('resident/announcements/index', ['announcements' => $paginated])` [cbb0d9e]
- [x] Task: Create `resources/js/pages/resident/announcements/index.jsx` — paginated card/list layout; each card shows title, body truncated to 200 chars, published date formatted, and a category/audience badge; pagination links [cbb0d9e]
- [x] Task: Run `vendor/bin/pint --dirty --format agent`; run `npm run build` [cbb0d9e]
- [x] Task: Run `php artisan test --compact --filter=ResidentAnnouncement` — all tests green [cbb0d9e]
- [ ] Verification: Browse to `https://barangaeco.test/resident/announcements`; confirm only published resident-targeted announcements appear; pagination works [checkpoint marker]

## Phase 7: Quality Gates and Final Commit

**Goal:** Full CI suite passes; tracks.md updated; phase commit made.

Tasks:
- [ ] Task: Run full test suite `php artisan test --compact` — all tests green
- [ ] Task: Run `composer run ci:check` — lint, format, types, tests all pass; fix any failures
- [ ] Task: Update `conductor/tracks.md` — move `resident_web_portal_20260528` from Active to Completed with checkpoint commit hash
- [ ] Verification: `composer run ci:check` exits 0; all resident routes resolvable in browser; no 500 errors on any resident page [checkpoint marker]
