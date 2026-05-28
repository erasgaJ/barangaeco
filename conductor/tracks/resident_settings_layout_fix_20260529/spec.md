# Spec: Resident Settings Layout Fix

## Overview

Settings pages (`/settings/profile`, `/settings/security`, `/settings/appearance`) render inside `AdminLayout` for all users. Residents who navigate to these pages see the admin sidebar (blue accent, admin nav items) instead of their own `ResidentLayout` (green accent, resident nav items). This fix ensures the correct outer shell layout is shown based on the authenticated user's role.

## Background

In `resources/js/app.jsx` the Inertia `layout` callback receives only the page component `name` (a string). It cannot call React hooks, so `usePage().props.auth.user.role` is not accessible there. The current implementation hard-codes `AdminLayout` as the outer shell for all `settings/` pages:

```js
case name.startsWith('settings/'):
    return [AdminLayout, SettingsLayout];
```

The fix introduces a thin **`RoleAwareLayout`** wrapper component that is a real React component (can use hooks). It reads `auth.user.role` from Inertia shared props and delegates rendering to either `AdminLayout` or `ResidentLayout`. The Inertia layout callback substitutes `RoleAwareLayout` in place of `AdminLayout` for settings pages.

## Functional Requirements

### FR-1 — Role-based outer shell for settings pages
**Description:** When any authenticated user visits a settings page, the outer sidebar/shell layout must match their role.  
**Acceptance criteria:**
- A user with `role === 'admin'` sees `AdminLayout` (blue logo, admin nav items).
- A user with `role === 'resident'` sees `ResidentLayout` (green logo, resident nav items).
- Both layouts continue to nest `SettingsLayout` (the inner settings tab nav) as the second layout in the array.  

**Priority:** Critical

### FR-2 — No change to settings page internals
**Description:** The inner `SettingsLayout` (Profile / Security / Appearance tabs) must remain unchanged and must work correctly under either outer shell.  
**Acceptance criteria:**
- All three settings tab links (Profile, Security, Appearance) render and navigate correctly regardless of which outer shell is shown.
- No props are renamed or restructured in any settings page component.  

**Priority:** Critical

### FR-3 — New user roles handled gracefully
**Description:** If `auth.user.role` is anything other than `'resident'`, the component defaults to `AdminLayout` (fail-safe).  
**Acceptance criteria:**
- Any unrecognised role value falls through to `AdminLayout`.  

**Priority:** High

## Non-Functional Requirements

### NFR-1 — Single file change surface
The fix must be contained to: one new layout file (`role-aware-layout.jsx`) and one line change in `app.jsx`. Settings page components themselves must not be modified.

### NFR-2 — No runtime errors for unauthenticated access
If `auth.user` is `null` (edge case: middleware failure), the component must not throw — it should default to `AdminLayout`.

## User Stories

**As a resident,** I want to see my green sidebar when I visit my settings page, **so that** I feel I am in my own portal and not in an admin screen.

- Given I am logged in as a resident  
- When I navigate to `/settings/profile`  
- Then I see the green `ResidentLayout` sidebar with resident nav items

**As an admin,** I want to continue seeing the blue admin sidebar when I visit settings, **so that** my experience is unchanged.

- Given I am logged in as an admin  
- When I navigate to `/settings/profile`  
- Then I see the blue `AdminLayout` sidebar with admin nav items

## Technical Considerations

- The Inertia `layout` callback in `app.jsx` runs outside the React component tree; hooks are not available there. The wrapper must be a proper React component.
- Inertia persistent layouts are arrays: `[OuterLayout, InnerLayout]`. `RoleAwareLayout` takes the place of `AdminLayout` in that array.
- `auth.user.role` is shared by `HandleInertiaRequests` middleware; no backend changes are needed.
- The component must be placed in `resources/js/layouts/` alongside the existing layout files.

## Out of Scope

- Changing which settings pages are accessible to residents vs. admins (authorization — handled by middleware).
- Adding new settings tabs.
- Modifying `SettingsLayout` internals.

## Open Questions

None — root cause and fix approach are fully identified.
