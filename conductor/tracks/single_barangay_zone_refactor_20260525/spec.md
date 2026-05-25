# Spec: Single-Barangay Zone Refactor

**Track ID:** `single_barangay_zone_refactor_20260525`
**Status:** In Progress
**Priority:** High

---

## Overview

BarangaEco serves a single barangay. The current schema has `barangay_id` foreign keys on `complaints` and `waste_collection_schedules` that reference a `barangays` table with one row — a redundant relationship. This refactor replaces that FK with a `zone_id` FK pointing to a new admin-managed `zones` table, enabling staff to organise records by named sub-areas (Purok, Sityo, etc.) without the noise of a barangay selector that always has only one option.

---

## Background

The `barangays` table will be kept as system configuration: one row representing the operating barangay (name, address, etc.). Residents remain linked to that single row via `barangay_id`. Only `complaints` and `waste_collection_schedules` change: their `barangay_id` is dropped and replaced by `zone_id`.

---

## Functional Requirements

### FR-1 — Zones Table
**Description:** A new `zones` database table stores admin-managed zone records for the single barangay.
**Acceptance Criteria:**
- Table has columns: `id`, `name` (string, unique, not null), `description` (text, nullable), `is_active` (boolean, default `true`), `created_at`, `updated_at`.
- A `Zone` Eloquent model exists with `$fillable` for all user-editable columns.
- A seeder populates five default zones: Zone 1, Zone 2, Zone 3, Zone 4, Zone 5 (all active).
- `Zone` has `hasMany` relationships to `Complaint` and `WasteCollectionSchedule`.

**Priority:** Must Have

---

### FR-2 — Complaints Schema Update
**Description:** The `complaints` table drops `barangay_id` and gains `zone_id`.
**Acceptance Criteria:**
- Migration drops the `barangay_id` column (and its FK constraint) from `complaints`.
- Migration adds `zone_id` (nullable, unsigned big integer, FK → `zones.id`, `nullOnDelete`).
- The `Complaint` model removes `barangay_id` from `$fillable` and adds `zone_id`.
- The `Complaint` model has a `belongsTo(Zone::class)` relationship.

**Priority:** Must Have

---

### FR-3 — Waste Collection Schedules Schema Update
**Description:** The `waste_collection_schedules` table drops `barangay_id` and gains `zone_id`.
**Acceptance Criteria:**
- Migration drops the `barangay_id` column (and its FK constraint) from `waste_collection_schedules`.
- Migration adds `zone_id` (nullable, unsigned big integer, FK → `zones.id`, `nullOnDelete`).
- The `WasteCollectionSchedule` model removes `barangay_id` from `$fillable` and adds `zone_id`.
- The `WasteCollectionSchedule` model has a `belongsTo(Zone::class)` relationship.

**Priority:** Must Have

---

### FR-4 — Zones Admin Management Page
**Description:** Admin staff can list, create, edit, and delete zones from the admin dashboard.
**Acceptance Criteria:**
- Admin nav includes a "Zones" link under the appropriate section (e.g., Waste Management or a new Configuration section).
- The Zones index page displays a table with columns: Name, Description, Status (Active/Inactive), Actions.
- A "Create Zone" button opens a modal with fields: Name (required), Description (optional), Is Active (checkbox/toggle, default true).
- Each row has an Edit button opening an edit modal pre-populated with the zone's data.
- Each row has a Delete button opening a confirmation modal; deleting a zone with linked records sets those FKs to null (cascade nullify via `nullOnDelete`).
- Flash success messages appear after create, update, and delete.
- Zone names must be unique; the form shows a validation error if a duplicate name is submitted.

**Priority:** Must Have

---

### FR-5 — Complaints UI: Zone Dropdown
**Description:** The New Complaint modal (admin) replaces the barangay selector with a zone selector.
**Acceptance Criteria:**
- The `NewComplaintModal` no longer renders a barangay dropdown.
- A Zone dropdown is rendered instead, populated from the `zones` prop passed by the controller (active zones only).
- The selected zone's `id` is submitted as `zone_id`.
- The complaints index table displays the zone name (or "—" if null) in place of the barangay column.
- The `ComplaintController` (admin) passes `zones` (active zones) instead of `barangays` to the Inertia response.

**Priority:** Must Have

---

### FR-6 — Waste Schedules UI: Zone Dropdown
**Description:** The waste schedule create and edit modals replace the barangay selector with a zone selector.
**Acceptance Criteria:**
- Create and edit modals no longer render a barangay dropdown.
- A Zone dropdown is rendered, populated from the `zones` prop (active zones only).
- The selected zone's `id` is submitted as `zone_id`.
- The schedule list/calendar displays zone name (or "—") in place of barangay.
- The `WasteCollectionScheduleController` (admin) passes `zones` (active zones) instead of `barangays`.

**Priority:** Must Have

---

## Non-Functional Requirements

### NFR-1 — Data Integrity
- All FK constraints use `nullOnDelete` so deleting a zone does not cascade-delete complaints or schedules; instead those records become zone-less.
- Existing seeded data must remain functional after migrations run.

### NFR-2 — Test Coverage
- New backend logic (Zone CRUD controller, updated Complaint and Schedule controllers) must be covered by Pest feature tests.
- Minimum 80% coverage maintained across the suite.

### NFR-3 — Code Quality
- All PHP files pass Pint formatting.
- All JS/JSX files pass ESLint and Prettier.
- TypeScript check passes (no `.ts` files are added, but existing `.ts` files must still pass).

### NFR-4 — Performance
- Zone dropdown queries eager-load only necessary columns (`id`, `name`) and filter by `is_active = true`.

---

## User Stories

### Story 1 — Admin creates a zone

**As** a barangay staff member,
**I want** to create a new zone with a name and optional description,
**So that** I can organise complaints and waste schedules by local sub-area.

**Given** I am on the Zones admin page,
**When** I click "Create Zone", fill in the name "Sityo Bagong Pag-asa", and submit,
**Then** the new zone appears in the table and a success message is shown.

---

### Story 2 — Admin assigns a zone when filing a complaint

**As** a barangay staff member,
**I want** to select a zone when logging a new complaint,
**So that** the complaint is associated with the correct local area.

**Given** I am creating a new complaint,
**When** I open the New Complaint modal and choose "Zone 3" from the zone dropdown,
**Then** the complaint is saved with `zone_id` pointing to Zone 3.

---

### Story 3 — Admin assigns a zone to a waste schedule

**As** a barangay staff member,
**I want** to select a zone when creating or editing a waste collection schedule,
**So that** collectors know which area they are servicing.

**Given** I am creating a waste collection schedule,
**When** I select "Zone 1" from the zone dropdown and save,
**Then** the schedule is saved with `zone_id` pointing to Zone 1.

---

### Story 4 — Admin renames a zone

**As** a barangay staff member,
**I want** to rename a zone,
**So that** the name reflects current local naming conventions.

**Given** Zone 5 exists,
**When** I click Edit and change the name to "Purok Maunlad" and save,
**Then** the zone's name is updated and all linked records automatically reflect the new name.

---

### Story 5 — Admin deletes a zone

**As** a barangay staff member,
**I want** to delete an unused zone,
**So that** the dropdown stays clean and relevant.

**Given** a zone has no linked complaints or schedules,
**When** I click Delete and confirm,
**Then** the zone is removed from the table.

**Given** a zone has linked complaints,
**When** I delete it and confirm,
**Then** the zone is deleted and the linked complaints have their `zone_id` set to null (they are not deleted).

---

## Technical Considerations

1. **Migration order:** Create `zones` table first, then alter `complaints` and `waste_collection_schedules`. Run as separate migration files for clarity.
2. **Seeder:** `ZoneSeeder` should be idempotent (use `firstOrCreate`). Add it to `DatabaseSeeder`.
3. **Controller pattern:** `Admin\ZoneController` follows the same structure as `Admin\WasteCollectorController` — index (Inertia), store, update, destroy. No separate show page needed.
4. **Props pattern:** Controllers pass `zones` as `Zone::where('is_active', true)->get(['id', 'name'])` for dropdown use.
5. **Modal pattern:** Reuse the existing modal component pattern (Dialog/AlertDialog from Shadcn/ui) as used in Collectors and Announcements pages.
6. **Wayfinder:** Run `npm run build` (or trigger Vite) after adding new routes so Wayfinder regenerates `@/actions/`.
7. **Factory:** `ZoneFactory` must exist for test data creation.

---

## Out of Scope

- Mobile API changes — resident and collector API endpoints are not in scope for this track; zone data exposure via API is a separate track.
- Multi-barangay support — the `barangays` table remains single-row config; no multi-tenancy work.
- Zone-level access control — no per-zone permission system.
- Resident `barangay_id` — remains unchanged; residents still link to the single barangay row.

---

## Open Questions

- None — all design decisions confirmed by user before planning.
