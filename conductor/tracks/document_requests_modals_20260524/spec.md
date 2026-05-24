# Spec: Document Request Modals

## Overview

Upgrade the Document Requests admin page (`resources/js/pages/admin/document-requests/index.jsx`) to replace the existing minimal modals with full Figma-compliant modals. Add two new read-only modals for resolved and rejected requests.

The backend (approve/reject routes, controller, model) is already implemented. This track is frontend-only with supporting Pest feature tests to cover the HTTP actions.

## Background

The current page has basic `ApproveModal` and `RejectModal` (single-column, textarea-only). The Figma designs require:

- A rich two-column **Review modal** (pending requests) showing full request details, submitted documents, payment info, and an admin remarks field before approve/reject.
- A **Reject modal** that collects a required rejection reason (split from the Review modal flow).
- A read-only **View Reason modal** (rejected requests) showing the rejection feedback in a highlighted box alongside request and attachment details.
- A read-only **View Copy modal** (resolved requests) showing a certificate preview panel with print/download actions.

## Functional Requirements

### FR-1: Review Modal (pending requests)

**Description:** When an admin clicks "Approve" on a pending request, a two-column modal opens showing full request context before the admin commits.

**Acceptance Criteria:**
- Modal header shows "Review Certificate Request" and the formatted request ID (e.g. `#REQ-2023-00882` derived from zero-padded `id`).
- Left column labelled "REQUEST DETAILS" displays: Applicant name, address, purpose, document type label, and submission date.
- Right column labelled "SUBMITTED DOCUMENT" displays: attached document images (or a placeholder when none), a "View Receipt" link that opens the attachment URL in a new tab, payment info text ("Paid - PHP 50.00"), and the applicant's note/message (`notes` field).
- "ADMIN REMARKS (OPTIONAL)" textarea below the two columns.
- Footer: "Reject Request" button (red outline, left) and "Approve & Issue" button (blue filled, right).
- Clicking "Approve & Issue" fires `router.post` to the approve route with `{ admin_remarks }` and closes the modal on success.
- Clicking "Reject Request" closes Review modal and opens Reject modal for the same request.
- Modal is dismissed by clicking the backdrop or an X close button.

**Priority:** High

---

### FR-2: Reject Modal

**Description:** Collects a required rejection reason before submitting the reject action.

**Acceptance Criteria:**
- Modal header shows "Reject Request" and the request ID.
- Single "Reason for Rejection" textarea (required, minimum 10 characters).
- Submit button is disabled until the textarea meets the minimum length.
- Clicking "Submit Rejection" fires `router.post` to the reject route with `{ rejection_feedback }` and closes the modal on finish.
- Clicking "Cancel" closes the modal without submitting.
- Can be opened directly from the table row's "Reject" button or from the Review modal's "Reject Request" button.

**Priority:** High

---

### FR-3: View Reason Modal (rejected requests)

**Description:** Read-only modal showing why a request was rejected.

**Acceptance Criteria:**
- Modal header shows the request ID and a red "Rejected" badge.
- "REJECTION FEEDBACK" section: red-border box containing the `rejection_feedback` text.
- "APPLICANT INFO" section: applicant name and address.
- "CERTIFICATE DETAILS" section: Document Type, Purpose, a formatted Rejection ID, Date, Status.
- "SUBMITTED ATTACHMENTS" section: thumbnail grid of all attachments (filename and file-type icon if not an image); each thumbnail links to the attachment URL in a new tab.
- Close button (X) and backdrop click dismiss the modal.

**Priority:** High

---

### FR-4: View Copy Modal (resolved requests)

**Description:** Read-only modal showing the issued certificate details with print/download actions.

**Acceptance Criteria:**
- Modal header shows "Certificate of [Document Type Label]", a case/reference number, and a green "Resolved" badge.
- "DOCUMENT PREVIEW" panel: barangay letterhead block (static template) populated with resident name, document type, purpose, and issue date.
- Right panel: Resident Name, Issue Date, Expiry Date (issue date + 1 year), Processed By (resolved_by admin name), Purpose.
- "DOCUMENT ACTIONS" section: "Print Certificate" button triggers `window.print()` scoped to the preview panel; "Download PDF" button (placeholder — shows a toast or alert "PDF download coming soon" until implemented).
- Close button (X) and backdrop click dismiss the modal.

**Priority:** Medium

---

### FR-5: Button wiring on index page

**Description:** All table-row action buttons are connected to the correct modal.

**Acceptance Criteria:**
- Pending rows: "Approve" button opens Review modal; "Reject" button opens Reject modal directly.
- Resolved rows: "View Copy" button opens View Copy modal.
- Rejected rows: "View Reason" button opens View Reason modal.
- Only one modal is open at a time.

**Priority:** High

---

## Non-Functional Requirements

### NFR-1: Performance

- Modals must render within 100 ms of the button click (no additional network requests needed — all data is already on the page via Inertia props).

### NFR-2: Accessibility

- All modals must trap focus while open.
- Modals must be dismissible via the Escape key.
- Action buttons must have discernible text labels (no icon-only buttons without aria-label).

### NFR-3: Test Coverage

- Pest feature tests must cover the approve and reject HTTP actions (valid input, validation errors, auth guard).
- All existing tests must remain green.

---

## User Stories

### US-1: Admin reviews and approves a pending request

**As** a barangay admin,  
**I want** to see full request details before approving,  
**So that** I can make an informed decision without navigating away.

**Given** a pending document request exists,  
**When** I click "Approve" on its row,  
**Then** the Review modal opens showing applicant details, the submitted document, and an optional remarks field;  
**And when** I click "Approve & Issue",  
**Then** the request status changes to "resolved" and the modal closes.

---

### US-2: Admin rejects a request with a reason

**As** a barangay admin,  
**I want** to provide a clear rejection reason,  
**So that** the resident understands why their request was denied.

**Given** a pending document request exists,  
**When** I click "Reject" (or "Reject Request" inside the Review modal),  
**Then** the Reject modal opens with a required reason field;  
**And when** I submit a reason of at least 10 characters,  
**Then** the request status changes to "rejected" with the reason saved.

---

### US-3: Admin views why a request was rejected

**As** a barangay admin,  
**I want** to view the rejection feedback for a past rejection,  
**So that** I can answer resident enquiries.

**Given** a rejected document request exists,  
**When** I click "View Reason",  
**Then** a read-only modal opens showing the rejection feedback and attached documents.

---

### US-4: Admin views a resolved certificate

**As** a barangay admin,  
**I want** to view the issued certificate and print or download it,  
**So that** I can provide physical copies to residents on request.

**Given** a resolved document request exists,  
**When** I click "View Copy",  
**Then** a modal opens showing a formatted certificate preview with print and download actions.

---

## Technical Considerations

- **All data is available client-side** via Inertia page props (`requests.data`). No additional AJAX calls are needed for modal content.
- **Wayfinder routes** for approve/reject are imported from `@/routes/admin/document-requests`. Do not hardcode URLs.
- **Custom modals only** — no Shadcn Dialog component. Use `fixed inset-0 z-50` overlay pattern consistent with existing `ApproveModal` and `RejectModal` in the current index file.
- **JSX only** — no TypeScript. Files remain `.jsx`.
- The `attachments` field on `DocumentRequest` is a JSON array of file path strings stored relative to `storage/app/public`. Generate URLs using `asset('storage/' + path)` pattern (or the backend should expose full URLs — confirm with `resolvedBy` relation shape in props).
- The controller currently uses `resolved_by` (integer FK) and `resolvedBy` relation. The index already loads `resolvedBy` via eager loading — use `req.resolved_by?.name` or `req.resolvedBy?.name` depending on what Inertia serialises.
- `rejection_feedback` is the field name in the controller; the model field listed in the brief is `rejection_reason` — confirm the actual column name before coding (see controller: it uses `rejection_feedback`).
- Print scoping: add a `print:block` / `print:hidden` Tailwind print variant strategy or a `<style>` tag inside the modal for print isolation.

---

## Out of Scope

- Actual PDF generation or download (FR-4 download is a placeholder).
- Email or push notifications to residents on approval/rejection.
- Editing or re-opening a resolved/rejected request.
- Pagination or filtering changes on the index page.
- Any mobile API endpoints.

---

## Open Questions

1. Does the backend serialise `attachments` as full URLs or relative storage paths? This affects how thumbnail `src` values are constructed.
2. Is the `rejection_reason` column name in the migration the same as the `rejection_feedback` key used in the controller's `update()` call? (The controller uses `rejection_feedback` — verify the actual DB column.)
3. Should the "View Copy" certificate preview use a static letterhead image or a CSS-only barangay header block?
4. Is there a fixed document fee (PHP 50.00) or is it stored per-request in the model?
