# Auth System — How It Works

Dead simple auth for 1–3 users. Password → JWT → httpOnly cookie.

---

## Flow

```
[Login Page]
    │
    ▼
  Enter password
    │
    ▼
  Server action: loginUser()
    ├─ Finds user in MongoDB by hardcoded email
    ├─ Compares password with bcrypt hash in DB
    ├─ If valid → creates JWT (7-day expiry) → sets httpOnly cookie "auth-token"
    └─ If invalid → returns error
    │
    ▼
  Middleware (runs on every page load)
    ├─ Has valid cookie? → allow through
    ├─ No cookie / expired? → redirect to /login
    └─ On /login with valid cookie? → redirect to /
```

---

## Files

| File | What it does |
|------|-------------|
| `src/middleware.ts` | Runs before every route. Checks the `auth-token` cookie. Redirects to `/login` if missing/invalid. Redirects away from `/login` if already authenticated. |
| `src/features/login/apis/userActions.tsx` | Server actions: `loginUser(password)` verifies password + sets cookie. `logoutUser()` deletes cookie. `createOneUser(pass)` one-time helper to seed the DB. |
| `src/features/login/lib/auth-helpers.ts` | `createHash(pass)` and `compareHash(pass, hash)` — bcrypt wrappers. |
| `src/lib/auth-utils.ts` | `generateToken(payload)` and `verifyToken(token)` — JWT sign/verify using `jose` library with HS256. |
| `src/features/login/components/loginWrapper.tsx` | Login form UI. Calls `loginUser()`, then `router.push("/")`. |

---

## Key Details

- **Password hashing**: bcrypt with 14 salt rounds
- **JWT**: HS256, 7-day expiry, signed with `JWT_SECRET` env var
- **Cookie**: httpOnly (JS can't read it), secure in production, sameSite=lax, 7-day maxAge
- **Middleware matcher**: skips `_next/static`, `_next/image`, `favicon.ico`, and `/api` routes
- **Logout**: call `logoutUser()` server action — it deletes the cookie

---

## Setup

1. Set these in `.env.local`:
   ```
   MY_MONGODB_URI=mongodb+srv://...
   MONGODB_DB=mind-extension
   JWT_SECRET=some-random-string-at-least-32-chars
   ```

2. Create your user (one-time): call `createOneUser("your-password")` or hit the sign-up flow once.

3. That's it. Login with your password, cookie gets set, middleware protects everything.
