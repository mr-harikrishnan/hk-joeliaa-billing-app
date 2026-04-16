# How I Build React Projects

This document explains the architecture, patterns, and conventions I follow across all my frontend projects. If you're evaluating my work or handing me a new project — this tells you exactly what to expect.

---

## Tech Stack (and Why)

| Tool | Why I use it |
|---|---|
| **React + TypeScript** | Type safety catches bugs before runtime. Every prop, API response, and state shape is typed explicitly. |
| **Vite** | Fast dev server, minimal config, great DX. |
| **Tailwind CSS** | Utility-first keeps styles co-located with components. No context-switching between files. |
| **Redux Toolkit + RTK Query** | RTK Query handles server state (caching, loading, errors) so I don't write redundant `useEffect` + `useState` patterns for data fetching. Redux for auth/global state only. |
| **Axios** | Flexible enough to build proper interceptor chains for JWT refresh logic — something `fetch` doesn't handle cleanly. |
| **React Router v7** | Declarative, nested-route-friendly. Route definitions live in one place, not scattered across components. |
| **Formik + Yup** | Form state + validation schema separated from UI. Yup schemas are reusable and easy to extend. |

---

## Folder Structure

Every project follows this shape:

```
src/
├── api/                  # URL builder functions — one file per domain
├── app/
│   ├── providers/        # App-level wrappers (Redux, Toaster, etc.)
│   ├── routes/           # All route config in one place
│   └── store/            # Redux store + rootReducer
├── common/
│   ├── loaders/          # Generic loading states
│   └── ui/               # Headless, reusable components (Button, Input, Table, Modal…)
├── config/               # Env variable access — one file, no scattered `import.meta.env`
├── features/             # Feature-based modules (see below)
├── hoc/                  # Higher-order components for guards
├── layouts/              # Shell layouts per role/section
├── state/
│   └── services/         # Axios instance, RTK Query base, endpoint injections
├── types/                # TypeScript interfaces — one file per domain
└── utils/                # Pure utility functions (storage, navigation, date, etc.)
```

### The `features/` folder

Each feature is self-contained:

```
features/
└── super-admin/
    └── students/
        ├── components/   # Skeletons, sub-components specific to this feature
        ├── pages/        # Full page components
        └── routes/       # Route definitions for this feature
```

No feature reaches into another feature's internals. Shared things go into `common/` or `utils/`.

---

## Architecture Decisions

### 1. Route-level access control, not component-level

Routes are split into four groups — `authRoutes`, `publicRoutes`, `protectedRoutes`, and fallbacks. Inside protected routes, every page is wrapped with a `RoleGuard` before it renders:

```tsx
{
  path: "/admin/students",
  element: (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <StudentsPage />
    </RoleGuard>
  )
}
```

Access is denied **before** the component mounts — no flash, no partial render.

### 2. JWT refresh is handled at the Axios layer

I don't scatter `try/catch` token refresh logic in components or RTK Query hooks. The Axios instance handles it transparently:

- Decodes the JWT and checks `exp` before every request
- If token expires within 5 seconds, proactively refreshes it
- While refresh is in-flight, all other requests are **queued**, not failed
- On a `401` response, retries the original request with the new token
- On unrecoverable failure, clears storage and redirects to login

Every RTK Query endpoint and direct API call gets this behavior automatically — zero extra code needed per endpoint.

### 3. RTK Query for server state, Redux only for auth

I don't put API responses in Redux slices. RTK Query handles caching, loading states, and invalidation. Redux only stores things that are truly global and non-async — like the authenticated user's role and session info.

### 4. HOC guards, not inline conditionals

Instead of putting `if (!isAuthenticated) return <Navigate />` inside every page component, I use Higher-Order Components:

| HOC | What it does |
|---|---|
| `withAuthGuard` | Redirects to `/login` if no session exists |
| `withGuestGuard` | Redirects logged-in users away from auth pages |
| `withRoleGuard` | Redirects if user's role isn't in the allowed list |
| `withScreenGuard` | Shows a fallback UI on small screens |

Pages stay clean. Guards compose.

### 5. Typed API layer end-to-end

Every API endpoint has matching TypeScript interfaces in `src/types/`. The chain looks like:

```
URL builder (api/)  →  RTK Query endpoint (state/services/endpoints/)  →  TypeScript types (types/)
```

No `any`, no `unknown` passed to UI components.

---

## Component Conventions

### Reusable UI components accept explicit variants, not open className overrides

```tsx
<Button variant="primary" size="md" loading={isSubmitting} icon={PlusIcon}>
  Add Student
</Button>
```

Variants are typed. Loading state, icon position, disabled state — all controlled through props, not ad-hoc class overrides.

### Formik schemas live outside the component

```
features/auth/login/
├── formik/
│   └── login.schema.ts   ← validation schema here
└── pages/
    └── LoginPage.tsx     ← clean component here
```

This keeps page components readable and makes schemas independently testable.

### Storage is always accessed through a typed wrapper

```ts
getItemFromStorage<string>({ key: "accessToken" })
setItemInStorage({ key: "userRole", value: UserRole.ADMIN })
```

No raw `localStorage.getItem("...")` calls scattered around the codebase.

---

## What Clients Can Expect

- **Readable code** — folder structure is obvious, components are small, logic is where you'd expect it
- **No auth surprises** — token refresh, session expiry, and role enforcement are handled at the infrastructure level, not per-page
- **Easy to extend** — adding a new role, a new feature, or a new API endpoint follows the same pattern as everything else
- **TypeScript throughout** — API responses, props, Redux state, form values — all typed
- **Deployable out of the box** — Vercel-ready with `vercel.json`, environment variables documented

---

## Running a Project

```bash
npm install
npm run dev        # development
npm run build      # production build
npm run preview    # preview build locally
npm run lint       # ESLint check
```

Environment variables go in `.env`:

```env
VITE_API_BASE_URL=https://your-api.com
```