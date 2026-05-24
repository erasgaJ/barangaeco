# Implementation Plan: Waste Collectors Management UI

## Overview

Five phases. Phases 1–4 are frontend UI increments inside `schedules.jsx`; Phase 5 covers backend Pest tests and quality gates. The backend routes and controller are already implemented — no new backend code is required beyond confirming the `collectors` prop is passed correctly from `WasteCollectionScheduleController`.

---

## Phase 1: Collector List in Tab [checkpoint: e30b5e9]

**Goal:** Replace the "coming soon" placeholder with a real table of collectors, driven by the `collectors` prop already passed by the schedule controller.

Tasks:
- [x] Task: Write a Pest feature test asserting `GET /admin/waste-management/schedules` returns a `collectors` prop with `full_name`, `contact_number`, and nested `user.email` (TDD: write failing test, confirm prop is present and shape is correct, refactor if needed) [14b236c]
- [x] Task: Confirm `WasteCollectionScheduleController::index()` eager-loads `user` on the `collectors` collection — update the query if `user` is not currently loaded [14b236c]
- [x] Task: Update `SchedulesPage` component signature to accept `collectors` prop (it may already exist) and replace the static placeholder in `activeTab === 'collectors'` with a table component rendering `full_name`, `contact_number`, and `user.email` columns plus an "Add Collector" placeholder button (no modal yet) [14b236c]
- [x] Verification: Open `https://barangaeco.test/admin/waste-management/schedules`, switch to Collector Management tab, confirm table renders with real data [checkpoint: e30b5e9]

---

## Phase 2: Add Collector Modal [checkpoint: 3fa27f7]

**Goal:** Wire the "Add Collector" button to a modal form that POSTs to `collectors.store` and refreshes the list on success.

Tasks:
- [x] Task: Write a Pest feature test for `POST /admin/waste-management/collectors` — covers happy path (collector + user created, redirects) and validation failure (missing required fields returns validation errors) (TDD: red → green) [b3af32f]
- [x] Task: Implement `AddCollectorModal` as a sub-component inside `schedules.jsx` (or a co-located component) — fixed overlay, modal card, three fields (Full Name, Contact Number, Email Address), Cancel and Save Collector buttons, and ESC/backdrop-click dismissal [b3af32f]
- [x] Task: Wire `router.post(collectors.store.url(), { name: form.fullName, full_name: form.fullName, email: form.email, contact_number: form.contactNumber }, { preserveScroll: true, onSuccess: closeModal, onError: setErrors })` on Save Collector click [b3af32f]
- [x] Task: Render field-level validation errors beneath each input when `errors` object is populated [b3af32f]
- [x] Task: Clear form state when modal is closed or reopened [b3af32f]
- [x] Verification: Create a collector via the modal, confirm they appear in the table without a page refresh [checkpoint: 3fa27f7]

---

## Phase 3: Edit Collector Modal

**Goal:** Clicking the Edit icon pre-fills a modal and PUTs updated `full_name` and `contact_number` to `collectors.update`.

Tasks:
- [ ] Task: Write a Pest feature test for `PUT /admin/waste-management/collectors/{collector}` — happy path and validation failure (TDD: red → green)
- [ ] Task: Implement `EditCollectorModal` — same overlay pattern, pre-fill Full Name and Contact Number from the selected collector, Email field shown as read-only (display only, not submitted), Cancel and Save Changes buttons
- [ ] Task: Wire `router.put(collectors.update.url(editingCollector), { full_name: form.fullName, contact_number: form.contactNumber }, { preserveScroll: true, onSuccess: closeModal, onError: setErrors })` on Save Changes click
- [ ] Task: Render field-level validation errors beneath each input; reset errors when modal closes
- [ ] Verification: Edit a collector's name, confirm table updates correctly [checkpoint]

---

## Phase 4: Delete Collector Confirmation Modal

**Goal:** Clicking the Delete icon opens a confirmation modal; confirming sends a DELETE request and removes the collector from the list.

Tasks:
- [ ] Task: Write a Pest feature test for `DELETE /admin/waste-management/collectors/{collector}` — confirms both `Collector` and related `User` records are deleted (TDD: red → green)
- [ ] Task: Implement `DeleteCollectorModal` — fixed overlay, compact card, "Delete Collector?" title, "This action cannot be undone." subtitle, red-left-border warning paragraph, Cancel (outline) and Delete (red filled) buttons
- [ ] Task: Wire `router.delete(collectors.destroy.url(deletingCollector), { preserveScroll: true, onSuccess: closeModal })` on Delete button click
- [ ] Verification: Delete a collector, confirm row is removed from the table and the user account is gone [checkpoint]

---

## Phase 5: Tests and Quality Gates

**Goal:** Ensure all Pest tests pass, coverage targets are met, and frontend code passes lint/format/type checks.

Tasks:
- [ ] Task: Run full test suite `php artisan test --compact` — all tests green
- [ ] Task: Run `vendor/bin/pint --dirty --format agent` if any PHP files were modified in earlier phases
- [ ] Task: Run `npm run lint:check` and `npm run format:check` — fix any reported issues
- [ ] Task: Run `npm run types:check` — resolve any TypeScript errors (the Wayfinder route imports are `.ts` files called from `.jsx`)
- [ ] Task: Review test coverage across `CollectorController` — all four actions (index, store, update, destroy) must be covered by feature tests
- [ ] Verification: Run `composer run ci:check` — full suite passes with zero errors [checkpoint]
- [ ] Task: Commit with message `phase(5): waste collectors management UI complete`
