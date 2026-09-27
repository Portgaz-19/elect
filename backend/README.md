# Elect — Online Voting System for Nigeria

A Java/Spring Boot backend for a voting platform: political parties
self-register and get approved by an election admin, parties register
candidates for specific elections, and eligible voters cast one vote per
election. Built as a portfolio project to learn Spring Boot in depth,
end to end from Spring Initializr through to a deployable API.

## Stack

- Spring Boot 4.1.1 / Java 17 (developed against JDK 24 locally; Maven
  cross-compiles to the 17 target)
- Spring Security + JWT (stateless, role-based: `ADMIN`, `PARTY`, `VOTER`)
- PostgreSQL + Flyway migrations
- Docker / docker-compose

## Running locally

**With Docker** (Postgres + the app, no local Postgres install needed):
```bash
docker compose up --build
```
The app comes up on `http://localhost:8080`. Flyway runs the schema
migration automatically on boot.

**Without Docker** — start a local Postgres on port 5432 with a
`voting_system` database, matching the credentials in
`application.yml`, then run the app from IntelliJ or:
```bash
mvn spring-boot:run
```

## Seeding a dev admin account

There's no self-signup for admins by design — an election body isn't
something you sign up for; see "Design decisions" below. For local
development, `DevDataSeeder` creates one admin login on startup
(`admin@elect.ng` / `Admin123!`), but **only when the `dev` Spring
profile is active** — it will not run, and that password will not
exist, in any other environment. To enable it locally, either set the
environment variable `SPRING_PROFILES_ACTIVE=dev`, or add
`-Dspring.profiles.active=dev` to your IntelliJ run configuration's VM
options.

## Core flow

1. **Admin** creates `constituencies`, then `elections` scoped to a
   constituency, with a start/end time.
2. **Party** self-registers (`POST /api/party/register`) — starts
   `PENDING`.
3. **Admin** approves the party.
4. **Party** registers candidates for an election
   (`POST /api/party/candidates`) — starts `PENDING`.
5. **Admin** approves candidates.
6. **Admin** bulk-imports the eligible voter roll via CSV
   (`POST /api/admin/voter-roll/upload`).
7. **Voter** matches themselves against the roll and sets a password
   (`POST /api/auth/voter/register`), then logs in.
8. **Admin** opens the election
   (`PATCH /api/admin/elections/{id}/status`, `{"status": "OPEN"}`).
9. **Voter** browses what's on the ballot
   (`GET /api/elections/active`, `GET /api/elections/{id}/candidates`)
   and casts a vote (`POST /api/voter/elections/{id}/vote`) —
   enforced as one vote per voter per election at the database level,
   not just in application code.
10. **Admin** views results and turnout
    (`GET /api/admin/elections/{id}/results`,
    `GET /api/admin/elections/{id}/turnout`).

## Voter roll CSV format

```csv
voterRegNumber,fullName,dateOfBirth,constituencyId
VIN00012345,Chidinma Okafor,1998-04-12,3f2b1c9e-...
```

## API reference

**Auth**
- `POST /api/auth/login` — shared login for all three roles
- `POST /api/auth/voter/register` — match against the pre-loaded roll,
  set a password

**Admin** (`ROLE_ADMIN` required)
- `POST /api/admin/constituencies`
- `POST /api/admin/elections`
- `PATCH /api/admin/elections/{id}/status`
- `GET  /api/admin/elections/{id}/turnout`
- `GET  /api/admin/elections/{id}/results`
- `PATCH /api/admin/parties/{id}/approve` / `/reject`
- `PATCH /api/admin/candidates/{id}/approve` / `/reject`
- `POST /api/admin/voter-roll/upload` (multipart CSV)

**Party** (`ROLE_PARTY` required, except `/register`)
- `POST /api/party/register` — public; this is how a party gets a login
- `GET  /api/party/me`
- `POST /api/party/candidates`
- `GET  /api/party/candidates`

**Public** (no auth required)
- `GET /api/elections/active`
- `GET /api/elections/{id}`
- `GET /api/elections/{id}/candidates?constituencyId=`
- `GET /api/candidates/{id}`
- `GET /api/parties`

**Voter** (`ROLE_VOTER` required)
- `GET  /api/voter/elections/{id}/eligibility`
- `POST /api/voter/elections/{id}/vote`

## Design decisions

- **Voter eligibility**: an admin pre-loads a voter roll (simulated
  VIN/NIN + date of birth); a voter can only create a login by matching
  an existing roll entry. There's no open self-signup — this mirrors
  how real voter registration gates who's eligible before anyone can
  ever log in.
- **Ballot secrecy**: votes are linked to the voter in the database
  (non-duplicable, not anonymous) for this version. Full anonymity
  would require a token-based unlinking scheme or blind signatures —
  a meaningfully different level of cryptographic complexity, noted
  as a stretch goal rather than attempted here.
- **Double-vote prevention**: guarded at two layers. `VoteService` does
  an application-level check first, for a fast, friendly rejection
  message. The actual guarantee is a database-level unique constraint
  on `(voter_id, election_id)` on the `votes` table — this is what
  makes a double vote genuinely impossible even under two concurrent
  requests racing each other, which an application-level check alone
  cannot fully prevent.
- **Constituency scoping**: both voters and candidates carry a
  `constituency_id`. A voter can only vote for candidates registered in
  their own constituency, except for presidential elections, which are
  national and open to every voter regardless of constituency.
- **Results tallying**: currently counts every approved candidate
  across a whole election regardless of constituency subdivisions —
  correct for a single-constituency race like a presidential election,
  but would need per-constituency grouping to properly support a
  simultaneous multi-seat election (e.g. all National Assembly seats
  counted independently per constituency in one election cycle). Known
  simplification, not yet built.

## Notable issues hit and fixed during development

Kept here partly as documentation, partly as evidence of the debugging
that went into this — these were all real, working-code bugs, not
typos caught before running:

- **Spring Boot 4's modular starters**: `spring-boot-starter-webmvc`
  replaces the old `spring-boot-starter-web`, and every major starter
  now has its own paired `-test` companion (e.g.
  `spring-boot-starter-security-test`) instead of one catch-all
  `spring-boot-starter-test`.
- **`DaoAuthenticationProvider`'s constructor takes a
  `UserDetailsService`**, not a `PasswordEncoder` — the encoder is set
  afterward via `.setPasswordEncoder()`.
- **Without a `@RestControllerAdvice` global exception handler, custom
  exceptions annotated with `@ResponseStatus` silently fell back to a
  bare `403 Forbidden` with no response body**, instead of their
  actual annotated status (e.g. `409 Conflict`). Confirmed by tracing a
  full SQL query log to prove the exception really was being thrown
  correctly — the status mapping was the only thing wrong.
- **Lombok's `@Builder` ignores field initializers** (`= Instant.now()`,
  `= true`) unless the field is also annotated `@Builder.Default`.
  This caused a silent bug where every `User` created via the builder
  had `enabled = false` regardless of the field's declared default —
  meaning newly registered accounts couldn't log in — plus a hard
  `NOT NULL` constraint violation on `Party.appliedAt`.
- **Postgres column names can't contain hyphens** in an unquoted
  identifier — an early `@JoinColumn(name = "constituency-id")` typo
  would have produced invalid SQL at runtime.

## Next steps

- React (or another) frontend
- OTP step on voter registration for additional realism
- Broader automated test coverage (service-layer unit tests for
  `VoteService` and `AdminService` specifically, beyond the current
  context-load smoke test)
- Deployment (Railway or Render)
- Stretch: ballot anonymization layer
