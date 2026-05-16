# React JS Styleguide

## General

- Use `.jsx` for React component files (not `.tsx`)
- Use plain JavaScript — no TypeScript annotations, no `: type` syntax, no `interface`/`type` declarations
- Use `@/` path alias for imports instead of relative paths (e.g., `@/components/ui/button`)

## Naming

- Components: `PascalCase` (e.g., `ResidentTable`, `StatusBadge`)
- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for module-level constants
- Booleans: prefix with `is`, `has`, `can` (e.g., `isLoading`, `hasError`)
- Files: `kebab-case` matching the route (e.g., `document-requests/index.jsx`)

## React Components

- Use function components — no class components
- Keep components focused: one responsibility per component
- Check `@/components/ui/` for existing Shadcn/ui primitives before creating new components
- Destructure props directly in the function signature:
  ```jsx
  function ResidentRow({ resident, onEdit, onDelete }) { ... }
  ```

## State and Side Effects

- Use `useState` and `useEffect` from React
- Keep state as local as possible — lift only when needed
- Avoid `useEffect` for data that can be passed as Inertia props

## Inertia

- Use `useForm` from `@inertiajs/react` for all form submissions
- Import Wayfinder route functions from `@/actions/` or `@/routes/` — never hardcode URLs
- Use `<Link>` from `@inertiajs/react` for navigation, not `<a>` tags or `window.location`
- Page props come from the server via Inertia — destructure them from the component's first argument:
  ```jsx
  export default function ResidentsIndex({ residents, filters }) { ... }
  ```

## Forms

- Always use `useForm` for form state and submission — it handles loading states and errors automatically
- Show validation errors from `form.errors.<field>` below each input
- Disable submit button while `form.processing` is true

## Imports Order

1. React (`import { useState } from 'react'`)
2. Inertia imports (`@inertiajs/react`)
3. Third-party libraries (Shadcn, Radix, Lucide)
4. Internal `@/` imports (components, actions, routes)
5. Relative imports

## Comments

- Write comments only when the WHY is non-obvious
- No multi-line comment blocks — one short line max
- Do not explain what the code obviously does
