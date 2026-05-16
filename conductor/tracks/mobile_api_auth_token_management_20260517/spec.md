# Spec: Mobile API Auth + Token Management

## Track ID
`mobile_api_auth_token_management_20260517`

---

## Overview

The BarangaEco mobile app serves two user groups — **residents** and **waste collectors** — who authenticate exclusively through the JSON API (not the Inertia web app). Authentication is handled by Laravel Sanctum token auth. The admin web app uses Fortify; these two systems must remain fully isolated.

The `AuthController` and routes already exist in skeleton form. This track validates, hardens, and fully test-covers those endpoints so the mobile app can be developed against a stable, well-specified contract.

---

## Background

- Web auth: Fortify manages `POST /login`, `POST /register`, session-based guard. Untouched by this track.
- Mobile auth: Sanctum issues opaque tokens per device (`device_name`). Tokens are stored in `personal_access_tokens` and presented as `Authorization: Bearer <token>` on subsequent requests.
- Role enforcement: a `role` middleware already exists (`role:resident,admin`, `role:collector,admin`) applied to downstream resource routes. The auth endpoints themselves are role-agnostic (any valid credential may log in), but registration is role-scoped.
- The `User` model carries a `role` column (`admin` | `resident` | `collector`). Helpers `isResident()`, `isCollector()`, `isAdmin()` exist.
- `Resident` and `Collector` profile records are created as part of registration; they are separate tables linked by `user_id`.
- `Collector` registration is **admin-managed** (collectors are staff, not self-registered). Only resident self-registration is in scope for this track.

---

## Functional Requirements

### FR-1 — Resident Registration
**Description:** A new user may register as a resident by providing credentials and profile details. Registration creates a `User` (role: `resident`) and an associated `Resident` profile record, then returns a Sanctum token.

**Acceptance Criteria:**
- Submitting all required valid fields returns `201` with a `token` string and a `user` object that includes the loaded `resident` relationship.
- The `User.role` is set to `"resident"`.
- The `Resident.verification_status` is set to `"pending"`.
- The `id_image` file is stored in the `public` disk under `id-images/`.
- Submitting a duplicate email returns `422` with an `errors.email` key.
- Submitting missing or invalid fields returns `422` with per-field `errors`.
- Password must be at least 8 characters and must include a `password_confirmation` match.
- `barangay_id` must reference an existing barangay.
- `id_image` must be an image file no larger than 5 MB.
- `device_name` is required (used as the Sanctum token name).

**Priority:** High

---

### FR-2 — Login
**Description:** Any user (resident or collector) may exchange credentials for a Sanctum token.

**Acceptance Criteria:**
- Correct credentials return `200` with a `token` string and a `user` object.
- The `user` object includes the role-appropriate profile relationship: `resident` (with `barangay`) for residents, `collector` for collectors.
- Wrong credentials return `422` with `errors.email` containing a human-readable message.
- `email`, `password`, and `device_name` are all required; missing any one returns `422`.
- A resident and a collector with the same valid credentials can both log in and receive tokens.
- Each call to login issues a **new** token (multiple devices supported); existing tokens are not revoked.

**Priority:** High

---

### FR-3 — Logout
**Description:** An authenticated user revokes the current token used in the request.

**Acceptance Criteria:**
- Calling `POST /api/auth/logout` with a valid Bearer token returns `200` with `{ "message": "Logged out successfully." }`.
- After logout, a subsequent request using the same token returns `401`.
- Calling the endpoint without a token returns `401`.
- Only the current token is deleted; other tokens for the same user remain valid.

**Priority:** High

---

### FR-4 — Authenticated Profile (Me)
**Description:** An authenticated user may retrieve their own profile.

**Acceptance Criteria:**
- `GET /api/auth/me` with a valid Bearer token returns `200` with the `User` object.
- For residents, the response includes nested `resident` with `barangay`.
- For collectors, the response includes nested `collector`.
- Calling without a token returns `401`.
- The response never includes `password`, `two_factor_secret`, `two_factor_recovery_codes`, or `remember_token`.

**Priority:** High

---

### FR-5 — Token Rotation (Refresh)
**Description:** A client may exchange a valid token for a fresh one in a single atomic operation (revoke current, issue new).

**Acceptance Criteria:**
- `POST /api/auth/refresh` with a valid Bearer token returns `200` with a new `token` string.
- The old token is invalid after the call.
- Calling without a token returns `401`.
- The new token carries the same device name as the rotated token.

**Priority:** Medium (implement if straightforward; Sanctum does not have a native refresh — implement as delete + create)

---

## Non-Functional Requirements

### NFR-1 — Performance
- Auth endpoints must respond in under 500 ms on the local dev server under normal load.

### NFR-2 — Security
- Passwords are always stored hashed (Laravel default via `password` cast).
- Tokens are opaque; only the hash is stored in `personal_access_tokens`.
- Sensitive User attributes (`password`, `two_factor_secret`, `two_factor_recovery_codes`, `remember_token`) are in the model's `$hidden` (already configured via `#[Hidden]` attribute).
- File uploads are validated for MIME type and size before storage — never trust the client-supplied extension.
- The mobile API must not be accessible via the web session guard (`auth:web`). All mobile API routes use `auth:sanctum`.
- Rate limiting should be applied to `POST /api/auth/login` and `POST /api/auth/register` to mitigate brute-force attacks (use Laravel's built-in `throttle` middleware).

### NFR-3 — Isolation from Web Auth
- Fortify's routes (`/login`, `/register`) must continue to function for the admin web app and must not be altered by this track.
- No changes to web middleware groups or Fortify configuration.

### NFR-4 — Test Coverage
- 80% minimum line coverage for all files in `app/Http/Controllers/Api/Auth/` and any new form request or resource classes introduced by this track.

---

## User Stories

### US-1 — Resident Self-Registration
**As** a new resident,  
**I want** to register for a BarangaEco account from the mobile app,  
**So that** I can submit document requests and file complaints without visiting the barangay office.

**Given** I provide my name, email, password, full name, address, barangay, contact number, and a photo of my ID,  
**When** I submit a registration request,  
**Then** my account is created with role `resident`, my profile is recorded with `verification_status: pending`, and I receive a Sanctum token I can use immediately.

---

### US-2 — Login (Resident)
**As** a registered resident,  
**I want** to log in with my email and password from my mobile device,  
**So that** I receive a token to access resident features.

**Given** I provide valid credentials and a device name,  
**When** I submit a login request,  
**Then** I receive a token and my full resident profile (including barangay).

---

### US-3 — Login (Collector)
**As** an assigned waste collector,  
**I want** to log in with my email and password from my mobile device,  
**So that** I can view my collection schedules and update statuses in the field.

**Given** I have a collector account created by an admin and I provide valid credentials,  
**When** I submit a login request,  
**Then** I receive a token and my collector profile.

---

### US-4 — Logout
**As** an authenticated mobile user,  
**I want** to log out from my current device,  
**So that** my token is revoked and my account is secure if the device is lost.

**Given** I am authenticated with a valid Bearer token,  
**When** I call the logout endpoint,  
**Then** the token is revoked and subsequent requests with it return `401`.

---

### US-5 — View My Profile
**As** an authenticated mobile user,  
**I want** to retrieve my profile details,  
**So that** the mobile app can display my name, role, and verification status.

**Given** I am authenticated,  
**When** I call `GET /api/auth/me`,  
**Then** I receive my user data including the role-appropriate profile relationship, without any sensitive fields.

---

### US-6 — Token Rotation
**As** an authenticated mobile user,  
**I want** to rotate my token periodically,  
**So that** long-lived sessions can be refreshed without re-entering credentials.

**Given** I am authenticated with a valid Bearer token,  
**When** I call `POST /api/auth/refresh`,  
**Then** I receive a new token and the old token is no longer valid.

---

## API Endpoint Specification

### Public Endpoints (no auth required)

#### POST /api/auth/register
Register a new resident account.

**Content-Type:** `multipart/form-data` (due to file upload)

**Request fields:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, max:255 |
| `email` | string | required, email, unique:users |
| `password` | string | required, min:8, confirmed |
| `password_confirmation` | string | required |
| `full_name` | string | required, max:255 |
| `address` | string | required |
| `barangay_id` | integer | required, exists:barangays,id |
| `contact_number` | string | required |
| `id_image` | file | required, image (jpeg/png/webp), max:5120 KB |
| `device_name` | string | required |

**Success response — 201:**
```json
{
  "token": "1|<plaintext>",
  "user": {
    "id": 1,
    "name": "Juan dela Cruz",
    "email": "juan@example.com",
    "role": "resident",
    "resident": {
      "id": 1,
      "full_name": "Juan dela Cruz",
      "address": "123 Mabini St",
      "contact_number": "09171234567",
      "id_image": "id-images/abc123.jpg",
      "verification_status": "pending",
      "barangay_id": 1
    }
  }
}
```

**Error response — 422:**
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

---

#### POST /api/auth/login
Log in and receive a token.

**Content-Type:** `application/json`

**Request body:**
```json
{
  "email": "juan@example.com",
  "password": "secret123",
  "device_name": "Juan iPhone 15"
}
```

**Success response — 200:**
```json
{
  "token": "2|<plaintext>",
  "user": {
    "id": 1,
    "name": "Juan dela Cruz",
    "email": "juan@example.com",
    "role": "resident",
    "resident": {
      "id": 1,
      "full_name": "Juan dela Cruz",
      "barangay": { "id": 1, "name": "Barangay Uno" }
    }
  }
}
```

For a collector user:
```json
{
  "token": "3|<plaintext>",
  "user": {
    "id": 5,
    "name": "Pedro Santos",
    "email": "pedro@example.com",
    "role": "collector",
    "collector": {
      "id": 2,
      "full_name": "Pedro Santos",
      "contact_number": "09189876543"
    }
  }
}
```

**Error response — 422:**
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["The provided credentials are incorrect."]
  }
}
```

---

### Protected Endpoints (Bearer token required)

All protected endpoints return `401` when no token or an invalid/revoked token is provided:
```json
{ "message": "Unauthenticated." }
```

---

#### POST /api/auth/logout
Revoke the current access token.

**Headers:** `Authorization: Bearer <token>`

**Success response — 200:**
```json
{ "message": "Logged out successfully." }
```

---

#### GET /api/auth/me
Return the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Success response — 200:** Same structure as the `user` object in the login response (role-appropriate relationship eager-loaded; for residents, `barangay` is included).

---

#### POST /api/auth/refresh
Rotate the current token: revoke it and issue a new one with the same device name.

**Headers:** `Authorization: Bearer <token>`

**Success response — 200:**
```json
{ "token": "4|<plaintext>" }
```

---

## Validation Rules Summary

| Field | Rule |
|---|---|
| `email` | required \| email \| unique:users (register only) |
| `password` | required \| string \| min:8 \| confirmed (register) |
| `name` | required \| string \| max:255 |
| `full_name` | required \| string \| max:255 |
| `address` | required \| string |
| `barangay_id` | required \| exists:barangays,id |
| `contact_number` | required \| string |
| `id_image` | required \| file \| image \| max:5120 |
| `device_name` | required \| string |

---

## Error Response Format

All validation errors follow Laravel's standard JSON format (returned automatically when `Accept: application/json` or an API route):

```json
{
  "message": "<human readable summary>",
  "errors": {
    "<field>": ["<message1>", "<message2>"]
  }
}
```

Authentication errors (unauthenticated): `401 { "message": "Unauthenticated." }`

Credential errors: `422` with `errors.email` (not `401`, following Sanctum/Fortify convention to avoid username enumeration via distinct status codes).

---

## Security Considerations

1. **Password hashing:** The `User` model casts `password` to `hashed`; plain text is never stored.
2. **Token opacity:** Sanctum stores only the SHA-256 hash of the token; the plain text is returned once at issuance only.
3. **Hidden attributes:** `password`, `two_factor_secret`, `two_factor_recovery_codes`, and `remember_token` are in the model's `#[Hidden]` attribute and never serialized in JSON responses.
4. **File upload validation:** `id_image` is validated as `image` (checks MIME type, not just extension) and capped at 5 MB.
5. **Rate limiting:** Apply `throttle:6,1` (6 attempts per minute) to `login` and `register` to blunt brute-force attacks.
6. **Guard isolation:** Mobile API routes use `auth:sanctum` only. The web guard (`auth:web` / `auth`) is not referenced in `routes/api.php`.
7. **CSRF exemption:** `routes/api.php` is already outside the `web` middleware group, so CSRF tokens are not required for API calls.
8. **No admin self-registration:** The register endpoint hard-codes `role: resident`. Collector accounts are created by admins only (out of scope for this track).

---

## Out of Scope

- Collector self-registration (admin-managed, separate admin track).
- Admin login via the mobile API (admins use the web app).
- Email verification for mobile users (pending future track).
- Password reset via API (pending future track).
- Two-factor authentication for mobile users (Fortify 2FA is web-only).
- Push notification token registration.
- Social/OAuth login.

---

## Open Questions

1. Should `login` be restricted to `role != admin` to prevent accidental admin token issuance via the mobile API? (Current implementation allows any role.)
2. Should `POST /api/auth/refresh` carry a `device_name` override, or always inherit the name from the token being rotated?
3. Is rate limiting via the global API throttle middleware sufficient, or do `login` and `register` need stricter per-route limits?
4. Should `id_image` be stored in a private disk (not `public`) since it is a sensitive identity document? Currently stored in `public`.
