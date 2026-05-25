# Implementation Plan: Announcements Management Modals

## Overview

Four phases to polish the existing CreateModal, add Edit and Delete modals, wire a new backend update route, and pass all quality gates.

**Phase 1** polishes the CreateModal (input visibility, server-side errors, Escape/backdrop close).
**Phase 2** adds the backend `update` route + controller method and the frontend `EditModal`.
**Phase 3** replaces the native `confirm()` delete with a styled `DeleteModal`.
**Phase 4** writes Pest feature tests and runs all quality gates.

---

## Phase 1: Polish CreateModal

Goal: Fix invisible input text, show server-side validation errors, and support Escape/backdrop close on the existing CreateModal.

Tasks:

- [x] Task: Add `bg-white text-slate-900` to all three form elements in `CreateModal` — the title `<input>`, the message `<textarea>`, and the target_audience `<select>`. Also add `bg-white text-slate-900` to the scheduled_at `<input type="datetime-local">`. [492a105]

- [x] Task: Add local `errors` state (`useState({})`) to `CreateModal`. Update `router.post` call: add `preserveScroll: true`, add `onError: (e) => setErrors(e)` callback, and clear errors on `onFinish` when closing. Render inline error messages below each field — `{errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}` — for all four fields. [492a105]

- [x] Task: Add Escape key handler and backdrop click handler to `CreateModal`. Use `useEffect(() => { function handler(e) { if (e.key === 'Escape') onClose(); } document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler); }, [onClose])`. Add `onClick={onClose}` on the backdrop `div` and `onClick={(e) => e.stopPropagation()}` on the inner panel. [492a105]

- [x] Verification: Open the browser at `https://barangaeco.test/admin/announcements`. Open CreateModal, type in every field — text must be visible. Submit a title longer than 255 characters — the modal stays open and shows an inline error under the title field. Press Escape — modal closes. Click the backdrop — modal closes. [checkpoint: 5158025]

---

## Phase 2: Edit Announcement Modal

Goal: Add `update` backend route + controller method. Add `EditModal` frontend component pre-filled from the announcement. Wire a Pencil icon button on each card.

Tasks:

- [x] Task: Register the update route in the announcements route file. Add `Route::put('{announcement}', [AnnouncementController::class, 'update'])->name('admin.announcements.update')` inside the existing `admin.announcements` route group. (TDD: Run `php artisan route:list --name=admin.announcements` and confirm the new route appears) [bf437d2]

- [x] Task: Add `update` method to `AnnouncementController`. Validate: `title` (required, string, max:255), `message` (required, string), `target_audience` (required, in:all,residents,collectors), `scheduled_at` (nullable, date — no `after:now`). Update the announcement fields: preserve existing `published_at`; only set `scheduled_at` from the request. Return `redirect()->route('admin.announcements.index')`. Run `vendor/bin/pint --dirty --format agent` after. (TDD: Pest test `AnnouncementsUpdateTest` — PUT valid payload, assert 302 and DB reflects changes; run Red then Green) [bf437d2]

- [x] Task: After the route is registered, run the Vite dev server or `npm run build` so Wayfinder regenerates `@/routes/admin/announcements` to include `update(id)`. Confirm `announcementRoutes.update` is available by checking the generated file. (TDD: Inspect the generated Wayfinder file; `announcementRoutes.update` must exist) [bf437d2]

- [x] Task: Add `editTarget` state (`useState(null)`) to `AnnouncementsIndex`. Add a Pencil icon button to each announcement card — place it between the card body and the Trash2 button: `<button onClick={() => setEditTarget(ann)} className="rounded p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>`. Import `Pencil` from `lucide-react`. (TDD: Manual — verify the pencil icon appears on each card without layout breakage) [bf437d2]

- [x] Task: Implement `EditModal` component in `index.jsx`. Props: `announcement`, `onClose`. Initialize form state with existing values — pre-fill `scheduled_at` using `announcement.scheduled_at ? format(new Date(announcement.scheduled_at), "yyyy-MM-dd'T'HH:mm") : ''`. Structure mirrors `CreateModal` exactly (same four fields, same labels, same layout) but title is "Edit Announcement" and submit button label is "Save Changes" / "Saving…". All inputs have `bg-white text-slate-900`. (TDD: Manual — click Pencil on a card, verify all fields are pre-filled with the announcement's values) [bf437d2]

- [x] Task: Implement `handleSubmit` in `EditModal`: set `loading(true)`, call `router.put(announcementRoutes.update(announcement.id).url, { ...form, scheduled_at: form.scheduled_at || null }, { preserveScroll: true, onError: (e) => setErrors(e), onFinish: () => setLoading(false) })`. On success Inertia redirects and `onFinish` fires — call `onClose()` inside `onFinish` only when no errors (`onSuccess: onClose`). Add `errors` state and render inline error messages under each field (same pattern as polished CreateModal). (TDD: Pest test `AnnouncementsUpdateTest` — submit update with empty title, assert validation error response) [bf437d2]

- [x] Task: Add Escape key handler and backdrop click handler to `EditModal` using the same `useEffect` pattern as the polished `CreateModal`. (TDD: Manual — press Escape in EditModal, confirm close) [bf437d2]

- [x] Task: Render `{editTarget && <EditModal announcement={editTarget} onClose={() => setEditTarget(null)} />}` in `AnnouncementsIndex` adjacent to the existing `{showCreate && <CreateModal ... />}`. (TDD: Manual — open EditModal, save a change, confirm the card updates on the list) [bf437d2]

- [x] Verification: Click the Pencil icon on an announcement — EditModal opens pre-filled. Change the title and save — the card title updates. Try saving with an empty title — inline error appears. Press Escape — modal closes without saving. [checkpoint: 54fc434]

---

## Phase 3: Delete Confirmation Modal

Goal: Replace the native `confirm()` dialog with a styled `DeleteModal`. Wire the existing Trash2 button to open it.

Tasks:

- [x] Task: Add `deleteTarget` state (`useState(null)`) to `AnnouncementsIndex`. Update the existing Trash2 button `onClick` from `() => destroy(ann.id)` to `() => setDeleteTarget(ann)`. Remove the `destroy` function (or keep it called from inside `DeleteModal`). (TDD: Manual — click Trash2, confirm the native confirm dialog no longer appears) [16c2828]

- [x] Task: Implement `DeleteModal` component in `index.jsx`. Props: `announcement`, `onClose`. Structure: `fixed inset-0 z-50` backdrop, centered white panel (`max-w-sm`), red Trash2 icon (centered, inside a red-tinted circle), heading "Delete Announcement", description paragraph: `Are you sure you want to delete "<announcement.title>"? This action cannot be undone.` with the title in `<strong>`. Footer: "Cancel" button (border style, calls `onClose`) and "Delete" button (red filled: `bg-red-600 text-white hover:bg-red-700`). (TDD: Manual — open DeleteModal, verify layout and title appear correctly) [16c2828]

- [x] Task: Add `loading` state to `DeleteModal`. "Delete" button `onClick` sets `loading(true)` and calls `router.delete(announcementRoutes.destroy(announcement.id).url, { preserveScroll: true, onFinish: onClose })`. While loading, button is disabled and shows "Deleting…". Add Escape key handler and backdrop click to close. (TDD: Pest test `AnnouncementsDestroyTest` — DELETE as admin, assert 302 and record removed from DB; DELETE as unauthenticated, assert 401 or redirect to login) [16c2828]

- [x] Task: Render `{deleteTarget && <DeleteModal announcement={deleteTarget} onClose={() => setDeleteTarget(null)} />}` in `AnnouncementsIndex`. (TDD: Manual — open DeleteModal, click Delete, confirm announcement disappears from the list) [16c2828]

- [x] Verification: Click the Trash2 icon on an announcement — styled DeleteModal opens showing the announcement title. Click "Cancel" — modal closes, announcement remains. Click Trash2 again, click "Delete" — modal closes and announcement is removed from the list. Press Escape in the modal — modal closes without deleting. [checkpoint: 37c5420]

---

## Phase 4: Pest Feature Tests and Quality Gates

Goal: Pest feature tests cover store (happy path + validation failure), update (happy path + validation failure + 404), and destroy (happy path + unauthenticated). All CI quality gates pass.

Tasks:

- [ ] Task: Create `php artisan make:test --pest AnnouncementsStoreTest`. Write `test_admin_can_store_announcement`: act as admin, POST valid payload (`title`, `message`, `target_audience: all`), assert redirect and DB has announcement. Write `test_store_requires_title_and_message`: POST empty payload, assert session has errors for `title` and `message`. Write `test_unauthenticated_cannot_store_announcement`: POST without auth, assert redirect to login. (TDD: Red — run tests, verify they fail for the right reason; Green — tests should pass against existing controller)

- [ ] Task: Create `php artisan make:test --pest AnnouncementsUpdateTest`. Write `test_admin_can_update_announcement`: act as admin, create announcement via factory, PUT valid payload, assert 302 and DB reflects new title. Write `test_update_requires_title`: PUT with empty title, assert session has errors for `title`. Write `test_update_returns_404_for_missing_announcement`: PUT to a non-existent ID, assert 404. (TDD: Red → Green cycle against the new `update` controller method)

- [ ] Task: Create `php artisan make:test --pest AnnouncementsDestroyTest`. Write `test_admin_can_delete_announcement`: act as admin, create announcement factory, DELETE to destroy route, assert 302 and record gone from DB. Write `test_unauthenticated_cannot_delete_announcement`: DELETE without auth, assert redirect to login. (TDD: Red → Green cycle)

- [ ] Task: Run `php artisan test --compact --filter=Announcements` — all announcement tests must pass.

- [ ] Task: Run `vendor/bin/pint --dirty --format agent` to format all PHP files touched in this track (controller, new test files).

- [ ] Task: Run `npm run lint:check` and `npm run format:check`. Fix any issues with `npm run lint` and `npm run format`.

- [ ] Task: Run `npm run types:check` — no type errors (JSX files generate no TS errors; confirm Wayfinder generated types are valid).

- [ ] Verification: Run `composer run ci:check` (full gate: lint + format + types + tests). All checks green. Commit: `phase(4): announcements modals tests and quality gates`. [checkpoint marker]

---

## Commit Strategy

| After Phase | Commit message |
|---|---|
| Phase 1 | `phase(1): polish create announcement modal — input visibility, errors, escape close` |
| Phase 2 | `phase(2): edit announcement modal with backend update route` |
| Phase 3 | `phase(3): delete confirmation modal replaces native confirm` |
| Phase 4 | `phase(4): announcements pest tests and quality gates` |
