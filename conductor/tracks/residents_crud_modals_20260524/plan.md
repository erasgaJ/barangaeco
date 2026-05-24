# Plan: Residents CRUD Modals

## Track ID
`residents_crud_modals_20260524`

---

## Phase 1: Add Resident Modal [checkpoint: 75c3ac9]

- [x] Wire "Add Resident" button to open `showAddModal` state [2f99e2f]
- [x] Create `AddResidentModal` component with fixed overlay and centered panel [2f99e2f]
- [x] Implement circular photo upload area (person icon, pencil overlay, "UPLOAD PHOTO" label, "JPG or PNG, max 2MB" hint) [2f99e2f]
- [x] Add client-side 2 MB file size check with inline error feedback [2f99e2f]
- [x] Add form fields: Full Name, Address, Barangay (select from `barangays` prop), Contact Number (+63 prefix), Email Address [2f99e2f]
- [x] Implement `router.post` submission using Wayfinder route with `forceFormData: true` [2f99e2f]
- [x] Display server-side validation errors inline below each field [2f99e2f]
- [x] Reset form state on modal close (Cancel or success) [2f99e2f]
- [x] Commit: `phase(1): Add resident modal with photo upload and form validation` [2f99e2f]

---

## Phase 2: Edit Resident Modal [checkpoint: fa3490f]

- [x] Wire Edit (pencil) button per row to open `editingResident` state with the selected resident [1d3f063]
- [x] Create `EditResidentModal` component with pre-filled form [1d3f063]
- [x] Show resident photo (or initials avatar fallback) + Resident ID badge (format: `RES-YYYY-NNNN`) in modal header [1d3f063]
- [x] Pre-fill fields: Full Name, Address, Barangay (select), Contact Number [1d3f063]
- [x] Implement `router.post` with `_method: PUT` and `forceFormData: true` to handle file uploads on update [1d3f063]
- [x] Display server-side validation errors inline below each field [1d3f063]
- [x] Reset editing state on modal close [1d3f063]
- [x] Commit: `phase(2): Edit resident modal with pre-filled form and PUT submission` [1d3f063]

---

## Phase 3: Delete Resident Confirmation [checkpoint: 5df1e0e]

- [x] Wire Delete (trash) button per row to open `deletingResident` state with the selected resident [5df1e0e]
- [x] Create `DeleteResidentModal` component [5df1e0e]
- [x] Show warning triangle icon (red/amber), title "Delete Resident Record", confirmation message [5df1e0e]
- [x] Show resident card with photo/initials, full name, formatted ID [5df1e0e]
- [x] Implement `router.delete` submission with loading state on button [5df1e0e]
- [x] CANCEL button closes modal; DELETE RECORD button triggers deletion [5df1e0e]
- [x] Close modal and reset state on success [5df1e0e]
- [x] Commit: `phase(3): Delete resident confirmation modal` [5df1e0e]

---

## Phase 4: Tests and Quality Gates

- [ ] Write Pest feature test: `POST /admin/residents` stores resident and returns redirect
- [ ] Write Pest feature test: `PUT /admin/residents/{id}` updates resident fields
- [ ] Write Pest feature test: `DELETE /admin/residents/{id}` deletes resident and returns redirect
- [ ] Write Pest feature test: `POST /admin/residents` returns 422 on missing required fields
- [ ] Run `php artisan test --compact --filter=ResidentController` — all tests green
- [ ] Run `npm run lint:check` — no errors
- [ ] Run `npm run format:check` — no errors
- [ ] Run `npm run types:check` — no errors
- [ ] Run `vendor/bin/pint --dirty --format agent` — PHP formatted
- [ ] Commit: `phase(4): Feature tests and quality gates for residents CRUD`
