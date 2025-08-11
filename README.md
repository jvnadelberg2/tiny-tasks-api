=====================

# Tiny Tasks API

A minimal, self-contained Node.js REST API demonstrating clean design, in-code documentation, and OpenAPI-powered developer docs — all without external dependencies.

---

## Features
- **No dependencies:** Built entirely with Node.js core modules.
- **RESTful endpoints:** `GET`, `POST`, `PUT`, and `DELETE` for `/tasks`.
- **OpenAPI 3.0 spec:** Served as YAML and rendered in-browser with Redoc.
- **Health check endpoint:** For uptime monitoring or automation scripts.
- **In-memory storage:** Simple, reset-on-restart dataset for demonstration.
- **Well-documented code:** Inline comments explain key design decisions.

---

## Quickstart

### 1. Clone & Install
```bash
git clone https://github.com/jvnadelberg2/tiny-tasks-api.git
cd tiny-tasks-api
```
_No dependencies to install — everything runs on vanilla Node.js._

### 2. Run the API
```bash
node server.js
```
You’ll see:
```
Server running at http://localhost:3000
Health: http://localhost:3000/health
Tasks:  http://localhost:3000/tasks
Docs:   http://localhost:3000/docs
```

---

## Endpoints

| Method | Path              | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | `/health`         | Returns `{ status: "ok" }`                |
| GET    | `/tasks`          | List all tasks                            |
| POST   | `/tasks`          | Create a task                             |
| GET    | `/tasks/{id}`     | Get a task by ID                          |
| PUT    | `/tasks/{id}`     | Update a task by ID                       |
| DELETE | `/tasks/{id}`     | Delete a task by ID                       |
| GET    | `/openapi.yaml`   | Download the OpenAPI YAML spec            |
| GET    | `/docs`           | View interactive API docs (Redoc)         |

---

## Example Usage

### Create a Task
```bash
curl -X POST http://localhost:3000/tasks   -H "Content-Type: application/json"   -d '{"title":"demo","due":"2025-12-31"}'
```

### Update a Task
```bash
curl -X PUT http://localhost:3000/tasks/1   -H "Content-Type: application/json"   -d '{"completed":true}'
```

### Delete a Task
```bash
curl -X DELETE http://localhost:3000/tasks/1
```

---

## OpenAPI Documentation

- **YAML Spec:** [http://localhost:3000/openapi.yaml](http://localhost:3000/openapi.yaml)  
- **Rendered Docs:** [http://localhost:3000/docs](http://localhost:3000/docs)  

---

## Project Structure

```
tiny-tasks-api/
├── server.js           # Main API implementation
├── openapi.yaml        # OpenAPI 3.0 definition
├── openapi.html        # Redoc HTML viewer
├── README.md           # This file
├── ARCHITECTURE.md     # Design & technical notes
└── tests/              # Endpoint tests
```

---

## License
MIT
