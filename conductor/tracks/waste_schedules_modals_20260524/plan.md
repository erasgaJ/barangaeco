# Implementation Plan: Waste Collection Schedule Modals

## Overview

Four phases covering the full create/edit/delete modal flow plus backend fix and test coverage.

- Phase 1: Create Schedule modal (FR-1, FR-4)
- Phase 2: Edit Schedule modal (FR-2)
- Phase 3: Delete Schedule confirmation (FR-3)
- Phase 4: Backend controller fix + Pest feature tests (FR-4)

All frontend work targets `resources/js/pages/admin/waste-management/schedules.jsx` and new sibling component files. All backend work targets the existing `ScheduleController`.

---

## Phase 1: Create Schedule Modal [checkpoint: 77177a3]

**Goal:** Wire the "Create Schedule" button to a functional modal that submits via Inertia POST and shows validation errors.

### Tasks

- [x] Task: Pass `collectors` prop from `ScheduleController@index` — add `Collector::all()` to the Inertia render array alongside existing `schedules`, `barangays`, and `today_schedules` props. (TDD: write failing Pest test asserting `collectors` key exists in Inertia response, then implement, then run test.) [d50eee5]

- [x] Task: Build `CollectorMultiSelect` component (`resources/js/components/collector-multi-select.jsx`) — accepts `collectors` (all), `value` (array of selected IDs), `onChange` callback, and optional `error` string prop. Renders a search input that filters by `full_name`, a dropdown list of matching unselected collectors, and selected collectors as removable chips. (TDD: manual verification in browser; unit test not required for pure-UI component but cover integration in Phase 4.) [d50eee5]

- [x] Task: Build `CreateScheduleModal` component (`resources/js/pages/admin/waste-management/create-schedule-modal.jsx`) — fixed overlay modal with fields: Select Barangay (dropdown), Scheduled Date (`<input type="date">`), Start Time (`<input type="time">`), `CollectorMultiSelect`, Status. Submits via `router.post` using the Wayfinder `store` route. On `onSuccess` callback: closes modal and resets form state. Displays Inertia `errors` inline. Cancel button closes modal. [d50eee5]

- [x] Task: Wire "Create Schedule" button in `schedules.jsx` — add `useState` for `showCreateScheduleModal`, attach `onClick` to the button, render `<CreateScheduleModal>` conditionally passing `barangays` and `collectors` props. [d50eee5]

- [x] Verification: Navigate to `/admin/waste-management/schedules`, click "Create Schedule", fill in all fields, submit, confirm schedule appears on calendar. Also submit empty form and confirm validation errors display. [checkpoint: 77177a3]

---

## Phase 2: Edit Schedule Modal

**Goal:** Clicking a calendar schedule chip opens a pre-filled Edit modal that submits via Inertia PUT.

### Tasks

- [ ] Task: Build `EditScheduleModal` component (`resources/js/pages/admin/waste-management/edit-schedule-modal.jsx`) — accepts `schedule` (the selected schedule object with `barangay`, `start_time`, `end_time`, `scheduled_date`, `collectors`), `barangays`, `collectors` (all), `onClose`, and `onDeleteRequest` props. Pre-fills all fields from the `schedule` prop on mount/when `schedule` changes. Submits via `router.put` using the Wayfinder `update` route. On `onSuccess`: calls `onClose`. Displays Inertia `errors` inline. Footer includes "Delete Schedule" red text link (with `Trash2` lucide icon) that calls `onDeleteRequest`. Cancel (outline) and Save Changes (blue filled) buttons. (TDD: write failing Pest feature test for `PUT admin/waste-management/schedules/{id}` with valid payload before implementing, then verify manually.)

- [ ] Task: Wire calendar chips in `schedules.jsx` — add `useState` for `editingSchedule` (null or schedule object). Attach `onClick` to each calendar chip `div` that sets `editingSchedule`. Render `<EditScheduleModal>` conditionally, passing the selected schedule and the `onDeleteRequest` callback (sets `deleteTarget` state, see Phase 3).

- [ ] Verification: Click a schedule chip, verify modal opens pre-filled. Change start time, save, confirm updated time reflects on calendar. Cancel closes without saving. [checkpoint]

---

## Phase 3: Delete Schedule Confirmation

**Goal:** "Delete Schedule" link in Edit modal opens a confirmation modal that submits via Inertia DELETE.

### Tasks

- [ ] Task: Build `DeleteScheduleModal` component (`resources/js/pages/admin/waste-management/delete-schedule-modal.jsx`) — accepts `schedule`, `onClose` (dismiss and return to Edit), and `onDeleted` (close all modals) props. Renders large red `Trash2` icon, title "Delete Schedule?", body text with schedule name interpolated, "Keep Schedule" outline button (calls `onClose`), "Delete" red filled button that calls `router.delete` via Wayfinder `destroy` route. On `onSuccess`: calls `onDeleted` to close both modals. (TDD: write failing Pest feature test for `DELETE admin/waste-management/schedules/{id}` before implementing, then verify manually.)

- [ ] Task: Wire delete flow in `schedules.jsx` — add `useState` for `deleteTarget` (null or schedule). Pass `onDeleteRequest` to `EditScheduleModal` that sets `deleteTarget`. Render `<DeleteScheduleModal>` when `deleteTarget` is set. `onDeleted` callback clears both `editingSchedule` and `deleteTarget`. `onClose` on the delete modal clears only `deleteTarget` (returns to Edit modal).

- [ ] Verification: Open Edit modal, click "Delete Schedule", confirm confirmation modal appears with correct schedule name. Click "Keep Schedule" returns to Edit modal. Click "Delete" removes schedule and closes all modals. [checkpoint]

---

## Phase 4: Backend Tests + Polish

**Goal:** Full Pest feature test coverage for store/update/destroy, plus any cleanup.

### Tasks

- [ ] Task: Write Pest feature test for `store` — `POST admin/waste-management/schedules` with authenticated admin, valid payload (`barangay_id`, `scheduled_date`, `start_time`, `end_time`, `collectors` array of IDs), assert 302 redirect and record exists in DB. Also test validation: missing `barangay_id` returns errors. (TDD: write test, run to confirm it fails, implement any missing validation in controller, run again to confirm green.)

- [ ] Task: Write Pest feature test for `update` — `PUT admin/waste-management/schedules/{id}` with changed `start_time`, assert DB updated. Test that non-existent schedule returns 404.

- [ ] Task: Write Pest feature test for `destroy` — `DELETE admin/waste-management/schedules/{id}`, assert record soft-deleted or hard-deleted per model behavior. Test that unauthenticated request redirects.

- [ ] Task: Run full quality gate — `vendor/bin/pint --dirty --format agent`, `php artisan test --compact`, `npm run lint:check`, `npm run format:check`. Fix any issues surfaced.

- [ ] Verification: All Pest tests pass. No ESLint or Prettier errors. Manually walk through the full create → edit → delete flow in the browser. [checkpoint]

---

## Commit Strategy

Per workflow.md, commit once per completed phase:

```
git add <phase files>
git commit -m "phase(1): create schedule modal + collectors prop"
git commit -m "phase(2): edit schedule modal"
git commit -m "phase(3): delete schedule confirmation modal"
git commit -m "phase(4): pest feature tests + quality gate"
```
