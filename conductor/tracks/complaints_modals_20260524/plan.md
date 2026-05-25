# Implementation Plan: Complaint Management Modals

## Overview

Three phases to deliver the complaint detail modal, new complaint modal, and test coverage. All backend routes are already implemented — this track is purely frontend modal work plus Pest tests for the existing store and updateStatus endpoints.

**Phase 1** wires up the complaint detail modal (clicking a row).
**Phase 2** wires up the new complaint modal ("Log Complaint" button).
**Phase 3** writes Pest feature tests and runs all quality gates.

---

## Phase 1: Complaint Detail Modal

Goal: Clicking any complaint row opens a two-panel detail modal. "Update Status" inside the modal hands off to the existing `StatusModal`.

Tasks:

- [x] Task: Verify the complaints controller index response eager-loads the `barangay` relationship on each complaint; confirm which resident fields (name, contact, email) are available directly on the complaint object vs. a nested relationship. Note findings to align modal field access. (TDD: Read controller + check existing page prop shape) [180fe52]

- [x] Task: Add `detailTarget` state to `ComplaintsIndex` (`useState(null)`); wire `onClick={() => setDetailTarget(c)}` to each `<tr>` in the table body; update the "Update Status" action button to call `setDetailTarget(c)` and stop propagation so the row click and button click behave consistently. (TDD: Write Pest test asserting the index page renders complaint rows, confirm no breakage) [180fe52]

- [x] Task: Implement `ComplaintDetailModal` component in `index.jsx`. Structure: `fixed inset-0 z-50` backdrop, centered white panel (`max-w-2xl`), header with formatted complaint ID (`CMP-YYYY-NNN`) and status badge, two-column body (left: resident info with colored avatar initials, right: complaint details), footer with Close + Update Status buttons. Pass `complaint`, `onClose`, and `onUpdateStatus` props. (TDD: Manual — open the page, click a row, verify layout matches Figma) [180fe52]

- [x] Task: Implement the `formatComplaintId(complaint)` helper inside the file — takes `{ id, created_at }` and returns `CMP-${year}-${String(id).padStart(3, '0')}`. (TDD: Write a simple inline unit assertion or a Pest unit test for this pure function) [180fe52]

- [x] Task: Add backdrop click and Escape key handlers to `ComplaintDetailModal` so both close the modal. Use `useEffect` for the keydown listener; clean up on unmount. (TDD: Manual — press Escape and click backdrop, modal closes) [180fe52]

- [x] Task: Wire the "Update Status" button in `ComplaintDetailModal` to call `onUpdateStatus(complaint)`. In `ComplaintsIndex`, implement `handleUpdateStatusFromDetail(complaint)` that sets `detailTarget(null)` then `setStatusTarget(complaint)`. Render `<ComplaintDetailModal>` adjacent to the existing `<StatusModal>` render. (TDD: Manual — open detail modal, click Update Status, verify StatusModal opens for the correct complaint) [180fe52]

- [x] Verification: Open the complaints page in the browser, click a row, confirm the detail modal shows correct data, click Update Status, confirm the status picker opens, change status, confirm it saves and the table row updates. [checkpoint: 7edc7d4]

---

## Phase 2: New Complaint Modal

Goal: "Log Complaint" button opens a form modal. Submitting POSTs to the store route and the page reloads.

Tasks:

- [x] Task: Add `showNewModal` state (`useState(false)`) to `ComplaintsIndex`; wire the "Log Complaint" button `onClick` to `setShowNewModal(true)`. (TDD: No test needed — pure state wire-up, covered by Phase 3 feature test) [7b415e7]

- [x] Task: Implement `NewComplaintModal` component in `index.jsx`. Structure: `fixed inset-0 z-50` backdrop, centered white panel (`max-w-lg`), title "New Complaint", subtitle "Log a resident issue for tracking and resolution.", form fields (Resident Name text input, Barangay select, Complaint Type select with options Road/Noise/Environment/Infrastructure/Other, Complain Against text input, Complaint textarea), Cancel + Create Complaint buttons. Accept `barangays` and `onClose` props. (TDD: Manual — open modal, verify all fields render correctly) [7b415e7]

- [x] Task: Add local form state to `NewComplaintModal` (`useState` object for all fields) and a `errors` state object. Implement client-side validation: all fields required; set `errors` and abort submit if any field is empty. Show inline error text below each invalid field using a red `text-xs` style. (TDD: Manual — submit with empty fields, verify error messages appear under each field) [7b415e7]

- [x] Task: Implement `handleSubmit` in `NewComplaintModal`: clear errors, set `loading(true)`, call `router.post(complaintRoutes.store().url, formData, { onSuccess: onClose, onError: (e) => setErrors(e), onFinish: () => setLoading(false) })`. Disable the "Create Complaint" button and show "Saving…" while loading. (TDD: Write Pest feature test — `test_admin_can_store_complaint` — POST with valid data, assert 302 redirect and complaint exists in DB) [7b415e7]

- [x] Task: Add Escape key handler to `NewComplaintModal` (same `useEffect` pattern as detail modal). Add backdrop click handler. (TDD: Manual — press Escape, modal closes) [7b415e7]

- [x] Verification: Open the complaints page, click "Log Complaint", fill all fields, submit. Confirm the modal closes, the table reloads, and the new complaint appears. Submit with empty fields and confirm inline errors. [checkpoint: a0b3ba2]

---

## Phase 3: Tests and Quality Gates

Goal: Pest feature tests cover the store and updateStatus endpoints with happy path and validation failure cases. All CI checks pass.

Tasks:

- [x] Task: Create `php artisan make:test --pest ComplaintsStoreTest`. Write `test_admin_can_store_complaint`: act as admin, POST valid payload to `admin.complaints.store`, assert 302 and DB has complaint. Write `test_store_complaint_requires_all_fields`: POST empty payload, assert 422 (or redirect back with errors). (TDD: Red — write tests; Green — run tests, they should pass against existing controller) [ff035fc]

- [x] Task: Create `php artisan make:test --pest ComplaintsUpdateStatusTest`. Write `test_admin_can_update_complaint_status`: act as admin, create a complaint factory, PATCH to `admin.complaints.updateStatus` with `{ status: 'in_progress' }`, assert 302 and DB shows updated status. Write `test_update_status_rejects_invalid_status`: PATCH with `{ status: 'invalid' }`, assert validation error. (TDD: Red → Green cycle) [ff035fc]

- [x] Task: Run `php artisan test --compact --filter=Complaints` to confirm all complaint tests pass. [ff035fc]

- [x] Task: Run `npm run lint:check` and `npm run format:check`; fix any issues with `npm run lint` and `npm run format`. [ff035fc]

- [x] Task: Run `npm run types:check`; resolve any type errors (JSX files should have no issues, but confirm no import errors). [ff035fc]

- [x] Task: Run `vendor/bin/pint --dirty --format agent` to format any PHP files touched (test files). [ff035fc]

- [x] Verification: Run `composer run ci:check` (or the full gate sequence manually). All checks green. Commit: `phase(3): complaint modals tests and quality gates`. [checkpoint: 458c322]

---

## Commit Strategy

| After Phase | Commit message |
|---|---|
| Phase 1 | `phase(1): complaint detail modal with status handoff` |
| Phase 2 | `phase(2): new complaint form modal with store submission` |
| Phase 3 | `phase(3): complaint modals tests and quality gates` |
