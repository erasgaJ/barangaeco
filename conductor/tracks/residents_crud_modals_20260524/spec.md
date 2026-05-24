# Spec: Residents CRUD Modals

## Track ID
`residents_crud_modals_20260524`

---

## Overview

The Residents page (`resources/js/pages/admin/residents/index.jsx`) already renders a searchable, filterable table of residents with Edit and Delete action buttons per row and an "Add Resident" header button. However, none of these buttons are wired up — no modal components exist. This track adds the three CRUD modals and connects them to the existing backend routes via Inertia.js.

---

## Background

- Backend routes fully implemented: `POST /admin/residents`, `PUT /admin/residents/{resident}`, `DELETE /admin/residents/{resident}`
- Wayfinder-generated routes available at `@/routes/admin/residents`
- The `Resident` model links to a `User` (via `user_id`) and a `Barangay` (via `barangay_id`)
- Resident fields: `full_name`, `address`, `barangay_id`, `contact_number`, `email`, `photo` (optional file upload), `verification_status`
- Photo upload requires `multipart/form-data`; for PUT requests use `_method: PUT` spoofing with `router.post(..., { forceFormData: true })`
- Resident ID format: `RES-YYYY-NNNN` (e.g., `RES-2023-0894`)

---

## Functional Requirements

### FR-1 — Add Resident Modal

**Description:** Admin can create a new resident record from the residents index page.

**Acceptance Criteria:**
- Clicking "Add Resident" opens the modal
- Modal shows a circular photo upload area with person icon, pencil overlay icon, "UPLOAD PHOTO" label, and "JPG or PNG, max 2MB" hint
- Selecting a file updates the preview to show the uploaded image
- Fields: Full Name (required), Address (required), Barangay (select from list, required), Contact Number (required, placeholder "+63 9XX XXX XXXX"), Email Address (required)
- Submitting valid data calls `POST /admin/residents`, closes the modal on success, and refreshes the page
- Server-side validation errors display inline below each field
- "CANCEL" button closes the modal without submitting
- Photo selection is optional — submitting without a photo is allowed if the backend permits it

**Priority:** High

---

### FR-2 — Edit Resident Modal

**Description:** Admin can update an existing resident's details.

**Acceptance Criteria:**
- Clicking the Edit (pencil) icon on a row opens the Edit modal pre-filled with that resident's data
- Modal header shows: resident's photo (or initials avatar fallback) + Resident ID badge (e.g., "RES-2023-0894")
- Editable fields: Full Name, Address, Barangay (select), Contact Number
- Email is not shown in the edit form (shown on the list only)
- Submitting valid data calls `PUT /admin/residents/{id}` (via `_method: PUT` spoofing), closes the modal on success, and refreshes the page
- Server-side validation errors display inline below each field
- "Cancel" button closes the modal without submitting

**Priority:** High

---

### FR-3 — Delete Resident Confirmation Modal

**Description:** Admin can delete a resident record after confirming the action.

**Acceptance Criteria:**
- Clicking the Delete (trash) icon on a row opens the confirmation modal for that resident
- Modal shows: warning triangle icon (amber/red), title "Delete Resident Record", message "Are you sure you want to delete this resident record? This action cannot be undone."
- Modal shows a resident card with the resident's photo/initials, full name, and formatted ID (e.g., "ID: RES-2023-089")
- "CANCEL" button (outline) closes the modal without deleting
- "DELETE RECORD" button (red filled) calls `DELETE /admin/residents/{id}`, closes the modal on success, and refreshes the page
- Button shows a loading state while the request is in flight

**Priority:** High

---

### FR-4 — Form State Reset

**Acceptance Criteria:**
- Opening the Add modal always starts with empty fields
- Closing any modal (Cancel or after success) resets all form state
- Photo preview resets when the Add modal is closed and reopened

---

## Non-Functional Requirements

### NFR-1 — Code Style
- `.jsx` files, no TypeScript
- No Shadcn/ui Dialog — implement as a `fixed inset-0 z-50` overlay div with a centered white panel
- Tailwind CSS v4 utility classes only
- No comments unless logic is non-obvious
- Follow the same modal pattern used in `resources/js/pages/admin/complaints/index.jsx`

### NFR-2 — Performance
- Photo preview uses `URL.createObjectURL` (not FileReader) for instant preview
- Client-side file size check (2 MB) before upload to give immediate feedback

---

## User Stories

### US-1 — Add a New Resident
**As** a barangay admin,
**I want** to add a new resident record with their photo and details,
**So that** the resident is registered in the system with `verification_status: pending`.

**Given** I click "Add Resident",
**When** I fill in all required fields and click "SAVE RESIDENT",
**Then** the resident is created, the modal closes, and the table refreshes to show the new entry.

---

### US-2 — Edit a Resident
**As** a barangay admin,
**I want** to correct or update a resident's details,
**So that** the record stays accurate.

**Given** I click the Edit icon on a resident row,
**When** the modal opens pre-filled and I update the fields and click "Save Changes",
**Then** the resident record is updated and the table reflects the changes.

---

### US-3 — Delete a Resident
**As** a barangay admin,
**I want** to delete an incorrect or duplicate resident record,
**So that** the database stays clean.

**Given** I click the Delete icon on a resident row,
**When** the confirmation modal appears and I click "DELETE RECORD",
**Then** the resident is permanently removed and the table no longer shows the entry.

---

## Technical Considerations

1. **Method spoofing for file uploads:** Laravel doesn't support `PUT` with `multipart/form-data`. Use `router.post(url, { ...data, _method: 'PUT' }, { forceFormData: true })`.
2. **Resident ID formatting:** Format as `RES-${year}-${String(id).padStart(4, '0')}`. The `created_at` year or a separate `registered_year` field can be used — check the model.
3. **Photo field name:** Likely `photo` on the model. Confirm with the controller's store/update request.
4. **Barangay list:** Already available as the `barangays` prop on the page component.
5. **Inertia page refresh:** Use `router.post/put/delete` with `{ onSuccess: onClose }` so the modal closes after the Inertia redirect refreshes props.

---

## Out of Scope

- Inline editing (double-click to edit cell)
- Bulk delete
- Resident verification status changes (separate admin action)
- Photo cropping/resizing

---

## Open Questions

1. Is `email` intentionally excluded from the Edit modal (Figma shows it absent), or is this a design oversight?
2. Is the `photo` field nullable on the backend — can a resident be created without a photo?
3. What is the exact resident ID format — is `created_at.year` correct, or is there a `resident_id_number` column?
