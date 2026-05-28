# Specification: User Profile Management

**Track ID:** `user_profile_management_20260528`
**Date:** 2026-05-28
**Type:** Feature — Admin Web App

---

## Overview

Allow logged-in admin users to view and edit their own profile information and update their account password. Settings pages at `/settings/profile` and `/settings/security` already exist in the codebase (backed by Fortify-compatible controllers), but they currently use a generic `SettingsLayout` that is disconnected from the admin shell (`AdminLayout`). This track wires the existing backend fully, integrates the settings UI into the admin app experience, adds an account info panel, and writes the missing test coverage.

---

## Background

The Laravel starter template included stub implementations of:

- `ProfileController` (`GET/PATCH /settings/profile`, `DELETE /settings/profile`)
- `SecurityController` (`GET /settings/security`, `PUT /settings/password`)
- Form Request classes with existing validation rules (`ProfileUpdateRequest`, `PasswordUpdateRequest`)
- React pages: `resources/js/pages/settings/profile.jsx` and `resources/js/pages/settings/security.jsx`
- A `SettingsLayout` sidebar (`resources/js/layouts/settings/layout.jsx`) with Profile / Security / Appearance tabs

The backend routes are registered in `routes/settings.php` and protected by the `auth` middleware. The `auth.user` object is already shared globally via `HandleInertiaRequests`. The `User` model exposes a `role` field (`admin`, `resident`, `collector`) and a `created_at` timestamp that can serve as "joined date".

The settings pages currently use their own `SettingsLayout` which renders outside the `AdminLayout` sidebar, creating a disconnected experience. This track must embed the settings pages inside the admin shell.

---

## Functional Requirements

### FR-1 — Profile Edit Page accessible from Admin Shell
**Description:** The settings pages (`/settings/profile`, `/settings/security`) must be reachable from the admin sidebar (or a user menu/link in the sidebar footer), and must render inside `AdminLayout` so the sidebar remains visible.

**Acceptance Criteria:**
- A "Settings" or "Profile" link appears in the admin sidebar (or sidebar footer user area).
- Navigating to `/settings/profile` renders the page within `AdminLayout` (sidebar visible).
- `SettingsLayout` (inner tab navigation: Profile / Security) is nested inside `AdminLayout`.
- Unauthenticated requests to `/settings/profile` redirect to login.

**Priority:** High

---

### FR-2 — Edit Profile Information (Name + Email)
**Description:** Authenticated admin can update their display name and email address via the profile settings form.

**Acceptance Criteria:**
- `PATCH /settings/profile` with valid `name` and `email` updates the user record.
- `name` is required, max 255 characters.
- `email` is required, valid email format, unique among users (excluding own record), max 255 characters.
- On success, a flash toast message "Profile updated." appears and the page re-renders with updated values.
- Changing `email` resets `email_verified_at` to null (existing Fortify behavior, already implemented).
- Keeping the same email preserves `email_verified_at` (already implemented).
- Validation errors display inline under each field.
- Form is prefilled with current user values from `auth.user` shared prop (already wired).

**Priority:** High

---

### FR-3 — Update Password
**Description:** Authenticated admin can change their account password from the security settings page.

**Acceptance Criteria:**
- `PUT /settings/password` with `current_password`, `password`, `password_confirmation` updates the user's password.
- `current_password` must match the user's existing hashed password.
- `password` and `password_confirmation` must match and meet minimum length (8 characters).
- On success, flash toast "Password updated." appears.
- On wrong `current_password`, inline error appears on that field; focus is moved to the field.
- On `password` mismatch/validation failure, `password` and `password_confirmation` fields reset to empty; focus moves to `password` field.
- The endpoint is rate-limited to 6 attempts per minute (already configured in routes).

**Priority:** High

---

### FR-4 — Account Information Panel
**Description:** The profile settings page displays a read-only account info panel showing the user's role and the date they joined.

**Acceptance Criteria:**
- Panel is visible on the profile settings page below (or alongside) the edit form.
- Shows label "Role" with the user's role value (e.g., "admin"), formatted in title case.
- Shows label "Member since" with the `created_at` date formatted as a human-readable date (e.g., "May 17, 2026").
- Panel is read-only — no form submission.
- Data comes from the `auth.user` shared prop; no additional Inertia prop required.

**Priority:** Medium

---

### FR-5 — Settings Navigation Accessible from Admin Sidebar
**Description:** The admin sidebar must offer a way to reach the settings area without manually typing the URL.

**Acceptance Criteria:**
- A "Settings" entry (with an appropriate icon, e.g., `Settings` from `lucide-react`) is present in the admin sidebar nav list.
- Clicking it navigates to `/settings/profile`.
- The sidebar entry highlights (active state) whenever the current URL starts with `/settings`.

**Priority:** High

---

## Non-Functional Requirements

### NFR-1 — No New Dependencies
No npm packages or Composer packages may be added. Use existing Shadcn/ui components, Lucide icons already available, and existing Laravel packages.

### NFR-2 — Test Coverage
Feature tests must cover all HTTP interactions for profile update, password update, and account info rendering. Target 80% line coverage on new/modified PHP code. Existing passing tests must not regress.

### NFR-3 — Code Style
- PHP: typed method signatures, constructor property promotion, Pint-formatted.
- JSX: `.jsx` files only (no TypeScript), ESLint + Prettier clean.
- Wayfinder-generated routes must be used in JSX (`@/routes/` imports); no hardcoded URLs.

### NFR-4 — Performance
Profile update and password update endpoints must respond within 500ms under normal conditions (no heavy computations introduced).

---

## User Stories

### Story 1 — Edit Profile
**As** a barangay admin,
**I want** to update my name and email address,
**So that** my account reflects accurate information.

**Given** I am logged in and navigate to Settings > Profile,
**When** I change my name and/or email and click "Save",
**Then** my profile is updated, a success toast appears, and the form reflects the new values.

---

### Story 2 — Change Password
**As** a barangay admin,
**I want** to change my account password,
**So that** I can keep my account secure.

**Given** I am on Settings > Security,
**When** I enter my current password, a new password, and its confirmation, then click "Save password",
**Then** my password is updated, a success toast appears, and the password fields are cleared.

**Given** I enter an incorrect current password,
**When** I submit the form,
**Then** an inline error appears on the "Current password" field and my password is not changed.

---

### Story 3 — View Account Info
**As** a barangay admin,
**I want** to see my account role and join date,
**So that** I can confirm my account details at a glance.

**Given** I am on Settings > Profile,
**When** the page loads,
**Then** I can see a read-only panel showing my role (e.g., "Admin") and join date (e.g., "May 17, 2026").

---

### Story 4 — Access Settings from Sidebar
**As** a barangay admin,
**I want** a Settings link in the admin sidebar,
**So that** I can reach my profile settings from any page without knowing the URL.

**Given** I am on any admin page,
**When** I click "Settings" in the sidebar,
**Then** I am taken to `/settings/profile` and the Settings link is highlighted as active.

---

## Technical Considerations

1. **Layout composition:** `AdminLayout` wraps the entire admin shell. Settings pages must use `AdminLayout` as their layout. The inner `SettingsLayout` (tab nav between Profile / Security / Appearance) should remain and be rendered as a child inside `AdminLayout`.

2. **Layout prop pattern:** Inertia v3 with React uses the `Component.layout` static property for persistent layouts. The settings pages currently define a `layout` with breadcrumbs but no outer layout assignment. They need to be updated to use `AdminLayout` as the persistent layout while keeping `SettingsLayout` as the inner wrapper.

3. **Shared auth.user data:** The `HandleInertiaRequests` middleware already shares `auth.user` (the full Eloquent User model). The `role` and `created_at` fields will be available client-side. Verify `created_at` is not hidden (it is not in `#[Hidden]`).

4. **Wayfinder routes:** After any route changes, Wayfinder auto-regenerates via Vite. Settings routes are already named (`profile.edit`, `security.edit`). Import from `@/routes/profile` and `@/routes/security`.

5. **Flash toasts:** The existing `Inertia::flash('toast', ...)` pattern is already in use in both controllers. The frontend toast consumer should already handle this; no changes needed to the toast system.

6. **Appearance tab:** The Appearance settings page exists (`/settings/appearance`) and should remain accessible via the inner `SettingsLayout` tab nav. No functional changes to Appearance are in scope.

---

## Out of Scope

- Avatar / profile picture upload
- Email verification re-sending flow changes (exists, not being changed)
- Two-factor authentication setup / disable (exists in Security page, not being changed)
- Account deletion (`DELETE /settings/profile`) — already implemented, no changes needed
- Role management (admins cannot change their own or others' roles from this UI)
- Notification preferences
- Mobile API profile endpoints

---

## Open Questions

1. Should the Settings sidebar entry be placed in the main nav list or in the footer user area of `AdminLayout`? (Recommendation: footer user area, alongside Logout, since it is a user-level action rather than a data management section.)
2. Should the Appearance tab remain in the Settings inner nav? It is not admin-specific but is harmless to keep. (Recommendation: keep it — no extra work needed.)
3. Is email uniqueness validation already scoped to exclude the current user in `ProfileValidationRules`? (Answer: yes, `profileRules($this->user()->id)` already receives the user ID for the unique rule ignore.)
