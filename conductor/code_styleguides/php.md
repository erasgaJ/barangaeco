# PHP Styleguide

## General

- PHP 8.4 — use modern features: constructor property promotion, readonly properties, enums, named arguments, match expressions
- PSR-12 formatting enforced by Laravel Pint — always run `vendor/bin/pint --dirty --format agent` after PHP edits
- Always use curly braces for control structures, even single-line bodies
- Use explicit return types and parameter type hints on all methods

## Naming

- Controllers: `PascalCase` + `Controller` suffix (e.g., `ResidentController`)
- Models: `PascalCase` singular (e.g., `WasteCollectionSchedule`)
- Methods: `camelCase`, descriptive (e.g., `approveDocumentRequest`, not `approve`)
- Variables: `camelCase`
- Enums: `TitleCase` keys (e.g., `Status::Pending`, `Status::Approved`)
- Routes/names: `kebab-case` for paths, `dot.notation` for names

## Controllers

- Keep controllers thin — delegate business logic to action classes or service methods
- Use form requests for validation (`php artisan make:request`)
- Return `Inertia::render()` for web routes; `response()->json()` or Resources for API routes
- Use Eloquent API Resources for API responses

## Models

- Define `$fillable` explicitly — never use `$guarded = []` without reason
- Use Eloquent relationships, not raw joins
- Scope complex queries with local scopes
- Use factories for test data

## Testing

- All tests use Pest v4
- Feature tests for controllers/routes; unit tests for isolated logic
- Use model factories — check for custom states before manually setting attributes
- Use `RefreshDatabase` trait for database tests
- Name tests descriptively: `it('approves a document request and notifies the resident')`

## Comments

- PHPDoc blocks preferred over inline comments
- Use array shape types in PHPDoc where helpful
- Only comment when the WHY is genuinely non-obvious
