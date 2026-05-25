# Spec: Announcements Management Modals

## Track ID
`announcements_modals_20260525`

---

## Overview

The Announcements page (`resources/js/pages/admin/announcements/index.jsx`) has a working `CreateModal` but it has several UX defects (invisible text in Tailwind v4, no server-side error display, no Escape/backdrop close). It also lacks an Edit modal, and the Delete flow uses the native browser `confirm()` dialog.

This track delivers:

1. **CreateModal polish** — fix input visibility, show server-side validation errors, add Escape/backdrop close.
2. **EditModal** — pre-filled modal opened from a Pencil icon on each card; backed by a new `update` controller method and route.
3. **DeleteModal** — styled confirmation modal with announcement title, replacing the native `confirm()`.
4. **Pest feature tests** — store, update, destroy endpoints; all quality gates green.

---

## Background

- `AnnouncementController` has `index`, `store`, and `destroy` — no `update` method yet.
- `CreateModal` uses local `useState` for form data and submits via `router.post`. It does not use `usePage().props.errors` or handle the `onError` Inertia callback, so server-side validation messages are silently swallowed.
- Tailwind CSS v4 no longer sets a default text color on inputs/textareas/selects, so typed text is invisible without explicit `text-slate-900` and `bg-white` classes.
- Delete uses `window.confirm()` — inconsistent with the rest of the admin UI where styled modals are used throughout.
- No edit capability exists on any announcement.
- Wayfinder auto-generates `announcementRoutes` from named routes. Currently `store` and `destroy` are available. After adding the `update` route, `announcementRoutes.update(id).url` will be generated automatically.

---

## Functional Requirements

### FR-1 — Fix CreateModal Input Visibility and UX
**Description:** The CreateModal form inputs are unusable in Tailwind v4 because typed text is invisible. Server-side validation errors are not displayed. The modal cannot be dismissed via Escape key or backdrop click.

**Acceptance Criteria:**
- All `<input>`, `<textarea>`, and `<select>` elements inside `CreateModal` have `bg-white text-slate-900` classes applied.
- When Inertia returns validation errors (via the `onError` callback), each field displays its error message in red `text-xs` below the field.
- Pressing the Escape key closes the modal.
- Clicking the semi-transparent backdrop overlay closes the modal.
- `router.post` call includes `preserveScroll: true`.
- On success, local `errors` state is cleared and the modal closes.

**Priority:** High

---

### FR-2 — Edit Announcement Modal
**Description:** Each announcement card gains a Pencil (Edit) icon button that opens a pre-filled `EditModal`. The modal submits a `PUT` request to update the announcement.

**Acceptance Criteria:**
- A Pencil icon button appears on each announcement card, to the left of the existing Trash2 delete button.
- Clicking the Pencil button sets `editTarget` state to the announcement object and renders `EditModal`.
- `EditModal` is pre-filled with `title`, `message`, `target_audience`, and `scheduled_at` from the announcement object.
- `scheduled_at` is formatted to `datetime-local` input format (`YYYY-MM-DDTHH:mm`) when pre-filling.
- The modal title is "Edit Announcement".
- Fields and layout mirror `CreateModal` exactly (same four fields, same labels).
- All `<input>`, `<textarea>`, `<select>` have `bg-white text-slate-900` classes.
- Submitting calls `router.put(announcementRoutes.update(id).url, payload, { preserveScroll: true, onError, onFinish })`.
- Server-side validation errors display inline under each field.
- Pressing Escape or clicking the backdrop closes the modal without submitting.
- On success the modal closes and the list reloads (Inertia redirect).
- The submit button label is "Save Changes"; while loading it shows "Saving…".
- Backend: a new `update` method is added to `AnnouncementController` with the same validation rules as `store` (except `scheduled_at` validated as `nullable|date` — drop `after:now` to allow editing past scheduled times without forcing a re-schedule).
- A `PUT admin/announcements/{announcement}` route is registered and named `admin.announcements.update`.

**Priority:** High

---

### FR-3 — Delete Confirmation Modal
**Description:** The Trash2 delete button on each card opens a styled `DeleteModal` asking the admin to confirm deletion, replacing the native browser `confirm()`.

**Acceptance Criteria:**
- Clicking the Trash2 button on a card sets `deleteTarget` state to the announcement object and renders `DeleteModal`.
- `DeleteModal` displays: a red Trash2 icon, the heading "Delete Announcement", the announcement `title` in bold inside a descriptive sentence, and two buttons: "Cancel" (border style) and "Delete" (red filled).
- "Cancel" or the backdrop or Escape closes the modal without deleting.
- "Delete" calls `router.delete(announcementRoutes.destroy(id).url, { preserveScroll: true, onFinish: onClose })`.
- While the delete request is in flight, the "Delete" button is disabled and shows "Deleting…".

**Priority:** High

---

## Non-Functional Requirements

### NFR-1 — No Shadcn/ui Dialog
Modals are implemented as custom components using the `fixed inset-0 z-50` overlay pattern, consistent with all other admin modals in the application.

### NFR-2 — Tailwind CSS v4 Only
All styles use Tailwind utility classes. No inline `style` attributes or CSS modules. All form inputs must have explicit `bg-white text-slate-900` (Tailwind v4 has no default form input color).

### NFR-3 — JSX Only
Files remain `.jsx`. No TypeScript type annotations.

### NFR-4 — Test Coverage
Pest feature tests cover: `POST admin/announcements` (store), `PUT admin/announcements/{id}` (update), and `DELETE admin/announcements/{id}` (destroy). Minimum: happy path + validation failure for store and update; auth guard test for destroy.

---

## User Stories

### US-1 — Fix CreateModal So Text Is Visible
**As** a barangay admin,
**I want** to see the text I type in the New Announcement form,
**So that** I can review my input before submitting.

**Given** the "New Announcement" modal is open,
**When** I type in the Title or Message fields,
**Then** the typed text is visible with proper contrast against the white input background.

---

### US-2 — See Server Validation Errors in CreateModal
**As** a barangay admin,
**I want** to see inline error messages when my announcement form has invalid data,
**So that** I know exactly which field to fix without losing my other input.

**Given** the "New Announcement" modal is open,
**When** I submit a form that fails server-side validation (e.g., title exceeds 255 chars),
**Then** a red error message appears below the offending field and the modal stays open.

---

### US-3 — Close Modals Without Submitting
**As** a barangay admin,
**I want** to dismiss any modal by pressing Escape or clicking outside it,
**So that** I can quickly cancel accidental opens.

**Given** any modal (Create, Edit, or Delete) is open,
**When** I press Escape or click the dark backdrop,
**Then** the modal closes and no request is sent.

---

### US-4 — Edit an Existing Announcement
**As** a barangay admin,
**I want** to edit the title, message, audience, or schedule of a published announcement,
**So that** I can correct mistakes or update information without deleting and recreating.

**Given** an announcement card is visible,
**When** I click the Pencil (Edit) icon and modify a field,
**Then** clicking "Save Changes" updates the announcement and the card reflects the new data.

---

### US-5 — Delete with Confirmation
**As** a barangay admin,
**I want** to see a styled confirmation modal before an announcement is deleted,
**So that** I cannot accidentally delete an announcement by a misclick.

**Given** an announcement card is visible,
**When** I click the Trash2 icon,
**Then** a modal appears showing the announcement title and "Delete" / "Cancel" buttons; clicking "Delete" removes it and clicking "Cancel" does nothing.

---

## Technical Considerations

- **Wayfinder update route:** After registering `PUT admin/announcements/{announcement}` with name `admin.announcements.update`, run `npm run build` (or Vite dev server restart) to regenerate Wayfinder types so `announcementRoutes.update(id).url` is available.
- **`scheduled_at` pre-fill:** The value stored in the DB is a full ISO datetime. To pre-fill a `datetime-local` input, slice or format to `YYYY-MM-DDTHH:mm` using `date-fns` `format(new Date(ann.scheduled_at), "yyyy-MM-dd'T'HH:mm")` — only when `scheduled_at` is not null.
- **`update` validation:** Drop the `after:now` rule on `scheduled_at` for the update method; it would prevent saving an announcement that was scheduled in the past.
- **`EditModal` form init:** Initialize `useState` with the announcement's existing values so the form is pre-filled on open. A `useEffect` is not needed since the modal unmounts/remounts with each `editTarget` change.
- **Page state:** `AnnouncementsIndex` will manage four state values: `showCreate`, `editTarget` (null or announcement object), `deleteTarget` (null or announcement object), and no additional state needed.
- **Inertia `onError` callback:** `router.post/put` signature: `router.post(url, data, { onError: (errors) => setErrors(errors), onFinish: () => setLoading(false), preserveScroll: true })`.

---

## Out of Scope

- Bulk delete of announcements.
- Announcement categories or tags.
- Rich-text (WYSIWYG) editor for the message field.
- Push notification delivery — publishing and scheduling logic is unchanged.
- Resident-facing announcement view (mobile API, already implemented in a separate track).
- Pagination changes or server-side search/filter on the announcements list.

---

## Open Questions

1. Should editing a "published" announcement (one with a `published_at` timestamp) re-publish it immediately, or leave `published_at` unchanged? The current `store` sets `published_at: now()` when no `scheduled_at` is given — the `update` method should likely preserve the existing `published_at` rather than overwrite it.
2. Should the Edit modal expose the ability to change a scheduled announcement to "publish immediately" (clearing `scheduled_at`)? The current scope assumes the same optional `scheduled_at` field behavior as CreateModal.
