# Spec: Waste Collectors Management UI

## Overview

Replace the "Collector management coming soon." placeholder in `schedules.jsx` with a full CRUD interface for waste collectors. The feature lives inside the existing "Collector Management" tab of the Waste Management page.

## Background

The backend (`CollectorController`) is fully implemented with routes for index, store, update, and destroy. Wayfinder routes are generated at `@/routes/admin/waste/collectors`. The `WasteCollectionScheduleController` already passes a `collectors` prop to the schedules page. The frontend tab currently renders a static placeholder.

A `Collector` record stores `full_name` and `contact_number`. Email belongs to the related `User` model — the backend `store` endpoint accepts `name`, `email`, `full_name`, and `contact_number` to create both records together.

## Functional Requirements

### FR-1: Collector List

**Description:** When the "Collector Management" tab is active, display all collectors in a table with name, contact number, and email. An "Add Collector" button appears above the table.

**Acceptance Criteria:**
- Table columns: Full Name, Contact Number, Email Address, Actions
- Each row renders the collector's `full_name`, `contact_number`, and `user.email`
- Edit and Delete icon buttons appear in the Actions column of each row
- An "Add Collector" button (blue filled) is shown in the tab toolbar area
- Empty state message shown when the collectors list is empty
- `collectors` prop is passed from `WasteCollectionScheduleController::index()` as a plain collection (not paginated) with `user` relationship eager-loaded

**Priority:** High

---

### FR-2: Add Collector Modal

**Description:** Clicking "Add Collector" opens a modal form that submits a POST request to create a new collector.

**Acceptance Criteria:**
- Modal title: "Add New Collector"
- Fields: Full Name (placeholder "e.g. Juan Dela Cruz"), Contact Number (placeholder "09XX XXX XXXX"), Email Address (placeholder "e.g. juan@example.com")
- The `name` field (User model) is derived from `full_name` on submit — or submitted as the same value
- Cancel button dismisses the modal without submitting
- "Save Collector" (blue filled) submits via `router.post` to `collectors.store.url()`
- Inline validation errors displayed under each field on failed submission
- On success, modal closes and the list refreshes (Inertia reload)
- Fields are cleared when the modal is reopened

**Priority:** High

---

### FR-3: Edit Collector Modal

**Description:** Clicking the Edit icon on a collector row opens a pre-filled modal form that submits a PUT request.

**Acceptance Criteria:**
- Modal title: "Edit Collector"
- Fields pre-filled with the selected collector's `full_name`, `contact_number`, and `user.email`
- Email field is read-only or disabled (email is on the User model and the update endpoint only accepts `full_name` and `contact_number`)
- Cancel button dismisses the modal without saving
- "Save Changes" (blue filled) submits via `router.put` to `collectors.update.url(collector)`
- Inline validation errors displayed under each field on failed submission
- On success, modal closes and the list refreshes

**Priority:** High

---

### FR-4: Delete Collector Confirmation Modal

**Description:** Clicking the Delete icon on a collector row opens a compact confirmation dialog before deletion.

**Acceptance Criteria:**
- Modal title: "Delete Collector?"
- Subtitle: "This action cannot be undone."
- Warning box with red left border: "Are you sure you want to delete this collector? All associated records and schedules will be permanently removed from the system."
- Cancel button (outline style) dismisses without deleting
- Delete button (red filled) submits via `router.delete` to `collectors.destroy.url(collector)`
- On success, modal closes and the list refreshes

**Priority:** High

---

### FR-5: Modal Overlay Pattern

**Description:** Modals use a fixed full-screen overlay consistent with existing admin modal patterns — no Shadcn/ui Dialog.

**Acceptance Criteria:**
- Fixed overlay (`fixed inset-0`) with semi-transparent dark backdrop
- Modal card centered using flexbox
- Clicking outside the modal (on the backdrop) closes it
- ESC key closes the modal
- Body scroll locked while a modal is open

**Priority:** Medium

---

## Non-Functional Requirements

### NFR-1: Code Style

- Files are `.jsx`, no TypeScript
- Tailwind CSS v4 utility classes only
- Follows patterns established in `residents/index.jsx` and `schedules.jsx`
- Wayfinder routes imported from `@/routes/admin/waste/collectors`

### NFR-2: Test Coverage

- Pest feature tests cover: listing collectors, creating a collector (valid + validation failure), updating a collector (valid + validation failure), deleting a collector
- Minimum 80% coverage on affected backend code

## User Stories

**Story 1: View collector list**
As an admin, I want to see all collectors in the Collector Management tab, so I can have an overview of available waste collectors.

- Given I am on the Waste Management page
- When I click the "Collector Management" tab
- Then I see a table listing all collectors with their name, contact number, and email

**Story 2: Add a collector**
As an admin, I want to add a new collector, so I can assign them to future waste collection schedules.

- Given I am on the Collector Management tab
- When I click "Add Collector" and fill in all fields and click "Save Collector"
- Then a new collector is created and appears in the list

**Story 3: Edit a collector**
As an admin, I want to update a collector's details, so the information stays accurate.

- Given a collector exists in the list
- When I click the Edit icon and change a field and click "Save Changes"
- Then the collector's record is updated in the list

**Story 4: Delete a collector**
As an admin, I want to remove a collector who is no longer active, so they don't appear in scheduling options.

- Given a collector exists in the list
- When I click the Delete icon and confirm deletion in the modal
- Then the collector and their associated user account are removed from the system

## Technical Considerations

- The `Collector` model stores `full_name` and `contact_number`; `email` is on `User`. The store endpoint creates both.
- The update endpoint only touches `full_name` and `contact_number` on the `Collector` model — the email field in the Edit modal is display-only.
- `collectors` is already passed from `WasteCollectionScheduleController::index()`. Confirm that it eager-loads `user` and is passed as a plain collection (no pagination needed for the tab).
- Use `router.post/put/delete` with `{ preserveScroll: true }` and an `onSuccess` callback to close the modal.

## Out of Scope

- Pagination of the collectors list (the number of collectors per barangay is small)
- Bulk delete
- Collector activation/deactivation status toggle
- Collector avatar or profile photo upload
- Email change via Edit modal

## Open Questions

1. Should the `name` field (User model) submitted on `store` match `full_name` exactly, or is it a separate display name? (Current controller uses both `name` and `full_name` as separate fields — the Add modal should include a single "Full Name" input and send its value for both `name` and `full_name`.)
2. Should the collectors list in the tab be client-side filtered by name/contact? (Not in scope for this track — can be added later.)
