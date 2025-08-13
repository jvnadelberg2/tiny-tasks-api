# API Reference

Base URL: `http://localhost:3000`
Canonical source: [`openapi.yaml`](../openapi.yaml)

## Health

GET `/health` → 200 OK
Purpose: Verify the API is running.

Response:
    {
      "status": "ok"
    }

## Tasks

### List tasks

GET `/tasks` → 200 OK

Response:
    [
      {
        "id": "1754922040132",
        "title": "demo task",
        "due": "2025-12-31",
        "completed": false
      }
    ]

### Create task

POST `/tasks` → 201 Created
Request body (JSON):
    {
      "title": "demo task",
      "due": "2025-12-31"
    }

Response:
    {
      "id": "1754922040132",
      "title": "demo task",
      "due": "2025-12-31",
      "completed": false
    }

Errors:
    { "error": "Invalid request body" }

### Get task by ID

GET `/tasks/{id}` → 200 OK

Response:
    {
      "id": "1754922040132",
      "title": "demo task",
      "due": "2025-12-31",
      "completed": false
    }

Errors:
    { "error": "Task not found" }

### Update task

PUT `/tasks/{id}` → 200 OK
Request body (JSON):
    {
      "title": "updated task title",
      "due": "2025-12-31",
      "completed": true
    }

Unset due date (either of these):
    { "due": null }
    { "due": "" }

Response:
    {
      "id": "1754922040132",
      "title": "updated task title",
      "due": "2025-12-31",
      "completed": true
    }

Errors:
    { "error": "Invalid request body" }
    { "error": "Task not found" }

### Delete task

DELETE `/tasks/{id}` → 204 No Content

Errors:
    { "error": "Task not found" }

## Method Not Allowed

If an unsupported HTTP method is used on a valid path:
    { "error": "Method not allowed" }

## Notes

- Dates use `YYYY-MM-DD` for `due`.
- Data is stored in-memory; restarts clear all tasks.
- See [`openapi.yaml`](../openapi.yaml) for full schemas.
