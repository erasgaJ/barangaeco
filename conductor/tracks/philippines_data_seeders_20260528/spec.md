# Spec: Comprehensive Philippine Data Seeders and Factories

## Track ID
`philippines_data_seeders_20260528`

## Overview

Replace the placeholder seeder setup (single test user + zone numbers only) and generic Faker data in factories with realistic Philippine-context data. Every factory should produce Filipino-appropriate output by default. Every seeder should be idempotent and callable from `DatabaseSeeder` in dependency order, targeting the volume numbers below.

## Background

The system is a barangay management platform for Philippine local government units. All existing factories use generic `fake()->name()`, `fake()->address()`, `fake()->phoneNumber()`, and `fake()->paragraph()` calls that produce Western-sounding names and non-Philippine formats. The `DatabaseSeeder` currently only creates one test user and seeds five unnamed zones. There are no seeders for residents, collectors, schedules, complaints, document requests, or announcements. The `ComplaintSeeder` that exists is never called from `DatabaseSeeder` and uses a now-obsolete `barangay_id` column (removed in the zone refactor).

## Functional Requirements

### FR-1: Filipino Name Data

**Description:** All factories that produce person names (`UserFactory`, `ResidentFactory`, `CollectorFactory`) must draw from curated arrays of common Filipino first names (male and female) and common Filipino surnames. Generic `fake()->name()` must be replaced.

**Acceptance Criteria:**
- `UserFactory::definition()` generates names from Filipino name arrays
- `ResidentFactory::definition()` generates `full_name` from Filipino name arrays
- `CollectorFactory::definition()` generates `full_name` from Filipino name arrays
- Names follow `"Firstname Lastname"` format consistent with current schema
- A `PhilippineData` helper class (or trait) in `Database\Factories` consolidates the shared name arrays so they are defined once

**Priority:** High

---

### FR-2: Philippine Mobile Numbers

**Description:** All `contact_number` fields must produce Philippine-format mobile numbers.

**Acceptance Criteria:**
- Format: `+639XXXXXXXXX` (13 characters, prefix `+639` followed by 9 digits)
- `ResidentFactory` and `CollectorFactory` both use this format
- Numbers are unique enough to avoid collisions at 120+ collector/resident scale (use random digits for the 9-digit suffix)

**Priority:** High

---

### FR-3: Philippine Address Format

**Description:** `ResidentFactory::address` must produce barangay-appropriate Philippine addresses.

**Acceptance Criteria:**
- Format: `"Block N, Lot N, [Street name] Street, [Purok/Sitio name]"` or similar
- Uses Filipino street name vocabulary (Rizal, Bonifacio, Mabini, Aguinaldo, Quezon, etc.)
- Uses Filipino sitio/purok names (Purok 1–6, Sitio Bagong Pag-asa, Sitio Mabuhay, etc.)

**Priority:** High

---

### FR-4: Zone Seeder — Named Zones with Descriptions

**Description:** The existing `ZoneSeeder` must be updated to seed 5 named barangay zones with realistic descriptions rather than plain "Zone 1"–"Zone 5" labels.

**Acceptance Criteria:**
- 5 zones seeded: `Zone 1 – Purok Mabuhay`, `Zone 2 – Sitio Bagong Pag-asa`, `Zone 3 – Purok Silangan`, `Zone 4 – Sitio Maliwanag`, `Zone 5 – Purok Pagasa`
- Each zone has a Filipino-language description (one sentence about what the zone covers)
- Seeder remains idempotent via `firstOrCreate` keyed on `name`
- `is_active` is `true` for all zones

**Priority:** High

---

### FR-5: Admin User Seeder

**Description:** A dedicated `AdminSeeder` seeds the barangay admin account with known, stable credentials.

**Acceptance Criteria:**
- Creates exactly 1 admin user via `firstOrCreate` keyed on `email`
- Email: `admin@barangay.gov.ph`
- Name: `Admin Barangay`
- Password: `password` (hashed)
- `role`: `admin`
- `email_verified_at`: set to a past timestamp

**Priority:** High

---

### FR-6: Collector Seeder — 20 Filipino Collectors

**Description:** A `CollectorSeeder` creates 20 waste collector records, each backed by a User account with role `collector`.

**Acceptance Criteria:**
- 20 `Collector` records created
- Each has a corresponding `User` with `role = collector`, Filipino name, and `email` derived from the name (e.g., `juan.delacruz@collector.ph`)
- `contact_number` in `+639XXXXXXXXX` format
- Seeder is idempotent: checks by user email before creating
- Collectors are assigned to zones: collectors are distributed evenly across the 5 zones via the `schedule_collector` pivot (assignment happens in the schedule seeder, not here)

**Priority:** High

---

### FR-7: Resident Seeder — 100+ Filipino Residents

**Description:** A `ResidentSeeder` creates at least 100 resident records, each backed by a User account.

**Acceptance Criteria:**
- 100 `Resident` records created (target: exactly 100)
- Each has a corresponding `User` with `role = resident` and Filipino name
- `full_name` matches user `name`
- `contact_number` in `+639XXXXXXXXX` format
- `address` uses Philippine address format
- `verification_status` distributed: ~70% `verified`, ~20% `pending`, ~10% `rejected`
- Verified residents have `verified_at` set
- `barangay_id` is `null` (the column may exist in the schema for legacy reasons but zone refactor removed its functional use — do not populate it unless the column requires a value; check schema)
- Seeder is idempotent via user email check

**Priority:** High

---

### FR-8: Complaint Seeder — 150+ Realistic Filipino Complaints

**Description:** A new `ComplaintSeeder` (replacing the broken existing one) seeds 150+ complaints using realistic Filipino barangay complaint descriptions. The existing `ComplaintSeeder.php` must be rewritten to remove the obsolete `barangay_id` column reference and use `zone_id` instead.

**Acceptance Criteria:**
- At least 150 `Complaint` records
- `zone_id` references one of the 5 seeded zones (rotated or random)
- `complaint_type` drawn from: `Road`, `Noise`, `Environment`, `Infrastructure`, `Other`
- `complaint_against` uses Filipino names or entity labels (e.g., `DPWH kontratista`, `Kapitbahay ni G. Santos`, `Water district`, `Barangay tanggapan`)
- `description` drawn from a curated pool of Filipino-language complaint descriptions (at least 20 unique templates, randomly selected and slightly varied)
- `priority` distributed: ~30% `high`, ~40% `medium`, ~30% `low`
- `status` distributed: ~40% `open`, ~30% `in_progress`, ~20% `resolved`, ~10% `cancelled`
- `resident_id` references a seeded resident (or `null` for anonymous complaints, ~20%)
- `created_by` references the admin user
- Seeder is NOT idempotent (truncate-and-reseed strategy acceptable for dev data) OR uses a `skip_if_populated` guard

**Priority:** High

---

### FR-9: Waste Collection Schedule Seeder — 100+ Schedules with Status Updates

**Description:** A `WasteCollectionScheduleSeeder` seeds 100+ collection schedules distributed across zones and collectors.

**Acceptance Criteria:**
- At least 100 `WasteCollectionSchedule` records
- `zone_id` cycles through all 5 zones
- `scheduled_date` spans the past 60 days through the next 30 days (realistic operational window)
- `scheduled_time` drawn from realistic garbage collection times: `06:00`, `07:00`, `08:00`, `14:00`, `15:00`
- `status` distributed: ~20% `draft`, ~80% `published`
- Each schedule is assigned 1–3 collectors via the `schedule_collector` pivot
- Each `published` schedule has 1 `CollectionStatusUpdate` record linked to one of its assigned collectors
- Status update `status` for past dates: `completed` or `in_progress`; for future dates: `pending`
- Status update `notes` in Filipino where present (e.g., `"Natapos ang koleksyon ng basura sa Zone 2."`)
- `created_by` references the admin user

**Priority:** High

---

### FR-10: Document Request Seeder — 100+ Requests

**Description:** A `DocumentRequestSeeder` seeds 100+ document requests distributed across residents.

**Acceptance Criteria:**
- At least 100 `DocumentRequest` records
- `document_type` drawn from: `barangay_clearance`, `certificate_of_residency`, `indigency_certificate`, `business_permit`, `good_moral_certificate`, `death_certificate_endorsement`
- `purpose` uses Filipino-context purposes (e.g., `"Para sa aplikasyon ng trabaho"`, `"Para sa scholarship application"`, `"Para sa pagbubukas ng bank account"`)
- `reason` uses a short supporting explanation in Filipino
- `status` distributed: ~30% `pending`, ~40% `resolved`, ~20% `rejected`, ~10% `cancelled`
- `resolved` records have `resolved_at` and `resolved_by` (admin user)
- `rejected` records have `rejection_feedback` in Filipino
- `resident_id` points to seeded residents (randomly assigned)

**Priority:** High

---

### FR-11: Announcement Seeder — 20+ Announcements

**Description:** An `AnnouncementSeeder` seeds 20+ community announcements with realistic Filipino barangay content.

**Acceptance Criteria:**
- At least 20 `Announcement` records
- `title` uses Filipino-language barangay announcement titles (e.g., `"Abiso: Pagkolekta ng Basura sa Linggo"`, `"Barangay Fiesta 2026"`)
- `message` uses multi-sentence Filipino content appropriate for each announcement type
- `target_audience` distributed: ~50% `all`, ~30% `residents`, ~20% `collectors`
- ~80% have `published_at` set (published); ~20% have `scheduled_at` set for future date (drafts)
- `created_by` references the admin user
- Idempotent via a count guard (skip if count >= 20)

**Priority:** Medium

---

### FR-12: Factory Updates — Filipino Data by Default

**Description:** All factories must produce Filipino-appropriate data in their `definition()` method, not just in seeders.

**Acceptance Criteria:**
- `UserFactory`: uses Filipino name arrays for `name`; email derived from name
- `ResidentFactory`: uses Filipino name, Philippine address, Philippine mobile number
- `CollectorFactory`: uses Filipino name, Philippine mobile number
- `ComplaintFactory`: uses Filipino complaint descriptions and Filipino `complaint_against` values
- `DocumentRequestFactory`: uses Filipino purposes and reasons
- `AnnouncementFactory`: uses Filipino titles and messages
- `WasteCollectionScheduleFactory`: `scheduled_time` uses realistic collection times
- `ZoneFactory`: `name` uses Filipino zone naming (Purok/Sitio style)
- `BarangayFactory`: `name` uses actual Philippine barangay names
- All factories must remain valid for use in tests (arrays must be non-empty, methods must not throw)

**Priority:** High

---

### FR-13: DatabaseSeeder Orchestration

**Description:** `DatabaseSeeder::run()` must call all seeders in correct dependency order.

**Acceptance Criteria:**
- Order: `AdminSeeder` → `ZoneSeeder` → `CollectorSeeder` → `ResidentSeeder` → `WasteCollectionScheduleSeeder` → `DocumentRequestSeeder` → `ComplaintSeeder` → `AnnouncementSeeder`
- Each seeder is called via `$this->call()`
- Running `php artisan db:seed` on a fresh database produces all target volumes without errors
- Running `php artisan db:seed` a second time on an already-seeded database does not throw unique constraint errors (idempotency)

**Priority:** High

---

### FR-14: Obsolete ComplaintSeeder Replacement

**Description:** The existing `ComplaintSeeder` references the removed `barangay_id` column. It must be fully replaced.

**Acceptance Criteria:**
- The old hardcoded complaint array (using `barangay_id`) is removed
- The new seeder uses `zone_id` (FK to `zones` table)
- No reference to `barangay_id` remains in any seeder file

**Priority:** High

---

## Non-Functional Requirements

### NFR-1: Performance

- `db:seed` must complete within 60 seconds on a local MySQL instance
- Use `insert()` batch operations or factory `createMany()` where possible to reduce N+1 inserts
- Avoid loading all records into memory at once when building relationships; use IDs only

### NFR-2: Idempotency

- All seeders that create fixed/named records (admin, zones, collectors, residents) must use `firstOrCreate` or equivalent guard
- Seeders that create bulk anonymous records (complaints, schedules, document requests, announcements) may use a count guard: skip if table already has >= target count

### NFR-3: Test Compatibility

- Factories must remain usable in Pest tests; no global state assumptions (e.g., no `Zone::first()` calls inside `definition()` — use `Zone::factory()` as before)
- The `PhilippineData` helper arrays are accessible from any factory without requiring DB lookups

---

## User Stories

### US-1: Developer seeding fresh environment

As a developer setting up the project for the first time,
I want to run `php artisan migrate:fresh --seed` and get a fully populated database,
So that I can immediately test every UI screen with realistic Filipino barangay data.

**Given** a fresh empty database,
**When** I run `php artisan migrate:fresh --seed`,
**Then** I see 5 named zones, 1 admin user, 20 collectors, 100 residents, 150+ complaints, 100+ schedules, 100+ document requests, and 20+ announcements — all with Filipino names, Philippine phone numbers, and Filipino-language content.

### US-2: Developer testing in isolation

As a developer writing a Pest test,
I want factories to produce Filipino data by default,
So that my test output and fixtures look realistic without extra configuration.

**Given** I call `Resident::factory()->create()` in a test,
**When** I inspect the record,
**Then** `full_name` is a Filipino name, `contact_number` matches `+639XXXXXXXXX`, and `address` uses Philippine address vocabulary.

---

## Technical Considerations

- Faker locale `en_PH` is not well-supported in Faker v1.9+; use manual arrays inside a `PhilippineData` class rather than relying on locale-specific Faker providers
- The `ComplaintFactory` uses `zone_id` (not `barangay_id`) — the zone refactor track already made this change; ensure new seeder matches
- The `schedule_collector` pivot table links `WasteCollectionSchedule` and `Collector` — the schedule seeder must populate this pivot
- `Resident::barangay_id` may still exist as a nullable column from before the refactor; leave it `null` in seeder data
- All password fields use `Hash::make('password')` for consistency with existing `UserFactory`

---

## Out of Scope

- Seeding for a multi-barangay setup (system is single-barangay)
- Production data migration or import from real records
- Faker locale changes (use manual arrays only)
- Any new migrations or schema changes

---

## Open Questions

- Does the `residents` table still have a `barangay_id` column? (Check migration.) If it requires a value, populate with `1` or set column to nullable first. [Assumed nullable based on zone refactor context.]
- Should `CollectorSeeder` assign collectors to specific zones statically, or is zone assignment handled purely through the `schedule_collector` pivot? [Plan: assignment happens only via pivot in schedule seeder.]
