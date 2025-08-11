# Tiny Tasks API

Minimal, dependency-free Node.js API for portfolio/demo purposes. Provides live API docs (Redoc, Swagger UI), Prometheus-style metrics, and structured JSON request logs.

## Requirements
- Node.js 18+ (20+ recommended)
- No external NPM dependencies

## Installation
```bash
git clone <REPO URL> tiny-tasks-api
cd tiny-tasks-api
```

## Run
```bash
node server.js
# optionally:
# PORT=3000 node server.js
# npm start   # if defined in package.json
```

Verify:
```bash
curl http://localhost:3000/health
```

## API Documentation
- Redoc: http://localhost:3000/docs  
- Swagger UI: http://localhost:3000/docs-swagger  
- OpenAPI (YAML): http://localhost:3000/openapi.yaml

## Curl Quickstart
```bash
chmod +x examples/curl-quickstart.sh
./examples/curl-quickstart.sh
```

## Observability

### Structured Request Logs
One JSON line per request is written to stdout:
```json
{"t":"2025-08-11T00:00:00.000Z","method":"GET","path":"/tasks","route":"/tasks","status":200,"dur_ms":3,"ua":"curl/8.4.0","ip":"::1"}
```
Pretty-print locally:
```bash
node server.js 2>&1 | jq .
```

### Metrics (Prometheus)
Text exposition at:
```
http://localhost:3000/metrics
```
Includes `http_requests_total{method,route,status}`, `process_uptime_seconds`, and `process_memory_bytes{type=...}`.

## Endpoints (Summary)
- `GET /health`
- `GET /metrics`
- `GET /docs`
- `GET /docs-swagger`
- `GET /openapi.yaml`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/{id}`
- `PUT /tasks/{id}`
- `PATCH /tasks/{id}`
- `DELETE /tasks/{id}`

## Configuration
- `PORT` (default: `3000`)

## Development
```bash
node --watch server.js
```

## Troubleshooting
- `EADDRINUSE`: choose another port (`PORT=3001 node server.js`).
- `/openapi.yaml` returns 404: ensure `openapi.yaml` exists at project root and the server is started from that directory.
- Swagger UI requires network access to the CDN. Redoc at `/docs` works offline.
