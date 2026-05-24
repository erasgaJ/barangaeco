# Spec: Complaint Management Modals

## Track ID
`complaints_modals_20260524`

---

## Overview

The Complaints page (`resources/js/pages/admin/complaints/index.jsx`) currently displays a table of complaints with a simple `StatusModal` for changing status. This track adds two interactive modals to complete the complaint management workflow:

1. **Complaint Detail Modal** — clicking a table row opens a two-panel view showing full resident info and complaint details, with an "Update Status" button that triggers the existing `StatusModal`.
2. **New Complaint Modal** — the "Log Complaint" button opens a form modal that POSTs to the existing `admin.complaints.store` route.

All backend routes are already implemented. No new PHP code is required unless the controller response needs to include additional relationship data.

---

## Background

- The existing `ComplaintsIndex` page renders a paginated table with filter controls (search, barangay, priority).
- The existing `StatusModal` handles `PATCH admin/complaints/{complaint}/status` and is already wired up via `statusTarget` state.
- Complaint cards are rows in a `<table>` — not yet clickable for the detail view.
- The "Log Complaint" button renders but does nothing.
- The `Complaint` model has: `id`, `resident_name`, `barangay_id`, `complaint_type`, `complaint_against`, `complaint` (description), `status` (open / in_progress / resolved), `priority` (low / medium / high), `created_at`.
- Barangays are passed as a prop (`barangays`) to the page component.

---

## Functional Requirements

### FR-1 — Complaint Detail Modal (View)
**Description:** Clicking any complaint table row opens a modal that shows full complaint details and resident information.

**Acceptance Criteria:**
- Clicking a row sets that complaint as `detailTarget` state and renders the detail modal.
- The modal header displays the formatted complaint ID (e.g., `CMP-2024-001` derived from `id`) and a status badge using `STATUS_STYLES`.
- Left panel "RESIDENT INFORMATION" shows: colored avatar with initials from `resident_name`, the resident name, a "Verified Resident" label, barangay name, and any additional resident fields available on the complaint object.
- Right panel "COMPLAINT DETAILS" shows: complaint type badge, "Complain Against" value, and a read-only description block.
- Footer has a "Close" button (border style) and an "Update Status" button (blue filled, checkmark icon).
- "Update Status" closes the detail modal and opens the existing `StatusModal` for the same complaint.
- Pressing Escape or clicking the backdrop closes the modal.
- The modal does not break if optional fields (`contact_number`, `email`) are absent from the complaint object.

**Priority:** High

---

### FR-2 — New Complaint Modal (Create)
**Description:** The "Log Complaint" button opens a form modal for logging a new complaint.

**Acceptance Criteria:**
- Clicking "Log Complaint" opens the `NewComplaintModal`.
- The modal title is "New Complaint" with subtitle "Log a resident issue for tracking and resolution."
- Form fields: Resident Name (text), Barangay (select from `barangays` prop), Complaint Type (select: Road, Noise, Environment, Infrastructure, Other), Complain Against (text), Complaint (textarea).
- All fields are required client-side; submitting with empty fields shows inline validation errors.
- The "Create Complaint" button (blue filled) submits via `router.post` to `complaintRoutes.store().url`.
- The "Cancel" button closes the modal without submitting.
- On successful submission (Inertia redirect), the modal closes automatically via the `onFinish` callback and the page reloads with the new complaint.
- Pressing Escape closes the modal.
- While submitting, the "Create Complaint" button is disabled and shows "Saving…".

**Priority:** High

---

### FR-3 — Complaint ID Formatting
**Description:** Complaint IDs are displayed in the human-readable format `CMP-YYYY-NNN`.

**Acceptance Criteria:**
- Given a complaint with `id: 4` and `created_at: "2023-08-15T..."`, the formatted ID is `CMP-2023-004`.
- The year is taken from `created_at`.
- The sequence number is zero-padded to 3 digits.
- The formatted ID is displayed in the detail modal header only (not in the table).

**Priority:** Medium

---

## Non-Functional Requirements

### NFR-1 — No Shadcn/ui Dialog
- Modals are implemented as custom components using a `fixed inset-0 z-50` overlay pattern, consistent with the existing `StatusModal`.

### NFR-2 — Tailwind CSS v4 Only
- All styles use Tailwind utility classes. No inline `style` attributes or CSS modules.

### NFR-3 — JSX Only
- Files remain `.jsx` (no TypeScript). No type annotations.

### NFR-4 — Test Coverage
- Pest feature tests cover: `POST admin/complaints` (store) and `PATCH admin/complaints/{complaint}/status` (updateStatus).
- Minimum: happy path + validation failure for each endpoint.

---

## User Stories

### US-1 — View Complaint Details
**As** a barangay admin,
**I want** to click a complaint row to view full details,
**So that** I can review the complete issue without navigating away from the complaints list.

**Given** the complaints table is loaded with at least one complaint,
**When** I click any table row,
**Then** a detail modal opens showing the complaint ID, status badge, resident information, complaint type, who it is against, and the full description.

---

### US-2 — Update Status from Detail View
**As** a barangay admin,
**I want** to update a complaint's status from the detail modal,
**So that** I can quickly change status after reviewing the details without extra navigation.

**Given** the complaint detail modal is open,
**When** I click "Update Status",
**Then** the detail modal closes and the existing status update modal opens for the same complaint.

---

### US-3 — Log a New Complaint
**As** a barangay admin,
**I want** to log a new complaint on behalf of a resident,
**So that** issues reported in person can be recorded and tracked digitally.

**Given** I click "Log Complaint",
**When** I fill in all required fields and click "Create Complaint",
**Then** the complaint is saved and the table refreshes to include the new entry.

---

### US-4 — Close Modals Without Saving
**As** a barangay admin,
**I want** to close any open modal without saving,
**So that** I can dismiss accidental clicks or abort form entry.

**Given** any modal is open,
**When** I click "Close", "Cancel", or the backdrop overlay,
**Then** the modal closes and no data is submitted.

---

## Technical Considerations

- The existing `StatusModal` component remains unchanged. `ComplaintDetailModal` will call the parent's `onUpdateStatus(complaint)` callback rather than owning the status modal itself.
- The page component manages three state values: `detailTarget`, `statusTarget`, and `showNewModal`.
- When "Update Status" is clicked inside the detail modal: set `detailTarget = null`, set `statusTarget = complaint`.
- Wayfinder import: `import complaintRoutes from '@/routes/admin/complaints'`. Use `complaintRoutes.store().url` for POST and `complaintRoutes.updateStatus(id).url` for PATCH.
- The `barangays` prop already available on the page must be passed down to `NewComplaintModal`.
- The controller's index response may need to be verified to ensure it loads the `barangay` relationship on each complaint for display in the detail modal.

---

## Out of Scope

- Editing an existing complaint's fields (type, description, etc.) — only status updates are supported.
- Deleting complaints.
- Attaching photos or files to a complaint via the admin web app.
- Resident-facing complaint submission (mobile API, separate track).
- Pagination changes or server-side search.

---

## Open Questions

1. Does the `Complaint` controller index response currently eager-load `resident` (as a model relationship) or is resident data stored as plain columns on the `complaints` table? This affects how resident name/contact/email are accessed in the detail modal.
2. Should the detail modal show a "priority" badge as well, or is priority display limited to the table?
3. Are `contact_number` and `email` available on the complaint object, or only on the linked `Resident` model?
