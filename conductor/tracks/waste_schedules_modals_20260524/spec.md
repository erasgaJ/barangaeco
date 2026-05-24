# Spec: Waste Collection Schedule Modals

## Overview

Add Create, Edit, and Delete modals to the Waste Management schedules page (`resources/js/pages/admin/waste-management/schedules.jsx`). The backend CRUD routes already exist. This track wires the frontend modals to those routes and ensures the controller passes the `collectors` prop needed for the multi-select.

## Background

The schedules page has a functional weekly calendar and Today's Routes list. The "Create Schedule" button has no `onClick` handler, and calendar items are styled `cursor-pointer` but do nothing when clicked. No modal components exist yet for this page.

Backend routes already implemented:
- `POST admin/waste-management/schedules` → `admin.waste.schedules.store`
- `PUT admin/waste-management/schedules/{schedule}` → `admin.waste.schedules.update`
- `DELETE admin/waste-management/schedules/{schedule}` → `admin.waste.schedules.destroy`

Wayfinder-generated route functions available at `@/routes/admin/waste/schedules`.

## Functional Requirements

### FR-1: Create Schedule Modal

**Description:** A modal form that allows admins to create a new waste collection schedule.

**Acceptance Criteria:**
- Clicking "Create Schedule" button opens the modal
- Modal title is "Create Collection Schedule"
- Form fields: Select Barangay (dropdown), Start Time (time input), End Time (time input), Assign Collectors (multi-tag input)
- Barangay dropdown is populated from the `barangays` prop
- Collector multi-tag input is populated from the `collectors` prop (passed by controller)
- Typing in the collector search box filters the available collector list
- Selecting a collector adds a chip showing their full name with an × button
- Clicking × on a chip removes that collector from the selection
- "Cancel" button closes the modal without submitting
- "Create Schedule" button submits via `router.post` to the store route
- Server-side validation errors are displayed inline below each field
- On success the modal closes and the page data refreshes (Inertia visit)
- **Priority:** High

### FR-2: Edit Schedule Modal

**Description:** A modal form pre-filled with an existing schedule's data for editing.

**Acceptance Criteria:**
- Clicking a schedule chip in the weekly calendar opens the Edit modal for that schedule
- Modal title is "Edit Collection Schedule"
- A subtitle shows the schedule label (e.g., "Barangay 3 Morning Route")
- All fields are pre-filled: Barangay, Start Time, End Time, currently assigned collectors shown as chips
- Collector search/add/remove works the same as the Create modal
- "Cancel" button closes the modal without saving
- "Save Changes" button submits via `router.put` to the update route
- Server-side validation errors are displayed inline below each field
- On success the modal closes and the page data refreshes
- A "Delete Schedule" link (red, with trash icon) is displayed in the bottom-left of the modal footer and opens the Delete confirmation modal
- **Priority:** High

### FR-3: Delete Schedule Confirmation Modal

**Description:** A confirmation dialog before permanently deleting a schedule.

**Acceptance Criteria:**
- Accessible from the "Delete Schedule" link inside the Edit modal
- Modal displays a large red trash icon, title "Delete Schedule?", and body text: "Are you sure you want to delete the collection schedule for [schedule name]? This action cannot be undone and will notify assigned collectors."
- "Keep Schedule" button (outline) dismisses the confirmation and returns to the Edit modal
- "Delete" button (red filled) submits via `router.delete` to the destroy route
- On success both modals close and the page data refreshes
- **Priority:** High

### FR-4: Controller passes `collectors` prop

**Description:** The `index` action of the schedules controller must pass all available collectors to the Inertia view so the multi-select can be populated.

**Acceptance Criteria:**
- `ScheduleController@index` includes a `collectors` key in the Inertia props
- Each collector item exposes at minimum `id` and `full_name`
- Existing props (`schedules`, `barangays`, `today_schedules`) remain unchanged
- **Priority:** High

## Non-Functional Requirements

### NFR-1: No External Modal Library

Custom modal implementation using a fixed overlay div with Tailwind CSS v4 utilities. Do not use Shadcn/ui Dialog or any other dialog library.

### NFR-2: Collector Multi-Select as Reusable Component

The tag-input/multi-select for collectors should be a self-contained component that can be reused in future modals (e.g., Edit Collector assignments).

### NFR-3: Files use `.jsx` extension

All new frontend files must be `.jsx` (not `.tsx`). No TypeScript annotations.

### NFR-4: Inertia router for mutations

All create/update/delete submissions use `router.post`, `router.put`, `router.delete` from `@inertiajs/react`. Do not use `fetch` or Axios.

## User Stories

### US-1: Create a schedule

**As** a barangay admin,  
**I want** to create a new waste collection schedule from the weekly calendar page,  
**So that** collectors know when and where to collect waste.

**Given** I am on the Waste Management schedules page,  
**When** I click "Create Schedule",  
**Then** a modal appears with empty fields for barangay, start time, end time, and collectors.

**Given** I fill in all required fields and click "Create Schedule",  
**When** the form is submitted,  
**Then** the modal closes and the new schedule appears on the calendar.

**Given** I submit the form with missing required fields,  
**When** the server returns validation errors,  
**Then** error messages appear below the relevant fields.

### US-2: Edit an existing schedule

**As** a barangay admin,  
**I want** to edit an existing schedule directly from the calendar,  
**So that** I can update barangay, time, or collector assignments without navigating away.

**Given** I click a schedule chip in the weekly calendar,  
**When** the Edit modal opens,  
**Then** all fields are pre-filled with the schedule's current data.

**Given** I change the start time and click "Save Changes",  
**When** the form is submitted,  
**Then** the modal closes and the calendar reflects the updated time.

### US-3: Delete a schedule

**As** a barangay admin,  
**I want** to delete a schedule with an explicit confirmation step,  
**So that** I don't accidentally remove an active route.

**Given** I am inside the Edit modal,  
**When** I click "Delete Schedule",  
**Then** a confirmation modal appears with the schedule name and a warning that collectors will be notified.

**Given** I click "Delete" in the confirmation modal,  
**When** the deletion is processed,  
**Then** both modals close and the schedule is removed from the calendar.

## Technical Considerations

- The `CollectorMultiSelect` component should manage its own search state internally but receive `collectors` (all available) and `value` / `onChange` props for controlled usage.
- Time inputs: use `<input type="time">` for capture; format display as "HH:MM AM/PM" matching Figma. Store and submit as `HH:mm` (24-hour) to match Laravel's `H:i` validation rule.
- The Edit and Delete modals share a "current schedule" state; when "Delete Schedule" is clicked in Edit, set a separate `deleteTarget` state and render the Delete modal on top (or swap modal content).
- On Inertia success callbacks, use the `onSuccess` option of `router.post/put/delete` to close modals and clear form state.
- Validation errors come back via Inertia's `errors` prop. Each modal should read from `errors` after submission and reset on modal open.

## Out of Scope

- Month view calendar (Week view is the only view for this track)
- Collector Management tab (already has a placeholder; separate track)
- Mobile app collector schedule notifications (backend event/notification not part of this track)
- Bulk delete or multi-schedule operations

## Open Questions

1. Should the `scheduled_date` field be part of the Create modal, or should clicking a specific calendar day pre-fill the date? (Current assumption: the Create modal includes a date picker field, or defaults to today.)
2. What is the exact `full_name` attribute on the Collector model — is it a computed attribute or a database column?
3. Should the "Create Schedule" modal include a date picker field since schedules have a `scheduled_date` column?
