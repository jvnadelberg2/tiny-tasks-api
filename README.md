# Tiny Tasks API

A minimal Node.js REST API with built-in, styled API documentation. Designed as a clean, self-contained portfolio example to demonstrate: Pure Node.js HTTP server (no frameworks), API endpoints with JSON responses, OpenAPI 3.0.3 specification (`openapi.yaml`), and Redoc rendering served directly by the app.

## Requirements
- Node.js v18 or newer (developed on v22)
- npm (comes with Node.js)

## Quick Start
Clone the repo and install dependencies:
```bash
git clone https://github.com/jvnadelberg2/tiny-tasks-api.git
cd tiny-tasks-api
npm install
```

Start the server:
```bash
npm start
```

You’ll see output similar to:
```
Server running at http://localhost:3000
Docs:   http://localhost:3000/docs
Health: http://localhost:3000/health
Tasks:  http://localhost:3000/tasks
```

## View the API
- Docs (Redoc UI): http://localhost:3000/docs — Full, styled API reference generated from `openapi.yaml`.
- Health endpoint: http://localhost:3000/health — Returns `{ "status": "ok" }`.
- Tasks endpoint: http://localhost:3000/tasks — Returns a demo list of tasks.
- Raw OpenAPI spec: http://localhost:3000/openapi.yaml

## Endpoints Overview
### GET /health
Check API liveness.

**Response**
```json
{ "status": "ok" }
```

### GET /tasks
List demo tasks.

**Response**
```json
[
  { "id": 1, "title": "First Task", "completed": false },
  { "id": 2, "title": "Second Task", "completed": true }
]
```

## OpenAPI Documentation
The API is documented in `openapi.yaml` using OpenAPI 3.0.3. It’s rendered automatically via Redoc at `/docs` when the server is running.

## License
Licensed under the MIT License — see the LICENSE file for details.
