# Elect — Frontend

React SPA for the Elect voting system, talking to the Spring Boot backend.

## Setup

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. The Vite dev server proxies every
`/api/*` request to `http://localhost:8080` (see `vite.config.js`), so
your Spring Boot backend must be running locally on port 8080 — but you
never need to configure CORS on the backend, since the browser sees
everything as same-origin.

## Required backend additions

This frontend expects a few small endpoints that weren't part of the
original API build — see the chat for the exact code, all of it reusing
repository methods you already have:

- `GET /api/admin/parties` and `/api/admin/candidates` — list PENDING
  ones for the approval tabs
- `GET /api/admin/elections` and `/api/admin/constituencies` — list all,
  for admin management dropdowns
- `GET /api/elections` — list all elections publicly (separate from
  `/api/elections/active`, since a party needs to register candidates
  for an election before it's open)

**Also required**: add `@JsonIgnore` to `User.passwordHash` — see the
chat for why. Do this one regardless of anything else.

## Structure

- `src/api/client.js` — thin fetch wrapper, attaches the JWT, unwraps
  error messages from `GlobalExceptionHandler`'s response shape
- `src/context/AuthContext.jsx` — login state, shared across the app
  via React context; token/role persisted to `localStorage`
- `src/components/ProtectedRoute.jsx` — client-side route guard
  mirroring the backend's role split (UX only — the backend is the
  real enforcement either way)
- `src/pages/` — one file per screen: login, both registration flows,
  public election browsing + voting, party dashboard, admin dashboard

## Design

Deliberately styled as a civic/document interface (voter register,
ballot sheet, gazette) rather than a generic SaaS dashboard — see
`src/index.css` for the full token set (colors, type, the `.register`
list-row pattern used for elections/candidates/parties throughout).
