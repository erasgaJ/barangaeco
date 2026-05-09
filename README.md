# BarangaEco

A barangay management system for waste collection, resident records, document requests, complaints, and announcements. Built with Laravel 13, React 19, and Inertia.js.

## Requirements

- PHP 8.4+
- Node.js 20+
- Composer
- [Laravel Herd](https://herd.laravel.com/) (recommended) or any local PHP server

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/erasgaJ/barangaeco.git
cd barangaeco
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Environment setup

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and configure your database connection:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=barangaeco
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run database migrations

```bash
php artisan migrate
```

### 5. Create an admin account

```bash
php artisan tinker --execute="
App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@barangaeco.ph',
    'password' => bcrypt('password'),
    'role' => 'admin',
    'email_verified_at' => now(),
]);
"
```

### 6. Start the development server

```bash
composer run dev
```

This starts the PHP server, queue worker, and Vite dev server together.

The app will be available at `http://localhost:8000` (or `https://barangaeco.test` if using Laravel Herd).

Log in with:
- **Email:** `admin@barangaeco.ph`
- **Password:** `password`

## Tech Stack

- **Backend:** Laravel 13, Fortify (auth), Sanctum (API tokens)
- **Frontend:** React 19, Inertia.js v3, Tailwind CSS v4, Shadcn/ui
- **Routing:** Laravel Wayfinder (type-safe route generation)
- **Database:** MySQL

## Features

### Admin Web App
- Dashboard with stats and today's waste routes
- Resident Records management
- Waste Collection Schedules (weekly calendar view)
- Collector Management
- Document Request approvals
- Complaint tracking
- Announcements

### Mobile API (Sanctum token auth)
- Resident: dashboard, document requests, complaints
- Collector: schedule listing, status updates

## Code Quality

```bash
npm run lint          # ESLint with auto-fix
npm run format        # Prettier auto-fix
npm run types:check   # TypeScript check
composer run ci:check # Full CI suite
```
