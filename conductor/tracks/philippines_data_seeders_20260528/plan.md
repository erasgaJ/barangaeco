# Implementation Plan: Comprehensive Philippine Data Seeders and Factories

## Track ID
`philippines_data_seeders_20260528`

## Overview

Three phases:
1. **Update factories** — add a `PhilippineData` helper and update all factory `definition()` methods to produce Filipino data by default
2. **Write seeders** — create new seeders for every major entity and wire them into `DatabaseSeeder` in dependency order
3. **Run and verify** — migrate fresh, seed, and confirm volumes and data quality

TDD note: this is a chore track (data/infrastructure). Tests are verification-oriented rather than red-green cycles. Each phase ends with a verification task.

---

## Phase 1: Update Factories with Filipino Data

**Goal:** Every factory produces culturally appropriate Philippine data by default. A shared `PhilippineData` class provides name arrays, address vocabulary, mobile number generation, and content pools.

### Tasks

- [x] Task: Check `residents` table migration to confirm whether `barangay_id` is nullable (read the migration file — do not run a migration). Record finding for use in ResidentSeeder. **Finding:** `barangay_id` is NOT NULL with `->constrained()->restrictOnDelete()`. ResidentFactory uses `Barangay::factory()` to satisfy this. ResidentSeeder must create/use a real Barangay record.

- [x] Task: Create `Database\Factories\PhilippineData.php` — **Already exists as `App\Support\PhilippineData` with all required methods** (firstNamesMale, firstNamesFemale, lastNames, randomFullName, mobileNumber, address, streetNames, complaintDescriptions, complaintAgainst, documentPurposes, documentReasons, announcementTitles, announcementMessages, collectionNotes, zoneNames, zoneDescriptions, barangayNames). All factories import from `App\Support\PhilippineData`.
  - `firstNamesMale(): array` — 40+ common Filipino male first names (e.g., Juan, Jose, Ramon, Eduardo, Rodrigo, Danilo, Roberto, Carlos, Manuel, Fernando, Ernesto, Alberto, Ricardo, Antonio, Miguel, Angelo, Mark, John, Ryan, Christian, ...)
  - `firstNamesFemale(): array` — 40+ common Filipino female first names (e.g., Maria, Ana, Rosario, Lourdes, Carmen, Teresita, Luzviminda, Maricel, Jennifer, Grace, Cristina, Marilou, Elaine, Patricia, Rowena, ...)
  - `lastNames(): array` — 50+ common Filipino surnames (e.g., Santos, Reyes, Cruz, Garcia, Torres, Aquino, Dela Cruz, Bautista, Villanueva, Hernandez, Ramos, Flores, Pascual, Domingo, Ocampo, Mendoza, Castillo, Padilla, ...)
  - `randomFullName(): string` — picks random gender, then random first + last name
  - `mobileNumber(): string` — returns `+639` followed by a random 9-digit suffix (avoid leading 0 in suffix)
  - `address(): string` — builds `"Block {N}, Lot {N}, {street} Street, Purok {N}"` using Filipino street names
  - `streetNames(): array` — Rizal, Bonifacio, Mabini, Aguinaldo, Quezon, Gregorio, Magsaysay, Lapu-Lapu, Tandang Sora, Sampaguita
  - `complaintDescriptions(): array` — 25+ Filipino-language complaint description templates (noise, flooding, garbage, road, stray animals, etc.)
  - `complaintAgainst(): array` — 20+ Filipino entity labels for `complaint_against`
  - `documentPurposes(): array` — 15+ Filipino-language purpose strings for document requests
  - `documentReasons(): array` — 15+ Filipino-language reason strings
  - `announcementTitles(): array` — 25+ Filipino barangay announcement title strings
  - `announcementMessages(): array` — 25+ Filipino multi-sentence announcement body strings (matching titles by index)
  - `collectionNotes(): array` — 15+ Filipino-language short notes for status updates
  - `zoneNames(): array` — returns the 5 named zone strings

- [x] Task: Update `UserFactory::definition()` — already uses `PhilippineData::randomFullName()` and email derived from name `[e33b8a1]`

- [x] Task: Update `ResidentFactory::definition()` — already uses `PhilippineData::address()`, `PhilippineData::mobileNumber()`; `full_name` derived from linked User `[e33b8a1]`

- [x] Task: Update `CollectorFactory::definition()` — already uses `PhilippineData::mobileNumber()`; `full_name` derived from linked User `[e33b8a1]`

- [x] Task: Update `ComplaintFactory::definition()` — already uses `PhilippineData::complaintDescriptions()` and `PhilippineData::complaintAgainst()` `[e33b8a1]`

- [x] Task: Update `DocumentRequestFactory::definition()` — already uses `PhilippineData::documentPurposes()` and `PhilippineData::documentReasons()`; all six document types present `[e33b8a1]`

- [x] Task: Update `AnnouncementFactory::definition()` — already uses index-matched `PhilippineData::announcementTitles()` and `PhilippineData::announcementMessages()` `[e33b8a1]`

- [x] Task: Update `WasteCollectionScheduleFactory::definition()` — already uses `['06:00', '07:00', '08:00', '14:00', '15:00']` `[e33b8a1]`

- [x] Task: Update `ZoneFactory::definition()` — already uses `PhilippineData::zoneNames()` with static counter for uniqueness `[e33b8a1]`

- [x] Task: Update `BarangayFactory::definition()` — already uses `PhilippineData::barangayNames()` `[e33b8a1]`

- [x] Task: Update `CollectionStatusUpdateFactory::definition()` — updated to use `PhilippineData::collectionNotes()` instead of `fake()->sentence()` `[e33b8a1]`

- [x] Verification: Run `php artisan test --compact` — 207 tests pass, 731 assertions. [checkpoint: 95db3b5]

---

## Phase 2: Write Seeders

**Goal:** All new seeders created, existing broken seeder replaced, and `DatabaseSeeder` orchestrates everything in correct dependency order.

### Tasks

- [x] Task: Create `AdminSeeder` — seeds 1 admin user via `User::firstOrCreate(['email' => 'admin@barangay.gov.ph'], [...])` with role `admin`, hashed password, `email_verified_at` set [1ddd347]

- [x] Task: Update `ZoneSeeder` — replace plain "Zone N" names with the 5 named zones from `PhilippineData::zoneNames()` plus Filipino descriptions. Use `firstOrCreate` keyed on `name`. Each zone gets a one-sentence Filipino description (e.g., `"Sumasaklaw sa mga tahanan sa hilaga ng barangay."`). [1ddd347]

- [x] Task: Create `CollectorSeeder` — creates 20 collectors with idempotency:
  - Build a static array of 20 Filipino collector full names
  - For each, derive a stable email (`firstname.lastname@collector.ph`, lowercased, spaces replaced with dots)
  - Use `User::firstOrCreate(['email' => $email], ['name' => $name, 'role' => 'collector', 'password' => Hash::make('password'), 'email_verified_at' => now()])`
  - Then `Collector::firstOrCreate(['user_id' => $user->id], ['full_name' => $name, 'contact_number' => PhilippineData::mobileNumber()])` [1ddd347]

- [x] Task: Create `ResidentSeeder` — creates 100 residents with idempotency:
  - Generate 100 names from `PhilippineData` (use a loop with `randomFullName()`)
  - Derive stable email per resident
  - Use `firstOrCreate` on email for the User record
  - Use `firstOrCreate` on `user_id` for the Resident record
  - Distribute `verification_status`: first 70 records `verified` (with `verified_at = now()->subDays(rand(1,90))`), next 20 `pending`, last 10 `rejected`
  - `verified` residents also get `verified_by` set to the admin user's ID [1ddd347]

- [x] Task: Rewrite `ComplaintSeeder` — completely replace the existing hardcoded array seeder:
  - Add count guard: `if (Complaint::count() >= 150) return;`
  - Load zone IDs: `$zoneIds = Zone::pluck('id')->toArray()`
  - Load resident IDs: `$residentIds = Resident::pluck('id')->toArray()`
  - Load admin ID: `$adminId = User::where('role', 'admin')->first()->id`
  - Use `Complaint::factory()->count(150)->create()` with a custom state that injects `zone_id` from `$zoneIds`, `created_by` from `$adminId`, and `resident_id` from `$residentIds` (null for ~20%)
  - Distribute statuses: 60 `open`, 45 `in_progress`, 30 `resolved`, 15 `cancelled`
  - Distribute priorities: 45 `high`, 60 `medium`, 45 `low` [1ddd347]

- [x] Task: Create `WasteCollectionScheduleSeeder`:
  - Add count guard: `if (WasteCollectionSchedule::count() >= 100) return;`
  - Load zone IDs, collector IDs, admin ID
  - Create 100 schedules via a loop (not `factory()->count()`) to control date distribution:
    - Dates: past 60 days through next 30 days, cycling through zones
    - Each schedule: `WasteCollectionSchedule::create([...])`
    - After creating, attach 1–3 random collectors via `$schedule->collectors()->attach(array_rand(...))`
    - If `status = published` and `scheduled_date <= today`: create a `CollectionStatusUpdate` with `status = completed` or `in_progress`
    - If `status = published` and `scheduled_date > today`: create a `CollectionStatusUpdate` with `status = pending`
    - Use Filipino notes from `PhilippineData::collectionNotes()` [1ddd347]

- [x] Task: Create `DocumentRequestSeeder`:
  - Add count guard: `if (DocumentRequest::count() >= 100) return;`
  - Load resident IDs and admin ID
  - Create 100 requests distributed across residents
  - Status distribution: 30 `pending`, 40 `resolved` (with `resolved_at` and `resolved_by`), 20 `rejected` (with `rejection_feedback`), 10 `cancelled`
  - `rejection_feedback` strings in Filipino (e.g., `"Hindi kumpleto ang mga dokumento na isinumite. Pakiusap na magbigay ng valid ID."`)
  - `admin_remarks` for resolved requests (short Filipino note) [1ddd347]

- [x] Task: Create `AnnouncementSeeder`:
  - Add count guard: `if (Announcement::count() >= 20) return;`
  - Load admin ID
  - Create 25 announcements using index-matched titles/messages from `PhilippineData`
  - First 20: `published_at = now()->subDays(rand(1,60))`
  - Last 5: `published_at = null`, `scheduled_at = now()->addDays(rand(1,14))`
  - `target_audience` distribution: 12 `all`, 8 `residents`, 5 `collectors` [1ddd347]

- [x] Task: Update `DatabaseSeeder::run()`:
  - Remove the inline `User::factory()->create([...])` test user creation
  - Call all seeders in order:
    ```
    AdminSeeder, ZoneSeeder, CollectorSeeder, ResidentSeeder,
    WasteCollectionScheduleSeeder, DocumentRequestSeeder, ComplaintSeeder, AnnouncementSeeder
    ```
  Note: `BarangaySeeder` is also called (before `ResidentSeeder`) because `barangay_id` is NOT NULL in residents migration. [1ddd347]

- [x] Verification: Run `php artisan test --compact` — 207 tests pass, 731 assertions. [checkpoint: 371fead]

---

## Phase 3: Run, Verify, and Quality Gates

**Goal:** Execute the full seed on a fresh database, verify volume and data quality, and pass all code quality checks.

### Tasks

- [x] Task: Run `vendor/bin/pint --dirty --format agent` to format all modified PHP files

- [x] Task: Run `php artisan migrate:fresh --seed` — watch for errors. If any FK constraint or column errors surface (e.g., `barangay_id` NOT NULL issue), fix the relevant seeder or migration before proceeding.

- [x] Task: Verify volumes via `php artisan tinker`:
  - `Zone::count()` → 5
  - `User::where('role','admin')->count()` → 1
  - `Collector::count()` → 20
  - `Resident::count()` → 100
  - `Complaint::count()` → >= 150
  - `WasteCollectionSchedule::count()` → >= 100
  - `CollectionStatusUpdate::count()` → >= 80 (most published schedules have one)
  - `DocumentRequest::count()` → >= 100
  - `Announcement::count()` → >= 20

- [x] Task: Spot-check data quality:
  - Confirm a random resident's `contact_number` matches `+639XXXXXXXXX`
  - Confirm a random collector's `full_name` looks Filipino
  - Confirm a random complaint's `description` is in Filipino
  - Confirm a random announcement's `title` is Filipino-language
  - Confirm zones have Filipino descriptions

- [x] Task: Run `php artisan db:seed` a second time (without `migrate:fresh`) — confirm no unique constraint errors and no duplicate records beyond the count guard thresholds

- [x] Task: Run `php artisan test --compact` — confirm all tests still pass

- [x] Task: Run `composer run ci:check` (or individual checks: pint, eslint, prettier, types) — all must pass

- [x] Verification: Manual walkthrough — open `https://barangaeco.test`, log in as `admin@barangay.gov.ph` / `password`, navigate to Residents, Collectors, Complaints, Schedules, Document Requests, Announcements — confirm lists show Filipino names and content. [36c9feb]

---

## Dependency Order Summary

```
AdminSeeder          (no deps)
ZoneSeeder           (no deps)
CollectorSeeder      (needs: nothing from DB, idempotent)
ResidentSeeder       (needs: admin user for verified_by)
WasteCollectionScheduleSeeder  (needs: zones, collectors, admin)
DocumentRequestSeeder          (needs: residents, admin)
ComplaintSeeder                (needs: zones, residents, admin)
AnnouncementSeeder             (needs: admin)
```

## Commit Strategy

- Phase 1 complete: `phase(1): update factories with Philippine data`
- Phase 2 complete: `phase(2): Philippine data seeders for all modules`
- Phase 3 complete: `phase(3): seed verified — Filipino data quality confirmed`
