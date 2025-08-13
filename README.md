# Tiny Tasks API

[![CI](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml)
[![OpenAPI Lint](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/openapi-lint.yml/badge.svg?branch=main)](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/openapi-lint.yml)
[![Coverage](https://codecov.io/gh/jvnadelberg2/tiny-tasks-api/branch/main/graph/badge.svg)](https://app.codecov.io/gh/jvnadelberg2/tiny-tasks-api)
![Node](https://img.shields.io/badge/node-20.x-brightgreen?logo=node.js)
[![License](https://img.shields.io/github/license/jvnadelberg2/tiny-tasks-api)](LICENSE)

Minimal, dependency-light Node.js REST API for managing tiny tasks, with OpenAPI-powered docs and a clean repo structure.

---

## About

A small demonstration API showing:
- Pure Node.js HTTP server (no external frameworks)
- Simple in-memory task storage
- CRUD endpoints for `/tasks`
- OpenAPI 3.0.3 specification (`openapi.yaml`) and HTML rendering

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
