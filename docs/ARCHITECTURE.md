# Architecture

## Overview

The Tiny Tasks API is a minimal REST API built entirely with Node.js core modules. It demonstrates professional software engineering and technical writing practices without relying on frameworks like Express. The application provides CRUD operations for tasks, serves built-in API documentation, and includes automated tests, linting, and CI/CD integration.

The design prioritizes:
- Simplicity
- Portability
- Educational value
- Documentation completeness

---

## Components

### 1. **Server (`server.js`)**
- HTTP server using Node.js `http` module.
- Handles routing, request parsing, and JSON responses.
- Implements CORS support for cross-origin requests.
- Routes are matched manually without a framework.

### 2. **Routing**
- `/health` → Health check endpoint.
- `/tasks` → Create, read, update, delete tasks.
- `/docs` → Serves API docs (Redoc UI).
- `/openapi.yaml` → Serves the OpenAPI definition.

### 3. **Data Layer**
- JSON file storage located in `data/tasks.json`.
- Synchronous read/write for simplicity (demo purposes).
- Each task object contains:
  - `id`: String (timestamp-based unique ID)
  - `title`: String (required)
  - `due`: Date in `YYYY-MM-DD` format (required)
  - `completed`: Boolean (default `false`)

### 4. **Documentation**
- OpenAPI 3.0 YAML (`openapi.yaml`) fully describes the API.
- Served at `/openapi.yaml` and visualized via `/docs`.
- Linting via `@redocly/cli`.

### 5. **Testing**
- Uses Node.js built-in `node:test` and `assert` modules.
- Coverage via `nyc`.
- Tests cover all endpoints, including edge cases.

### 6. **CI/CD**
- GitHub Actions workflows for:
  - CI (install, lint, test)
  - OpenAPI linting
  - Coverage reporting (Codecov)

---

## Decisions & Trade-offs

- **Node core only** – maximizes portability, demonstrates low-level Node.js skills; trades off convenience of frameworks like Express.
- **JSON file store** – great for demos and small workloads; not suitable for production concurrency or scaling.
- **No authentication** – simplifies demo; not secure for real deployments.
- **OpenAPI docs built-in** – ensures docs are always in sync with the API.

---

## Non-Goals

- High-availability clustering or database scaling.
- Advanced error semantics beyond basic JSON error objects.
- Role-based access control or user management.

---

## Future Improvements

- Pluggable storage backends (SQLite, Postgres).
- JWT or API key authentication.
- Pagination and filtering on `GET /tasks`.
- More robust validation (e.g., JSON Schema).
