# API Reference

Base URL: `http://localhost:3000`  
The canonical source of truth for the API is [`openapi.yaml`](../openapi.yaml).

---

## Health

**GET** `/health` → `200 OK`  
**Purpose:** Verify the API is up.

**Response:**
```json
{ "status": "ok" }
```

---

## Tasks

### List tasks

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

### Create task

**POST** `/tasks` → `201 Created`  
**Request body (JSON):**
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

**Errors:**
- `400 Bad Request` — invalid or missing fields:
  ```json
  { "error": "Invalid request body" }
  ```

---

### Get task by ID

**GET** `/tasks/{id}` → `200 OK`

**Response:**
```json
{
  "id": "1754922040132",
  "title": "demo task",
  "due": "2025-12-31",
  "completed": false
}
```

**Errors:**
- `404 Not Found` — task does not exist:
  ```json
  { "error": "Task not found" }
  ```

---

### Update task

**PUT** `/tasks/{id}` → `200 OK`  
**Request body (JSON):**
```json
{
  "title": "updated task title",
  "due": "2025-12-31",
  "completed": true
}
```

**Unset due date (either of these):**
```json
{ "due": null }
```
```json
{ "due": "" }
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

**Errors:**
- `400 Bad Request` — invalid body:
  ```json
  { "error": "Invalid request body" }
  ```
- `404 Not Found` — task does not exist:
  ```json
  { "error": "Task not found" }
  ```

---

### Delete task

**DELETE** `/tasks/{id}` → `204 No Content`

**Errors:**
- `404 Not Found` — task does not exist:
  ```json
  { "error": "Task not found" }
  ```

---

## Method Not Allowed

If an unsupported HTTP method is used for a valid path:
```json
{ "error": "Method not allowed" }
```

---

## Notes

- All dates use `YYYY-MM-DD` format for `due`.
- This is a demo API; data is stored in-memory and resets when the server restarts.
- Schema definitions are in [`openapi.yaml`](../openapi.yaml).
