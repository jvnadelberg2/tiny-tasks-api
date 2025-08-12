# Tiny Tasks API

[![CI](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml)
[![OpenAPI Lint](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/openapi-lint.yml/badge.svg?branch=main)](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/openapi-lint.yml)
[![Coverage](https://codecov.io/gh/jvnadelberg2/tiny-tasks-api/branch/main/graph/badge.svg)](https://app.codecov.io/gh/jvnadelberg2/tiny-tasks-api)
![Node](https://img.shields.io/badge/node-20.x-brightgreen?logo=node.js)
[![License](https://img.shields.io/github/license/jvnadelberg2/tiny-tasks-api)](LICENSE)


Minimal, dependency-light Node.js REST API for managing tiny tasks, with OpenAPI-powered docs and a clean, interview-ready repo structure.

---

## Quickstart

```bash
# 1) Install
npm ci

# 2) Lint and test
npm run lint
npm test

# 3) (Optional) Coverage report
npm run coverage
# HTML report at ./coverage/index.html

# 4) Run
npm start
# → http://localhost:3000
```

**Smoke check:**
```bash
curl -s http://localhost:3000/health | jq
# { "status": "ok" }
```

**One-liner:**
```bash
npm ci && npm run lint && npm test && npm start
```

---

## API Overview

Base URL: `http://localhost:3000`  
Endpoints and request/response examples are documented here: **[docs/API.md](./docs/API.md)**.  
OpenAPI spec: **[openapi.yaml](./openapi.yaml)**  
Rendered HTML: **open `openapi.html`** or `docs/site/openapi.html` in a browser.

---

## Documentation Map

- [`docs/API.md`](./docs/API.md) — full endpoint reference and examples
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/OPERATIONS.md`](./docs/OPERATIONS.md)
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)
- [`docs/SECURITY.md`](./docs/SECURITY.md)
- [`docs/FAQ.md`](./docs/FAQ.md)
- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md)
- [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md)

---

## Development

Requirements:
- Node.js 20 (see [`.nvmrc`](./.nvmrc))

Conventions:
- Lint: `npm run lint` (`.eslintrc.json`)
- Format: Prettier (`.prettierrc`)
- Editor settings: `.editorconfig`

Scripts:
```json
{
  "start": "node server.js",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "test": "node --test",
  "coverage": "nyc npm test"
}
```

---

## Testing & Coverage

- Test runner: Node’s built-in test runner (`node --test`)
- Coverage via `nyc` (Istanbul). Config: [`.nycrc.json`](./.nycrc.json)

CI runs:
- Lint
- Tests on Node 18/20/22
- Coverage upload (Codecov) — add `CODECOV_TOKEN` to repo secrets to enable badge

---

## Contributing

See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md).

## Security

See [`docs/SECURITY.md`](./docs/SECURITY.md).

## License

MIT — see [`LICENSE`](./LICENSE).

## Project Status

Maintained as a compact, production-adjacent demo suitable for code/doc reviews.
