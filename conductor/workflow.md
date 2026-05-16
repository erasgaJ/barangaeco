# BarangaEco — Development Workflow

## Methodology

Test-Driven Development (TDD) using Red-Green-Refactor cycle.

1. **Red** — Write a failing test that defines the expected behavior
2. **Green** — Write the minimum code to make the test pass
3. **Refactor** — Clean up code while keeping tests green

## Test Coverage Target

**80%** minimum coverage across all modules.

## Commit Strategy

**Per phase** — Commit once when an entire plan phase is complete and all phase tests pass.

```bash
git add <specific files>
git commit -m "phase(N): <description>"
```

## Code Quality Gates

Run before every commit:

```bash
vendor/bin/pint --dirty --format agent   # PHP formatting
php artisan test --compact               # Run tests
npm run lint:check                       # ESLint
npm run format:check                     # Prettier
npm run types:check                      # TypeScript
```

Or run the full suite:
```bash
composer run ci:check
```

## Git Notes

Use git notes for tracking task metadata when needed.

## Task Structure

Each track's `plan.md` breaks work into **phases**, each phase into **tasks**. Tasks follow TDD:
- Write test first (failing)
- Implement feature (green)
- Refactor if needed
- Mark task complete

## Branch Strategy

- `main` — primary branch
- Feature work happens on `main` for now (small team)
- Create feature branches for larger tracks if needed

## Tools

- **PHP artisan** — scaffolding, migrations, route inspection
- **Pest** — feature and unit tests (`php artisan make:test --pest`)
- **Pint** — PHP formatting (`vendor/bin/pint --dirty --format agent`)
- **Wayfinder** — auto-generated type-safe routes (do not edit manually)
