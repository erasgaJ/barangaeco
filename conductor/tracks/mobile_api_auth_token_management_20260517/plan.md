# Implementation Plan: Mobile API Auth + Token Management

## Track ID
`mobile_api_auth_token_management_20260517`

## Overview

Four phases covering the full TDD lifecycle for the auth endpoints. The controller skeleton already exists (`AuthController`), so the work is: harden validation using Form Requests, introduce Eloquent API Resources for consistent response shapes, wire token rotation, apply rate limiting, and achieve 80%+ test coverage with Pest feature tests.

**Phase summary:**
1. Test infrastructure + factories
2. Register endpoint (Form Request + Resource + tests)
3. Login, Logout, Me endpoints (Form Request + tests)
4. Token rotation + rate limiting + cleanup

Each task follows Red → Green → Refactor. Run `vendor/bin/pint --dirty --format agent` after every PHP file change. Commit once per phase after all phase tests pass.

---

## Phase 1: Test Infrastructure and Factories [641288f]

**Goal:** Establish the test scaffolding (factories for Barangay, Resident, Collector) and a baseline smoke test so subsequent phases can build on reliable test data.

### Tasks

- [x] **Task 1.1 — Read existing migrations and confirm table shapes**
  Verify that `barangays`, `residents`, `collectors`, and `personal_access_tokens` tables match what the tests will assume. No code changes — just confirm before writing tests.

- [x] **Task 1.2 — Create BarangayFactory (TDD: factory definition)**
  Run:
  ```bash
  php artisan make:factory BarangayFactory --model=Barangay
  ```
  Write a minimal factory with `name` (fake city name) and any required non-nullable columns from the migration. Run `php artisan test --compact --filter=BarangayFactory` to confirm it creates records.

- [x] **Task 1.3 — Create ResidentFactory (TDD: factory definition)**
  Run:
  ```bash
  php artisan make:factory ResidentFactory --model=Resident
  ```
  Include states: `pending()`, `verified()`, `rejected()` matching `verification_status` enum values. Associate with `UserFactory` (role: resident) and `BarangayFactory`. Run smoke test.

- [x] **Task 1.4 — Create CollectorFactory (TDD: factory definition)**
  Run:
  ```bash
  php artisan make:factory CollectorFactory --model=Collector
  ```
  Associate with `UserFactory` (role: collector). Run smoke test.

- [x] **Task 1.5 — Add role states to UserFactory**
  Add `resident()` and `collector()` states to the existing `UserFactory` that set the `role` column. Verify existing tests still pass:
  ```bash
  php artisan test --compact
  ```

- [x] **Task 1.6 — Create Api/AuthTest feature test file**
  Run:
  ```bash
  php artisan make:test --pest Api/AuthTest
  ```
  Write one passing smoke test (`it('has auth routes')`) that asserts the four route paths exist in the route list. Run to confirm green.

- [x] **Verification 1.7 — Run full suite, confirm no regressions** [checkpoint]
  ```bash
  php artisan test --compact
  vendor/bin/pint --dirty --format agent
  ```
  All existing tests must remain green. Commit:
  ```
  git add database/factories/ tests/Feature/Api/AuthTest.php
  git commit -m "phase(1): test infrastructure — factories and auth test scaffold"
  ```

---

## Phase 2: Register Endpoint

**Goal:** The `POST /api/auth/register` endpoint is fully validated, creates the correct database records, returns the correct 201 response shape, and is covered by feature tests.

### Tasks

- [ ] **Task 2.1 — Red: write failing tests for register**
  In `tests/Feature/Api/AuthTest.php`, add tests:
  - `it('registers a new resident and returns a token')` — happy path, assert 201, `token` present, `user.role === resident`, `user.resident.verification_status === pending`.
  - `it('fails registration with duplicate email')` — assert 422, `errors.email` present.
  - `it('fails registration with missing required fields')` — assert 422 for each of: name, email, password, full_name, address, barangay_id, contact_number, id_image, device_name.
  - `it('fails registration when barangay_id does not exist')` — assert 422, `errors.barangay_id`.
  - `it('fails registration when password confirmation does not match')` — assert 422, `errors.password`.
  - `it('fails registration when id_image exceeds 5MB')` — use `UploadedFile::fake()->create('id.jpg', 6000, 'image/jpeg')`, assert 422.
  - `it('fails registration when id_image is not an image')` — use a fake PDF file, assert 422.

  Run to confirm all new tests are red (failing).

- [ ] **Task 2.2 — Create RegisterRequest Form Request**
  Run:
  ```bash
  php artisan make:request Api/Auth/RegisterRequest
  ```
  Move validation rules from `AuthController::register()` into `RegisterRequest::rules()`. Set `authorize()` to return `true`. Keep the controller thin:
  ```php
  public function register(RegisterRequest $request): JsonResponse { ... }
  ```
  Run affected tests — should still fail on response shape (no resource yet).

- [ ] **Task 2.3 — Create UserResource and ResidentResource (Eloquent API Resources)**
  Run:
  ```bash
  php artisan make:resource UserResource
  php artisan make:resource ResidentResource
  ```
  `ResidentResource`: expose `id`, `full_name`, `address`, `contact_number`, `id_image`, `verification_status`, `barangay_id`, and conditionally `barangay` when loaded.
  `UserResource`: expose `id`, `name`, `email`, `role`, and merge the role-appropriate profile resource using `whenLoaded`.
  Update `AuthController::register()` to return `new UserResource($user->load('resident'))` inside the 201 response.

- [ ] **Task 2.4 — Green: implement register logic end-to-end**
  Ensure the controller:
  1. Creates `User` with `role: resident`.
  2. Stores `id_image` via `$request->file('id_image')->store('id-images', 'public')`.
  3. Creates `Resident` profile with `verification_status: pending`.
  4. Issues Sanctum token via `$user->createToken($request->device_name)->plainTextToken`.
  5. Returns `response()->json(['token' => $token, 'user' => new UserResource(...)], 201)`.

  Run tests — all register tests should be green.

- [ ] **Task 2.5 — Refactor: extract file storage to a dedicated method or invokable action (optional)**
  If the controller method exceeds ~20 lines, consider extracting `storeIdImage(Request $request): string` as a private method. Re-run tests to confirm still green.

- [ ] **Task 2.6 — Pint formatting**
  ```bash
  vendor/bin/pint --dirty --format agent
  ```

- [ ] **Verification 2.7 — All register tests pass** [checkpoint]
  ```bash
  php artisan test --compact --filter=Api/AuthTest
  ```
  All 8+ register tests green. Commit:
  ```
  git add app/Http/Controllers/Api/Auth/ app/Http/Requests/ app/Http/Resources/ tests/Feature/Api/AuthTest.php
  git commit -m "phase(2): register endpoint — form request, resources, feature tests"
  ```

---

## Phase 3: Login, Logout, and Me Endpoints

**Goal:** The three remaining existing endpoints are covered by tests, use Form Requests and Resources for consistency, and are hardened against edge cases.

### Tasks

- [ ] **Task 3.1 — Red: write failing tests for login**
  Add to `AuthTest`:
  - `it('logs in a resident and returns a token with resident profile')` — assert 200, `token` present, `user.role === resident`, `user.resident` present, `user.resident.barangay` present.
  - `it('logs in a collector and returns a token with collector profile')` — assert 200, `user.role === collector`, `user.collector` present.
  - `it('fails login with incorrect password')` — assert 422, `errors.email`.
  - `it('fails login with non-existent email')` — assert 422, `errors.email`.
  - `it('fails login when device_name is missing')` — assert 422, `errors.device_name`.

  Run — confirm red.

- [ ] **Task 3.2 — Create LoginRequest Form Request**
  Run:
  ```bash
  php artisan make:request Api/Auth/LoginRequest
  ```
  Rules: `email` required|email, `password` required, `device_name` required|string.
  Update `AuthController::login()` to use `LoginRequest`.

- [ ] **Task 3.3 — Create CollectorResource**
  Run:
  ```bash
  php artisan make:resource CollectorResource
  ```
  Expose `id`, `full_name`, `contact_number`.
  Update `UserResource` to include `CollectorResource` via `whenLoaded('collector')`.

- [ ] **Task 3.4 — Green: update login controller method**
  Update `AuthController::login()` to return `response()->json(['token' => $token, 'user' => new UserResource(...)])`.
  For resident login, eager-load `resident.barangay`. For collector login, eager-load `collector`.
  Run login tests — green.

- [ ] **Task 3.5 — Red: write failing tests for logout**
  Add to `AuthTest`:
  - `it('logs out and revokes the current token')` — authenticate, logout, assert 200 message, then assert a follow-up authenticated request returns 401.
  - `it('returns 401 when logging out without a token')` — assert 401.

  Run — confirm red.

- [ ] **Task 3.6 — Green: confirm logout is already implemented**
  The `AuthController::logout()` body is complete. Tests should go green once the route is confirmed to use `auth:sanctum`. Run:
  ```bash
  php artisan test --compact --filter=logs_out
  ```

- [ ] **Task 3.7 — Red: write failing tests for me**
  Add to `AuthTest`:
  - `it('returns authenticated resident profile via me endpoint')` — assert 200, `user.resident.barangay` present, no `password` key in response.
  - `it('returns authenticated collector profile via me endpoint')` — assert 200, `user.collector` present.
  - `it('returns 401 on me endpoint without token')` — assert 401.
  - `it('does not expose sensitive fields in me response')` — assert response JSON does not contain keys `password`, `two_factor_secret`, `remember_token`.

  Run — confirm red.

- [ ] **Task 3.8 — Green: update me controller method**
  Update `AuthController::me()` to return `new UserResource(...)`. Ensure resident path eager-loads `resident.barangay`, collector path eager-loads `collector`. Run tests — green.

- [ ] **Task 3.9 — Pint formatting**
  ```bash
  vendor/bin/pint --dirty --format agent
  ```

- [ ] **Verification 3.10 — All auth tests pass** [checkpoint]
  ```bash
  php artisan test --compact --filter=Api/AuthTest
  ```
  All login, logout, and me tests green. Run full suite to confirm no regressions:
  ```bash
  php artisan test --compact
  ```
  Commit:
  ```
  git add app/Http/Controllers/Api/Auth/ app/Http/Requests/ app/Http/Resources/ tests/Feature/Api/AuthTest.php
  git commit -m "phase(3): login, logout, me endpoints — form requests, resources, feature tests"
  ```

---

## Phase 4: Token Rotation, Rate Limiting, and Quality Gates

**Goal:** Add the `POST /api/auth/refresh` endpoint, apply rate limiting to public auth routes, run the full CI suite, and confirm 80%+ coverage for the auth module.

### Tasks

- [ ] **Task 4.1 — Red: write failing test for token refresh**
  Add to `AuthTest`:
  - `it('rotates the token on refresh')` — authenticate, call `POST /api/auth/refresh`, assert 200, `token` present in response, old token now returns 401 on a follow-up `GET /api/auth/me`.
  - `it('returns 401 on refresh without a token')` — assert 401.

  Run — confirm red.

- [ ] **Task 4.2 — Add refresh route to routes/api.php**
  Inside the `auth:sanctum` group in `routes/api.php`, add:
  ```php
  Route::post('refresh', [AuthController::class, 'refresh']);
  ```

- [ ] **Task 4.3 — Green: implement refresh method in AuthController**
  ```php
  public function refresh(Request $request): JsonResponse
  {
      $currentToken = $request->user()->currentAccessToken();
      $deviceName = $currentToken->name;
      $currentToken->delete();
      $newToken = $request->user()->createToken($deviceName)->plainTextToken;

      return response()->json(['token' => $newToken]);
  }
  ```
  Run refresh tests — green.

- [ ] **Task 4.4 — Red: write failing test for rate limiting on login**
  Add to `AuthTest`:
  - `it('throttles login after too many attempts')` — call `POST /api/auth/login` with wrong credentials 7 times, assert the 7th returns `429`.

  Run — confirm red (rate limiting not yet applied).

- [ ] **Task 4.5 — Apply rate limiting to public auth routes**
  In `routes/api.php`, wrap the public auth routes (`login`, `register`) with `throttle:6,1`:
  ```php
  Route::prefix('auth')->group(function () {
      Route::middleware('throttle:6,1')->group(function () {
          Route::post('login', [AuthController::class, 'login']);
          Route::post('register', [AuthController::class, 'register']);
      });

      Route::middleware('auth:sanctum')->group(function () {
          Route::post('logout', [AuthController::class, 'logout']);
          Route::get('me', [AuthController::class, 'me']);
          Route::post('refresh', [AuthController::class, 'refresh']);
      });
  });
  ```
  Run rate-limiting test — green.

- [ ] **Task 4.6 — Pint formatting**
  ```bash
  vendor/bin/pint --dirty --format agent
  ```

- [ ] **Task 4.7 — Run full CI suite**
  ```bash
  composer run ci:check
  ```
  Fix any lint, format, or type errors. Re-run until all gates pass.

- [ ] **Verification 4.8 — All tests green, coverage check** [checkpoint]
  ```bash
  php artisan test --compact
  ```
  Optionally run with coverage to confirm 80%+ on the auth module:
  ```bash
  php artisan test --compact --coverage --min=80 --filter=Api/AuthTest
  ```
  Final commit:
  ```
  git add routes/api.php app/Http/Controllers/Api/Auth/ tests/Feature/Api/AuthTest.php
  git commit -m "phase(4): token rotation, rate limiting, CI quality gates"
  ```

---

## File Checklist

Files expected to be created or modified by this track:

| File | Action |
|---|---|
| `app/Http/Controllers/Api/Auth/AuthController.php` | Modify — use Form Requests, Resources, add `refresh()` |
| `app/Http/Requests/Api/Auth/RegisterRequest.php` | Create |
| `app/Http/Requests/Api/Auth/LoginRequest.php` | Create |
| `app/Http/Resources/UserResource.php` | Create |
| `app/Http/Resources/ResidentResource.php` | Create |
| `app/Http/Resources/CollectorResource.php` | Create |
| `routes/api.php` | Modify — add refresh route, rate limiting |
| `database/factories/BarangayFactory.php` | Create |
| `database/factories/ResidentFactory.php` | Create |
| `database/factories/CollectorFactory.php` | Create |
| `database/factories/UserFactory.php` | Modify — add role states |
| `tests/Feature/Api/AuthTest.php` | Create |

---

## Definition of Done

- [ ] All tasks in all four phases complete.
- [ ] `php artisan test --compact` passes with no failures.
- [ ] 80%+ coverage on `app/Http/Controllers/Api/Auth/` and new request/resource classes.
- [ ] `vendor/bin/pint --dirty --format agent` reports no changes.
- [ ] `composer run ci:check` passes all gates.
- [ ] Four commits pushed: one per phase.
