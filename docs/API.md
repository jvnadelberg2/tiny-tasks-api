# API Reference

Base URL: `http://localhost:3000`  

This document provides detailed information on all endpoints, including methods, parameters, request bodies, and response formats.  
The canonical source of truth for the API is [`openapi.yaml`](../openapi.yaml).

---

## Health

**GET** `/health` → `200 OK`  
**Purpose:** Verify the API is up.

**Response:**
```json
{
  "status": "ok"
}
```

---

## List Tasks

**GET** `/tasks` → `200 OK`  

**Response:**
```json
[
  {
    "id": "1754922040132",
    "title": "demo task",
    "due": "2025-12-31",
    "completed": false
  }
]
```

---

## Create Task

**POST** `/tasks` → `201 Created`  

**Request Body (JSON):**
```json
{
  "title": "demo task",
  "due": "2025-12-31"
}
```

**Response:**
```json
{
  "id": "1754922040132",
  "title": "demo task",
  "due": "2025-12-31",
  "completed": false
}
```

---

## Get Task by ID

**GET** `/tasks/{id}` → `200 OK`  
Returns the specified task.

**Example:**
```bash
curl http://localhost:3000/tasks/1754922040132
```

**Response:**
```json
{
  "id": "1754922040132",
  "title": "demo task",
  "due": "2025-12-31",
  "completed": false
}
```

---

## Update Task

**PUT** `/tasks/{id}` → `200 OK`  

**Request Body (JSON):**
```json
{
  "title": "updated task title",
  "due": "2025-12-31",
  "completed": true
}
```

**Response:**
```json
{
  "id": "1754922040132",
  "title": "updated task title",
  "due": "2025-12-31",
  "completed": true
}
```

---

## Delete Task

**DELETE** `/tasks/{id}` → `204 No Content`  

Deletes the specified task. Returns no body.

---

## Error Model

All error responses follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

**Examples:**

- `404 Not Found` — task does not exist:
```json
{
  "error": "Task not found"
}
```

- `400 Bad Request` — invalid JSON body:
```json
{
  "error": "Invalid request body"
}
```

---

## Notes

- All timestamps use ISO 8601 date format (`YYYY-MM-DD` for due dates).  
- This is a demo API; data is stored in-memory and resets when the server restarts.  
- For schema definitions, see [`open]()
