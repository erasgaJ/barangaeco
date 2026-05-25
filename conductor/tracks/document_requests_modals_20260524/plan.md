# Implementation Plan: Document Request Modals

## Overview

Four phases. Phases 1-3 each deliver one or two modal components. Phase 4 covers Pest feature tests and all quality gates.

All work is in `resources/js/pages/admin/document-requests/index.jsx` unless noted. The backend requires no changes — approve and reject routes are already implemented.

---

## Phase 1: Review Modal + Reject Modal (pending flow)

**Goal:** Replace the existing minimal `ApproveModal` and `RejectModal` with the full Figma two-column designs. Wire the Reject modal to open from both the table row and the Review modal footer.

### Tasks

- [x] Task: Audit current `ApproveModal` and `RejectModal` implementations in `index.jsx` and confirm the exact Inertia prop shape for `requests.data` items (check `resident`, `resolvedBy`, `attachments`, `notes`, `rejection_feedback` fields). Note any field name discrepancies (e.g. `rejection_feedback` vs `rejection_reason`). — Field audit: `rejection_feedback` confirmed (matches controller). No `attachments` or `notes` column in DB — `reason` is the free-text field. `resolvedBy` relation serialises as `req.resolvedBy?.name`.

- [x] Task: (TDD) Write a Pest feature test `DocumentRequestApproveTest` — test that `POST admin/document-requests/{id}/approve` with `admin_remarks` updates status to `resolved` and redirects, and that unauthenticated requests are rejected. Run test — expect red.

- [x] Task: (TDD) Run existing approve controller code — confirm the test goes green without backend changes. Refactor test assertions if field names differ from spec. — All 3 tests passed (GREEN) on first run; controller correct.

- [x] Task: Rewrite `ReviewModal` component (replaces `ApproveModal`) with two-column layout:
  - Left column: REQUEST DETAILS (applicant name, address, purpose, document type label, submission date).
  - Right column: SUBMITTED DOCUMENT (attachment thumbnail or placeholder, "View Receipt" link, payment info line, `notes` field).
  - ADMIN REMARKS textarea below columns.
  - Footer: "Reject Request" (red outline) calls `onReject()` prop; "Approve & Issue" (blue filled) fires `router.post` to approve route.
  - Backdrop click and X button close via `onClose()` prop.
  - Escape key listener to call `onClose()`.

- [x] Task: Rewrite `RejectModal` component:
  - Header: "Reject Request" + formatted request ID.
  - Required rejection reason textarea (minimum 10 characters).
  - Submit button disabled until min length met.
  - Footer: "Cancel" calls `onClose()`; "Submit Rejection" fires `router.post` to reject route with `{ rejection_feedback }`.
  - Escape key listener.

- [x] Task: Update `DocumentRequestsIndex` state management — replace `approveTarget`/`rejectTarget` with three state vars: `reviewTarget` (pending), `rejectTarget` (pending), `viewReasonTarget` (rejected placeholder for Phase 2). Wire pending row "Approve" button to `setReviewTarget`, "Reject" button to `setRejectTarget`. Pass `onReject={() => { setReviewTarget(null); setRejectTarget(req); }}` to `ReviewModal`.

- [x] Verification: Open `https://barangaeco.test/admin/document-requests` in browser. Click "Approve" on a pending row — two-column Review modal appears. Click "Reject Request" inside modal — switches to Reject modal. Click "Reject" directly from table row — Reject modal opens. Submit each action — page reloads with updated status. [checkpoint: 5f4df7c]

**Phase 1 commit:** eea41ae

---

## Phase 2: View Reason Modal (rejected requests)

**Goal:** Implement the read-only modal that shows rejection feedback and attachments for rejected requests.

### Tasks

- [x] Task: (TDD) Write a Pest feature test `DocumentRequestRejectTest` — test that `POST admin/document-requests/{id}/reject` with `rejection_feedback` updates status to `rejected`, that missing `rejection_feedback` returns a validation error, and that unauthenticated access is rejected. Run test — expect red for validation case if not yet covered. — All 3 tests passed GREEN; controller already validated correctly. [57e41b5]

- [x] Task: Confirm test goes green (controller already validates `rejection_feedback` as required). Refactor tests to use factories and proper assertions. — Tests passed on first run; factories and proper assertions already used. [57e41b5]

- [x] Task: Implement `ViewReasonModal` component:
  - Header: formatted request ID + red "Rejected" badge.
  - REJECTION FEEDBACK section: red-border box with `rejection_feedback` text.
  - APPLICANT INFO section: applicant name, address.
  - CERTIFICATE DETAILS section: Document Type, Purpose, Rejection ID (formatted), Date, Status badge.
  - SUBMITTED ATTACHMENTS section: "No attachments submitted." placeholder (no attachments column in DB).
  - Backdrop click and X button close via `onClose()`.
  - Escape key listener.
  [57e41b5]

- [x] Task: Wire `viewReasonTarget` state in `DocumentRequestsIndex`. Rejected rows show a "View Reason" button that sets `viewReasonTarget`. Render `<ViewReasonModal>` when `viewReasonTarget` is set. [57e41b5]

- [x] Verification: Click "View Reason" on a rejected row — modal opens with rejection feedback box, applicant info, certificate details, and attachment thumbnails. Escape key and backdrop close the modal. [checkpoint: e939fe5]

**Phase 2 commit:** 57e41b5

---

## Phase 3: View Copy Modal (resolved requests)

**Goal:** Implement the read-only certificate preview modal for resolved requests with print action.

### Tasks

- [x] Task: Implement `ViewCopyModal` component:
  - Header: "Certificate of [DOC_LABELS[document_type]]" + reference number (formatted ID) + green "Resolved" badge.
  - DOCUMENT PREVIEW panel (left): static barangay letterhead block (CSS-only header with barangay name, address line, document title) populated with resident name, document type, purpose, and issue date. Assign `id="certificate-preview"` for print scoping.
  - Right info panel: Resident Name, Issue Date, Expiry Date (issue date + 1 year using `date-fns`), Processed By, Purpose.
  - DOCUMENT ACTIONS section: "Print Certificate" button calls `window.print()`; "Download PDF" button shows `window.alert('PDF download coming soon')` as placeholder.
  - Add `<style>` tag inside the component using `@media print` to show only `#certificate-preview` and hide all other page elements.
  - Backdrop click and X button close via `onClose()`.
  - Escape key listener.
  [af2168f]

- [x] Task: Add `viewCopyTarget` state in `DocumentRequestsIndex`. Resolved rows show a "View Copy" button that sets `viewCopyTarget`. Render `<ViewCopyModal>` when `viewCopyTarget` is set. [af2168f]

- [ ] Verification: Click "View Copy" on a resolved row — modal opens with certificate preview, right-side metadata, and action buttons. Click "Print Certificate" — browser print dialog opens showing only the certificate panel. Click "Download PDF" — alert appears. [checkpoint]

---

## Phase 4: Tests and Quality Gates

**Goal:** Ensure full test coverage for HTTP actions and all code quality checks pass.

### Tasks

- [ ] Task: Review `DocumentRequestApproveTest` and `DocumentRequestRejectTest` — confirm they cover: authenticated approve (valid remarks), authenticated approve (no remarks), authenticated reject (valid reason), authenticated reject (missing reason → 422), unauthenticated approve (→ redirect to login), unauthenticated reject (→ redirect to login). Add missing cases.

- [ ] Task: Run the full test suite — `php artisan test --compact`. Fix any failures.

- [ ] Task: Run `vendor/bin/pint --dirty --format agent` on any modified PHP files.

- [ ] Task: Run `npm run lint:check` and `npm run format:check` — fix any JSX lint or formatting issues.

- [ ] Task: Run `npm run types:check` — resolve any type errors (note: files are `.jsx` but TypeScript checks JSX files if configured).

- [ ] Task: Commit Phase 4 — `git add` modified files, `git commit -m "phase(4): tests and quality gates for document request modals"`.

- [ ] Verification: Run `composer run ci:check` — all checks pass with zero errors. [checkpoint]
