Here’s a cleaned-up, presentation-ready `architecture.md` you can drop in:

---

# Architecture

**Project:** Tiny Tasks API
**Purpose:** Minimal Node.js REST API with self-contained documentation (Redoc) and no external dependencies.

---

## Runtime & Core Technologies

* **Node.js:** v18+ (tested up to v22)
* **HTTP Layer:** Native `node:http` module (no Express/Koa)
* **State Management:** In-memory JavaScript array (`tasks`) — suitable for demo and testing
* **File Serving:** `fs/promises` for OpenAPI/HTML docs
* **CORS:** Permissive (allow all origins) for local development and testing
* **Documentation UI:** Redoc served from `/docs`

---

## Request Flow

1. **Entry Point**

   * `server.js` is the main file.
   * `createServer()` sets up and returns the HTTP server instance.
   * When run directly via `node server.js`, it listens on `PORT` (default `3000`).

2. **Routing**

   * **`GET /health`** → Returns `{ "status": "ok" }` for uptime checks.
   * **`GET /tasks`** → Returns all tasks.
   * **`POST /tasks`** → Adds a new task from JSON body (`title`, optional `due`).
   * **`GET /tasks/{id}`** → Returns a single task.
   * **`PUT /tasks/{id}`** → Updates task’s `title`, `due`, or `completed` status.
   * **`DELETE /tasks/{id}`** → Removes a task.
   * **`GET /docs`** → Serves Redoc HTML UI.
   * **`GET /openapi.yaml`** → Serves raw OpenAPI spec.

3. **JSON Body Parsing**

   * Manual parsing via streamed request body.
   * Invalid or non-JSON bodies → `400 Bad Request`.

4. **Error Handling**

   * Client errors (invalid input, missing task) → `400` / `404`
   * Server errors (unexpected exceptions) → `500 Internal Server Error`

---

## File Structure

```
tiny-tasks-api/
├── server.js         # HTTP server & routing
├── openapi.yaml      # API specification (OpenAPI 3.0)
├── openapi.html      # Prebuilt Redoc UI
├── architecture.md   # This file
├── README.md         # Project overview and usage
└── tests/            # Automated tests for all endpoints
```

---

## Extensibility Roadmap

Short-term:

* Add pagination & filtering to `GET /tasks`
* Add partial updates with `PATCH`
* Add request validation against OpenAPI spec

Mid-term:

* Persist tasks to JSON, SQLite, or Redis
* Split routing and handlers into separate modules
* Add environment-based configuration

Long-term:

* Implement API key or JWT authentication
* Add rate limiting and logging middleware
* Deploy with Docker or serverless platforms

---

Do you want me to now **also restructure your README** so this `architecture.md` isn’t bloating it, and the README focuses just on usage and quick start? That would make it much cleaner.
