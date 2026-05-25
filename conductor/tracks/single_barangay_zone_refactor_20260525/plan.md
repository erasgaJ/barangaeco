# Implementation Plan: Single-Barangay Zone Refactor

**Track ID:** `single_barangay_zone_refactor_20260525`
**Spec:** `conductor/tracks/single_barangay_zone_refactor_20260525/spec.md`

---

## Overview

Five phases covering database schema changes, a new Zones admin UI, wiring zones into Complaints and Waste Schedules, and a final quality-gate pass. Each phase commits once all tasks in it are green.

| Phase | Focus | Commit tag |
|-------|-------|------------|
| 1 | Database — zones table, FK swap, seeder | `phase(1): zones table, migrate complaints + schedules, seed defaults` |
| 2 | Zones admin page — full CRUD (backend + frontend) | `phase(2): zones admin CRUD — list, create, edit, delete` |
| 3 | Complaints — replace barangay_id with zone_id | `phase(3): complaints wired to zones` |
| 4 | Waste Schedules — replace barangay_id with zone_id | `phase(4): waste schedules wired to zones` |
| 5 | Quality gates — Pint, ESLint, Prettier, types, full Pest | `phase(5): quality gates passed` |

---

## Phase 1: Database

**Goal:** Establish the `zones` table as the source of truth for sub-area classification, migrate `complaints` and `waste_collection_schedules` away from `barangay_id`, and seed five default zones.

### Tasks

- [ ] **Task 1.1 — Test: Zone model and factory exist (Red)**
  Write a Pest feature test `ZoneModelTest` that:
  - Asserts a `Zone` can be created via `Zone::factory()->create()` with `name`, `description`, `is_active`.
  - Asserts `Zone::factory()->inactive()->make()` sets `is_active = false`.
  - Asserts `zone->complaints()` and `zone->wasteCollectionSchedules()` relations return collections.
  Run: `php artisan test --compact --filter=ZoneModelTest` — expect failure (no model yet).

- [ ] **Task 1.2 — Migrate: Create zones table (Green)**
  Run `php artisan make:migration create_zones_table --no-interaction`.
  Columns: `id`, `name` (string, unique), `description` (text, nullable), `is_active` (boolean, default true), `timestamps`.
  Run `php artisan migrate --no-interaction`. Re-run test — expect green.

- [ ] **Task 1.3 — Model + Factory: Zone (Green)**
  Run `php artisan make:model Zone --factory --no-interaction`.
  - `$fillable`: `['name', 'description', 'is_active']`.
  - `$casts`: `['is_active' => 'boolean']`.
  - Relationships: `hasMany(Complaint::class)`, `hasMany(WasteCollectionSchedule::class)`.
  - Factory: `name` → `fake()->unique()->words(3, true)`, `description` → nullable sentence, `is_active` → true. Add `inactive` state (`is_active => false`).
  Re-run test — expect green.

- [ ] **Task 1.4 — Test: complaints migration drops barangay_id and adds zone_id (Red)**
  Write a Pest test `ComplaintZoneMigrationTest` that:
  - Asserts `Schema::hasColumn('complaints', 'zone_id')` is true.
  - Asserts `Schema::hasColumn('complaints', 'barangay_id')` is false.
  Run — expect failure.

- [ ] **Task 1.5 — Migrate: Alter complaints table (Green)**
  Run `php artisan make:migration alter_complaints_add_zone_id_drop_barangay_id --no-interaction`.
  In `up()`:
  - Drop FK `complaints_barangay_id_foreign` and column `barangay_id`.
  - Add `zone_id` (unsignedBigInteger, nullable) with FK → `zones.id` `nullOnDelete`.
  In `down()`: reverse.
  Run `php artisan migrate --no-interaction`. Re-run test — expect green.

- [ ] **Task 1.6 — Model update: Complaint**
  In `app/Models/Complaint.php`:
  - Remove `barangay_id` from `$fillable`, add `zone_id`.
  - Remove `belongsTo(Barangay::class)` if present, add `belongsTo(Zone::class)`.

- [ ] **Task 1.7 — Test: waste_collection_schedules migration (Red)**
  Write `WasteScheduleZoneMigrationTest`:
  - Asserts `Schema::hasColumn('waste_collection_schedules', 'zone_id')` is true.
  - Asserts `Schema::hasColumn('waste_collection_schedules', 'barangay_id')` is false.
  Run — expect failure.

- [ ] **Task 1.8 — Migrate: Alter waste_collection_schedules table (Green)**
  Run `php artisan make:migration alter_waste_schedules_add_zone_id_drop_barangay_id --no-interaction`.
  Same pattern as Task 1.5 but for `waste_collection_schedules`.
  Run `php artisan migrate --no-interaction`. Re-run test — expect green.

- [ ] **Task 1.9 — Model update: WasteCollectionSchedule**
  In `app/Models/WasteCollectionSchedule.php`:
  - Remove `barangay_id` from `$fillable`, add `zone_id`.
  - Remove barangay relation, add `belongsTo(Zone::class)`.

- [ ] **Task 1.10 — Seeder: ZoneSeeder (TDD)**
  Write `ZoneSeederTest` asserting that after running `ZoneSeeder`, the `zones` table contains exactly 5 rows with names Zone 1–Zone 5.
  Run — expect failure.
  Create `ZoneSeeder` using `firstOrCreate` for idempotency. Add to `DatabaseSeeder`.
  Run seeder: `php artisan db:seed --class=ZoneSeeder --no-interaction`. Re-run test — expect green.

- [ ] **Task 1.11 — Run Pint on all changed PHP files**
  `vendor/bin/pint --dirty --format agent`

- [ ] **Verification [checkpoint marker]**
  - `php artisan test --compact` — all tests green.
  - `php artisan migrate:status` — all migrations show "Ran".
  - `php artisan db:seed --class=ZoneSeeder --no-interaction` — idempotent (no duplicate error).
  - Commit: `git commit -m "phase(1): zones table, migrate complaints + schedules, seed defaults"` — note SHA: `[commit_sha]`.

---

## Phase 2: Zones Admin Page

**Goal:** Admin staff can list all zones and perform create, edit, and delete operations via a dedicated admin page using the same modal pattern as Collectors management.

### Tasks

- [ ] **Task 2.1 — Test: ZoneController index returns Inertia response (Red)**
  Write `ZoneControllerTest` with:
  - `it('shows zones index page')`: POST /login as admin, GET `/admin/zones`, assert Inertia component `admin/zones/index`, assert response has `zones` prop.
  Run — expect failure (no route or controller).

- [ ] **Task 2.2 — Controller: Admin\ZoneController (Green)**
  Run `php artisan make:controller Admin/ZoneController --no-interaction`.
  Implement:
  - `index()`: `Inertia::render('admin/zones/index', ['zones' => Zone::orderBy('name')->get()])`.
  - `store(Request $request)`: validate `name` (required, unique:zones), `description` (nullable), `is_active` (boolean). Create zone. Redirect back with `success` flash.
  - `update(Request $request, Zone $zone)`: same validation with `unique` ignoring current zone. Update. Redirect with `success` flash.
  - `destroy(Zone $zone)`: delete. Redirect with `success` flash.
  Add routes in `routes/web.php` under the `admin` group:
  ```php
  Route::resource('zones', Admin\ZoneController::class)->only(['index', 'store', 'update', 'destroy']);
  ```
  Re-run test — expect green.

- [ ] **Task 2.3 — Test: ZoneController store validation (Red → Green)**
  Extend `ZoneControllerTest`:
  - `it('validates zone name is required on store')`: POST `/admin/zones` with empty name, assert redirect with errors.
  - `it('validates zone name is unique on store')`: create a zone, POST with the same name, assert error.
  - `it('stores a zone')`: POST with valid data, assert `zones` table has the new row.
  - `it('updates a zone')`: PUT `/admin/zones/{zone}` with new name, assert DB updated.
  - `it('deletes a zone')`: DELETE `/admin/zones/{zone}`, assert row gone.
  Run — implement any missing validation — re-run green.

- [ ] **Task 2.4 — Wayfinder: Regenerate routes**
  Run `npm run build` to trigger Wayfinder regeneration of `@/actions/Admin/ZoneController.*`.
  Verify the generated file exists in `resources/js/actions/Admin/`.

- [ ] **Task 2.5 — Frontend: Zones index page**
  Create `resources/js/pages/admin/zones/index.jsx`.
  Follow the Collectors page pattern:
  - Display a table with columns: Name, Description, Status (Active badge / Inactive badge), Actions.
  - "Create Zone" button in page header.
  - Rows have Edit and Delete icon buttons.
  Accept props: `zones` (array), `flash` (for success messages).

- [ ] **Task 2.6 — Frontend: Create Zone modal**
  Add `CreateZoneModal` component (inline or in `resources/js/pages/admin/zones/`).
  Fields: Name (Input, required), Description (Textarea, optional), Is Active (Checkbox, default checked).
  On submit: `router.post(action(ZoneController.store), data, { onSuccess: closeModal })`.
  Show Inertia form errors inline.

- [ ] **Task 2.7 — Frontend: Edit Zone modal**
  Add `EditZoneModal` component.
  Pre-populate fields from the selected zone.
  On submit: `router.put(action(ZoneController.update, zone.id), data, { onSuccess: closeModal })`.

- [ ] **Task 2.8 — Frontend: Delete Zone modal**
  Add confirmation AlertDialog.
  On confirm: `router.delete(action(ZoneController.destroy, zone.id), { onSuccess: closeModal })`.

- [ ] **Task 2.9 — Admin nav: Add Zones link**
  In the admin sidebar/nav component, add a "Zones" link pointing to the zones index route.
  Place it alongside or under the Waste Management section.

- [ ] **Task 2.10 — Run Pint on changed PHP files**
  `vendor/bin/pint --dirty --format agent`

- [ ] **Task 2.11 — Run ESLint + Prettier on changed JS files**
  `npm run lint` then `npm run format`

- [ ] **Verification [checkpoint marker]**
  - `php artisan test --compact` — all tests green.
  - Navigate to `https://barangaeco.test/admin/zones` — page loads with table.
  - Create a zone: "Sityo Bagong Pag-asa" — appears in table, flash shown.
  - Edit the zone — name updates.
  - Delete the zone — removed from table.
  - Commit: `git commit -m "phase(2): zones admin CRUD — list, create, edit, delete"` — note SHA: `[commit_sha]`.

---

## Phase 3: Wire Zones into Complaints

**Goal:** The complaints workflow uses `zone_id` throughout — new complaint modal shows zone dropdown, index table shows zone name, controller no longer passes barangays.

### Tasks

- [ ] **Task 3.1 — Test: ComplaintController passes zones prop (Red)**
  In `ComplaintControllerTest` (create or extend):
  - `it('index passes zones to Inertia')`: GET `/admin/complaints`, assert Inertia props contain `zones` key (not `barangays`).
  - `it('stores complaint with zone_id')`: POST `/admin/complaints` with `zone_id`, assert DB row has correct `zone_id`.
  Run — expect failure.

- [ ] **Task 3.2 — Controller update: Admin\ComplaintController (Green)**
  In `index()`: replace `barangays` prop with `zones` → `Zone::where('is_active', true)->get(['id', 'name'])`.
  In `store()`: replace `barangay_id` validation rule with `zone_id` (nullable, exists:zones,id).
  In `update()` (if it accepts zone): same swap.
  Remove any remaining barangay references.
  Re-run tests — expect green.

- [ ] **Task 3.3 — Frontend: NewComplaintModal — replace barangay with zone**
  In `resources/js/pages/admin/complaints/index.jsx` (or wherever `NewComplaintModal` lives):
  - Remove the `barangay_id` select field.
  - Add a `zone_id` select field populated from `zones` prop: `<option value={z.id}>{z.name}</option>`.
  - Update `useForm` initial state: replace `barangay_id` with `zone_id`.
  - Update the submitted data field name.

- [ ] **Task 3.4 — Frontend: Complaints index table — show zone name**
  In the complaints table, replace the "Barangay" column header with "Zone".
  Replace `complaint.barangay?.name` (or equivalent) with `complaint.zone?.name ?? '—'`.
  Ensure the controller eager-loads `zone` on the complaints query.

- [ ] **Task 3.5 — Controller: Eager-load zone on complaints index**
  In `ComplaintController@index`, add `.with('zone')` (or `->load('zone')`) to the query so the zone name is available in the Inertia prop.

- [ ] **Task 3.6 — Run Pint on changed PHP files**
  `vendor/bin/pint --dirty --format agent`

- [ ] **Task 3.7 — Run ESLint + Prettier**
  `npm run lint` then `npm run format`

- [ ] **Verification [checkpoint marker]**
  - `php artisan test --compact` — all tests green.
  - Open `https://barangaeco.test/admin/complaints` — "Zone" column visible (no "Barangay" column).
  - Create a complaint via modal — zone dropdown shows active zones; complaint saved correctly.
  - Commit: `git commit -m "phase(3): complaints wired to zones"` — note SHA: `[commit_sha]`.

---

## Phase 4: Wire Zones into Waste Schedules

**Goal:** The waste schedule create and edit modals use zone_id; the schedule list displays zone name.

### Tasks

- [ ] **Task 4.1 — Test: WasteCollectionScheduleController passes zones (Red)**
  In `WasteScheduleControllerTest` (create or extend):
  - `it('index passes zones to Inertia')`: GET `/admin/waste-collection-schedules`, assert props contain `zones`.
  - `it('stores schedule with zone_id')`: POST with `zone_id`, assert DB row has correct `zone_id`.
  Run — expect failure.

- [ ] **Task 4.2 — Controller update: Admin\WasteCollectionScheduleController (Green)**
  Replace `barangays` prop with `zones` → `Zone::where('is_active', true)->get(['id', 'name'])` in `index()` and `create()`/`edit()` if separate.
  In `store()` and `update()`: swap `barangay_id` validation for `zone_id` (nullable, exists:zones,id).
  Add `.with('zone')` to the schedules query in `index()`.
  Re-run tests — expect green.

- [ ] **Task 4.3 — Frontend: Waste schedule create modal — zone dropdown**
  In the create modal JSX:
  - Remove `barangay_id` select, add `zone_id` select from `zones` prop.
  - Update `useForm` initial data.

- [ ] **Task 4.4 — Frontend: Waste schedule edit modal — zone dropdown**
  In the edit modal JSX:
  - Same swap as 4.3.
  - Pre-populate `zone_id` from the existing schedule's `zone_id`.

- [ ] **Task 4.5 — Frontend: Schedule list — show zone name**
  In the schedule list/calendar display, replace barangay column/label with zone name (`schedule.zone?.name ?? '—'`).

- [ ] **Task 4.6 — Run Pint on changed PHP files**
  `vendor/bin/pint --dirty --format agent`

- [ ] **Task 4.7 — Run ESLint + Prettier**
  `npm run lint` then `npm run format`

- [ ] **Verification [checkpoint marker]**
  - `php artisan test --compact` — all tests green.
  - Open `https://barangaeco.test/admin/waste-collection-schedules` — zone column visible.
  - Create a schedule — zone dropdown shows active zones; schedule saves correctly.
  - Edit a schedule — zone pre-selected correctly.
  - Commit: `git commit -m "phase(4): waste schedules wired to zones"` — note SHA: `[commit_sha]`.

---

## Phase 5: Quality Gates

**Goal:** All code quality tools pass clean. Full Pest suite green. Track complete.

### Tasks

- [ ] **Task 5.1 — PHP formatting: Pint full pass**
  `vendor/bin/pint --dirty --format agent`
  Fix any remaining style issues. Re-run until clean.

- [ ] **Task 5.2 — JS/JSX: ESLint check**
  `npm run lint:check`
  Fix any reported issues with `npm run lint`.

- [ ] **Task 5.3 — JS/JSX: Prettier check**
  `npm run format:check`
  Fix with `npm run format`.

- [ ] **Task 5.4 — TypeScript check**
  `npm run types:check`
  Fix any type errors in existing `.ts`/`.tsx` files. (No new TS files added in this track.)

- [ ] **Task 5.5 — Full Pest suite**
  `php artisan test --compact`
  All tests must pass. No skips without documented reason.

- [ ] **Task 5.6 — Build frontend**
  `npm run build`
  No build errors. Wayfinder actions for `ZoneController` present in dist.

- [ ] **Verification [checkpoint marker]**
  - `composer run ci:check` — complete suite passes.
  - Review `conductor/tracks.md` — mark track complete.
  - Commit: `git commit -m "phase(5): quality gates passed"` — note SHA: `[commit_sha]`.

---

## Risk Notes

| Risk | Mitigation |
|------|------------|
| Existing complaint/schedule rows have non-null `barangay_id` | Migration drops the column; existing data is simply cleared (no data migration needed — single barangay context means the value was always redundant). |
| Wayfinder not regenerated before frontend uses new routes | Task 2.4 explicitly triggers `npm run build` before any frontend Zones work. |
| Zone delete while linked records exist | `nullOnDelete` FK constraint handles this at the DB level; no application-layer guard needed. |
| Missing `zone` eager-load causing N+1 on index pages | Tasks 3.5 and 4.2 explicitly add `.with('zone')` to index queries. |
