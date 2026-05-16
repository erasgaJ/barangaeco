# BarangaEco — Product Guidelines

## Brand Voice & Tone

**Formal and official.** This is a government-adjacent system. All UI text, error messages, notifications, and communications should use professional, clear language. Avoid slang, colloquialisms, and casual phrasing.

### Writing Principles

- Use complete sentences in messages and labels (e.g., "Document request approved." not "Approved!")
- Be specific in error messages (e.g., "The scheduled date must be a future date." not "Invalid date.")
- Use active voice and direct language
- Capitalize proper nouns: Barangay, Resident, Collector, Document Request
- Filipino terms may be used where they are the standard government term (e.g., "Barangay Captain", "Barangay Certificate")

## Design Standards

- UI follows Shadcn/ui component patterns — do not create custom UI primitives when an existing component serves the purpose
- Tailwind CSS v4 utility classes — no custom CSS unless absolutely necessary
- Tables for list views; cards for detail summaries
- Mobile-first for resident/collector-facing pages; desktop-first for admin dashboard
- Consistent status badge colors: green = active/approved, yellow = pending, red = rejected/inactive

## Data & Privacy

- Resident personal data is sensitive — do not expose it unnecessarily in API responses
- Apply role-based access strictly: admin routes require `role:admin` middleware; API routes use Sanctum token guards
- Document requests and complaints contain personal details — restrict to the submitting resident and admins only
