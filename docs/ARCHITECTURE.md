# Architecture

**Runtime:** Node.js (>=18)  
**HTTP:** Node core `http`  
**State:** In-memory array (`tasks`) for demo simplicity  
**JSON:** Manual body parse; JSON responses with proper status codes  
**CORS:** Permissive for testing

## Request Flow
1. `index.js` creates and starts the server from `createServer()` in `server.js`.
2. `server.js`:
   - Parses URL/method
   - Optionally parses JSON body
   - Routes to handlers (`/health`, `/tasks`, `/tasks/{id}`)
   - Writes JSON responses
3. Tests spin up the server on an ephemeral port and exercise endpoints.

## Error Handling
- Client errors → `400`/`404`
- Unexpected errors → `500` with minimal details

## Extensibility
- Add `PUT/PATCH /tasks/{id}` for updates
- Persist to file/SQLite/Redis
- Extract router/util modules if code grows
- Add auth/rate limiting when exposing publicly
