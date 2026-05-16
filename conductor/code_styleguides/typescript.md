# TypeScript Styleguide

## General

- Use TypeScript for all new `.tsx` and `.ts` files; avoid `.jsx`/`.js` for new code
- Enable strict mode (already configured in `tsconfig.json`)
- Prefer explicit types over `any`; use `unknown` when type is truly unknown
- Use type inference where it is obvious; don't annotate unnecessarily

## Naming

- Components: `PascalCase` (e.g., `ResidentTable`, `StatusBadge`)
- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for module-level constants
- Types and interfaces: `PascalCase`
- Booleans: prefix with `is`, `has`, `can` (e.g., `isLoading`, `hasError`)

## Types

- Prefer `interface` for object shapes that may be extended; `type` for unions, intersections, aliases
- Define Inertia page props as interfaces:
  ```ts
  interface Props {
    residents: Resident[];
    filters: { search: string };
  }
  ```
- Use `PageProps` from `@/types` for shared auth/flash data

## React Components

- Use function components with explicit prop types
- Keep components focused — one responsibility per component
- Use Shadcn/ui primitives from `@/components/ui/` before building custom components
- Prefer `@/` path alias over relative paths

## Inertia

- Use `useForm` from `@inertiajs/react` for all forms
- Import Wayfinder route functions from `@/actions/` or `@/routes/` — never hardcode URLs
- Use `router.visit()` or `<Link>` for navigation, not `window.location`

## Imports Order

1. React and React-related
2. Inertia imports
3. Third-party libraries
4. Internal `@/` imports (components, actions, routes, types)
5. Relative imports

## Comments

- Write comments only when the WHY is non-obvious
- No multi-line comment blocks; one short line max
- Do not document what the code obviously does
