# Tiny Tasks API

[![CI](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml)
[![OpenAPI Lint](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/openapi-lint.yml/badge.svg?branch=main)](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/openapi-lint.yml)
[![Coverage](https://codecov.io/gh/jvnadelberg2/tiny-tasks-api/branch/main/graph/badge.svg)](https://app.codecov.io/gh/jvnadelberg2/tiny-tasks-api)
![Node](https://img.shields.io/badge/node-20.x-brightgreen?logo=node.js)
[![License](https://img.shields.io/github/license/jvnadelberg2/tiny-tasks-api)](LICENSE)

Minimal Node.js REST API for managing tiny tasks, using Node core modules only. Includes OpenAPI docs and a small docs set.

## About

- Pure `node:http` server (no Express)
- Endpoints: `/health`, `/tasks`
- OpenAPI spec at repo root (`openapi.yaml`)
- Static docs:
  - Redoc: `/docs` (or open `openapi.html`)
  - Swagger UI: `/swagger-docs` (or open `swagger.html`)

## Quickstart

```bash
npm ci
npm start        # http://localhost:3000
```

Verify docs are served:

```bash
# Redoc
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/docs
# Swagger UI
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/swagger-docs
# Raw spec
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/openapi.yaml
```

## Endpoints (summary)

- `GET /health`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/{id}`
- `PUT /tasks/{id}`
- `DELETE /tasks/{id}`

Details: see `docs/API.md` and `openapi.yaml`.

## Development

```bash
npm run lint
npm test
npm run coverage   # open coverage/index.html
```

Configuration:
- `PORT` (default `3000`)

## Documentation

- `docs/API.md`
- `docs/OPERATIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/CONTRIBUTING.md`
- `docs/FAQ.md`
- `docs/TROUBLESHOOTING.md`

## License

MIT — see `LICENSE`.
