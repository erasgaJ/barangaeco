# BarangaEco — Tech Stack

## Backend

| Tool | Version | Purpose |
|------|---------|---------|
| PHP | 8.4 | Runtime |
| Laravel | 13 | Web framework |
| Laravel Fortify | 1.x | Authentication backend (login, 2FA, registration) |
| Laravel Sanctum | 4.x | API token authentication for mobile app |
| Laravel Wayfinder | 0.x | Type-safe route generation for frontend |
| Laravel Pint | 1.x | PHP code formatter |
| Pest | 4.x | Testing framework |
| FakerPHP | 1.x | Localized data generation (seeders & factories) |
| MySQL | — | Primary database |

## Frontend

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Inertia.js | 3.x | SPA bridge (no separate API for web) |
| JavaScript (JSX) | ES2022+ | Frontend language — `.jsx` files, no TypeScript |
| Tailwind CSS | 4.x | Styling |
| Shadcn/ui + Radix UI | — | UI components |
| Vite | 8.x | Build tool |
| ESLint + Prettier | 9.x / 3.x | Code quality |

## Architecture Patterns

- **Web routes** use Inertia (`Inertia::render()`) — no REST JSON for the admin web app
- **API routes** use Sanctum token auth (`auth:sanctum` guard) — for resident and collector mobile apps
- **Route generation:** Wayfinder auto-generates `@/actions/` and `@/routes/` — import these; never hardcode URLs
- **Auth:** Fortify handles all web auth flows; mobile uses `Api\Auth\AuthController`
- **Role middleware:** `role:admin` restricts admin routes; applied at the route group level

## Directory Structure

```
app/
  Http/Controllers/
    Admin/          # Admin web controllers
    Api/
      Auth/         # Mobile auth
      Resident/     # Resident mobile API
      Collector/    # Collector mobile API
    Settings/       # Profile & security settings
  Models/           # Eloquent models

resources/js/
  pages/
    admin/          # Admin Inertia pages
    auth/           # Auth pages
    settings/       # Settings pages
  components/
    ui/             # Shadcn/ui components (check before creating new)
  actions/          # Wayfinder-generated (do not edit)
  routes/           # Wayfinder-generated (do not edit)
```

## Local Development

- URL: `https://barangaeco.test` (served by Laravel Herd — always running)
- Start: `composer run dev` (PHP server + queue + Vite)
- Tests: `php artisan test --compact`
