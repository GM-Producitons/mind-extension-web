## Chat Access Log Dashboard - 2026-09-02

**What:** Added a server-rendered dashboard at `/test` for logs where `isMe` or `isMaram` is true.

**Files involved:** `src/app/test/page.tsx`

**How it works:** The page queries the MongoDB `logs` collection, sorts records by timestamp descending, separates them into `isMaram` and `isMe` columns, and renders each event as a card. Each column shows its total and latest activity time. Cards expose key fields and an expandable JSON payload.

**Why (if known):** The dashboard provides a quick visual audit of tracked chat visits.

**Gotchas:**

- The page is a server component because it reads MongoDB directly.
- Records without a timestamp or optional user fields render fallback labels.

**Key concepts:** `Next.js server component`, `MongoDB logs`, `responsive two-column dashboard`
