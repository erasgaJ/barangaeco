# Specification: Resident Web Portal

## Overview

Build a web-based portal for authenticated residents, accessible at `/resident/*`. Residents currently have no web UI — only a mobile API. This portal gives residents a browser-based interface to view their personal stats, submit and track document requests, file and manage complaints, and read community announcements.

## Background

The system has three user roles stored in `users.role`: `admin`, `resident`, and `collector`. The admin web app lives at `/admin/*` with `role:admin` middleware and uses `AdminLayout`. The `EnsureRole` middleware already exists and accepts role arguments. The resident `User` model has a `resident()` hasOne relation linking to the `Resident` model, which in turn has `documentRequests()` and `complaints()` relations. The mobile API controllers (`Api\Resident\*`) contain the business logic that the web controllers should mirror using `Inertia::render()` instead of JSON responses.

## Functional Requirements

### FR-1: Resident Layout Shell

**Description:** A `ResidentLayout` component provides a persistent navigation sidebar and main content area for all resident pages, mirroring the structure of `AdminLayout`.

**Acceptance Criteria:**
- Sidebar displays branding ("BarangaECO", subtitle "Resident Portal")
- Navigation links: Dashboard, Document Requests, Complaints, Announcements
- Active link is visually highlighted (matching admin-layout pattern)
- Logout link POSTs to `/logout`
- Layout wraps all resident pages via JSX `children` prop

**Priority:** High (blocker for all other FRs)

---

### FR-2: Resident Route Group

**Description:** All resident web routes live under `/resident` prefix with `['auth', 'verified', 'role:resident']` middleware, and are named under the `resident.` namespace.

**Acceptance Criteria:**
- `GET /resident/dashboard` renders resident dashboard (named `resident.dashboard`)
- `GET /resident/document-requests` renders document request list (named `resident.document-requests.index`)
- `POST /resident/document-requests` submits a new request (named `resident.document-requests.store`)
- `DELETE /resident/document-requests/{documentRequest}` cancels a request (named `resident.document-requests.cancel`)
- `GET /resident/complaints` renders complaints list (named `resident.complaints.index`)
- `POST /resident/complaints` submits a new complaint (named `resident.complaints.store`)
- `DELETE /resident/complaints/{complaint}` cancels a complaint (named `resident.complaints.cancel`)
- `GET /resident/announcements` renders announcements feed (named `resident.announcements.index`)
- A non-resident authenticated user hitting any `/resident/*` route receives a 403 response

**Priority:** High (blocker for all other FRs)

---

### FR-3: Resident Dashboard Page

**Description:** The dashboard page shows a personal overview for the logged-in resident: pending document requests count, open complaints count, today's waste collection schedule for their zone, and the 3 most recent published announcements.

**Acceptance Criteria:**
- Displays resident's name and barangay name in a greeting header
- Shows a "Pending Requests" stat card with count linking to `/resident/document-requests`
- Shows an "Open Complaints" stat card with count linking to `/resident/complaints`
- Shows today's waste collection schedule status for the resident's zone (or "No collection scheduled today" if none)
- Shows up to 3 recent announcements (title, published date); each links to `/resident/announcements`
- If the authenticated user has no linked `Resident` record, redirects to `/dashboard` with a flash message

**Priority:** High

---

### FR-4: Document Requests Page

**Description:** The document requests page lists all of the resident's own document requests with pagination, and provides a form to submit a new request.

**Acceptance Criteria:**
- Lists document requests paginated (20 per page), sorted by newest first
- Each row shows: document type, purpose, status badge, submitted date
- Status badges: `pending` (amber), `resolved`/`approved` (green), `rejected` (red), `cancelled` (slate)
- A "New Request" button opens a form (modal or inline) with fields: document type (text), purpose (text), reason (textarea) — all required
- Submitting the form creates a new request with `status = 'pending'` for the resident
- A "Cancel" action appears only on `pending` requests; triggers a DELETE request
- Cancelling a non-pending request is rejected with a 422 validation error
- Ownership is enforced: residents can only see and cancel their own requests

**Priority:** High

---

### FR-5: Complaints Page

**Description:** The complaints page lists all of the resident's own complaints with pagination, and provides a form to file a new complaint.

**Acceptance Criteria:**
- Lists complaints paginated (20 per page), sorted by newest first
- Each row shows: complaint type, complaint against, status badge, filed date
- Status badges: `open` (amber), `in_progress` (blue), `resolved` (green), `cancelled` (slate)
- A "File Complaint" button opens a form (modal or inline) with fields:
  - Zone (nullable select, sourced from active zones)
  - Complaint type (text, required)
  - Complaint against (text, required)
  - Description (textarea, required)
- Submitting creates a complaint with `priority = 'low'`, `status = 'open'`, `created_by = auth()->id()`
- A "Cancel" action appears only on `open` complaints; triggers a DELETE request
- Cancelling a non-open complaint is rejected with a 422 validation error
- Ownership is enforced: residents can only see and cancel their own complaints

**Priority:** High

---

### FR-6: Announcements Page

**Description:** The announcements page shows a paginated, read-only feed of published announcements targeted at residents or all users.

**Acceptance Criteria:**
- Lists published announcements (`published_at` is not null and not in the future) targeted to `all` or `residents`
- Paginated (15 per page), sorted by newest published date
- Each item shows: title, body (truncated at 200 characters with ellipsis), published date, category badge
- Announcements targeted to `collectors` only are excluded

**Priority:** Medium

---

### FR-7: Redirect Logic for Unauthenticated / Wrong-Role Users

**Description:** Proper redirect guards ensure residents land on their portal, not the admin or generic dashboard.

**Acceptance Criteria:**
- The existing `GET /dashboard` route (used by Fortify's post-login redirect) should redirect `resident` users to `/resident/dashboard`
- Admin users on `/resident/*` receive a 403 (handled by existing `EnsureRole` middleware)
- Unauthenticated users on `/resident/*` are redirected to `/login` (handled by existing `auth` middleware)

**Priority:** High

---

## Non-Functional Requirements

### NFR-1: Authorization / Data Isolation

Every resident web controller method must scope data queries to the authenticated user's linked `Resident` record. No resident may view, cancel, or act on another resident's data.

### NFR-2: Test Coverage

All new controllers must have Pest feature tests covering: happy path, authorization (403 when accessing another resident's record), validation errors (422), and role guard (non-resident cannot access routes). Minimum 80% coverage maintained.

### NFR-3: Code Style

- PHP: follows Pint formatting; curly braces on all control structures; explicit return types; PHPDoc where needed.
- JSX: follows ESLint + Prettier config; `.jsx` files (no TypeScript); uses Shadcn/ui components from `@/components/ui/`; imports Wayfinder-generated routes instead of hardcoded URLs.

### NFR-4: Wayfinder Compatibility

All frontend `href` and form actions must use Wayfinder-generated imports (`@/routes/` or `@/actions/`) after the route is registered, so that URL changes propagate automatically.

---

## User Stories

### US-1: View Personal Dashboard

**As** a logged-in resident,  
**I want** to see my pending requests and complaints at a glance,  
**So that** I know if I need to follow up on anything.

**Given** I am logged in as a resident with a linked Resident record,  
**When** I visit `/resident/dashboard`,  
**Then** I see stat cards for my pending document requests and open complaints, today's waste schedule, and recent announcements.

---

### US-2: Submit a Document Request

**As** a logged-in resident,  
**I want** to submit a barangay document request online,  
**So that** I do not need to visit the barangay office to initiate the request.

**Given** I am on the Document Requests page,  
**When** I fill in document type, purpose, and reason, then click submit,  
**Then** a new request in `pending` status appears in my list.

---

### US-3: Cancel a Pending Document Request

**As** a logged-in resident,  
**I want** to cancel a pending document request I submitted by mistake,  
**So that** the admin queue is not cluttered with unwanted requests.

**Given** I have a `pending` document request,  
**When** I click Cancel on that request,  
**Then** its status changes to `cancelled` and the cancel button disappears.

---

### US-4: File a Complaint

**As** a logged-in resident,  
**I want** to file a complaint about waste collection or a community issue,  
**So that** the barangay can investigate and resolve the issue.

**Given** I am on the Complaints page,  
**When** I complete the complaint form and submit,  
**Then** a new `open` complaint appears in my list.

---

### US-5: Browse Announcements

**As** a logged-in resident,  
**I want** to read community announcements from the barangay,  
**So that** I stay informed about local news and events.

**Given** I am on the Announcements page,  
**When** the page loads,  
**Then** I see a paginated list of published announcements intended for residents.

---

## Technical Considerations

- **Resident profile link:** `auth()->user()->resident()` returns the linked `Resident` model. If `null`, the controller should redirect gracefully.
- **Zone data for complaints form:** The `zones` table with `is_active = true` should be passed as a prop to the complaints page (same pattern as admin complaints controller).
- **Dashboard post-login redirect:** Fortify's `RedirectIfAuthenticated` or the existing generic dashboard controller at `GET /dashboard` needs to fork on `role === 'resident'` to redirect to `/resident/dashboard` instead of showing the admin overview.
- **Layout pattern:** `ResidentLayout` should mirror `AdminLayout` exactly in structure (sidebar + main area) with resident-specific nav items and "Resident Portal" subtitle. Use green as the accent color (instead of admin's blue) to visually distinguish the portals.
- **No new dependencies** are required; all UI components exist in Shadcn/ui.
- **Pagination:** Use Inertia's `<Link>` with the Inertia paginator pattern (pass Laravel paginator directly as prop; use `data.links` for navigation).

---

## Out of Scope

- Resident registration / account creation flow (handled separately via Fortify)
- Resident editing their own profile data (covered by existing settings pages at `/settings/*`)
- Viewing the full detail of an announcement on a separate page (list view with truncated body is sufficient)
- Push notifications or real-time updates
- Collector role web pages

---

## Open Questions

1. Should the dashboard post-login redirect for admins keep pointing to `/dashboard` (the current generic route), or should admins also get their own `/admin/dashboard` route? This impacts how the redirect fork is structured.
2. Should document request "type" be a free-text field or a predefined dropdown (e.g., Barangay Clearance, Certificate of Residency, Indigency Certificate)? The mobile API uses free text — confirm whether the web portal should match.
3. Should residents be able to view the detail/history of a resolved or rejected document request (e.g., see the admin remarks or rejection feedback)? If yes, a show page or expandable row is needed.
