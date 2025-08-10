# Tiny Tasks API

[![CI](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml/badge.svg)](https://github.com/jvnadelberg2/tiny-tasks-api/actions/workflows/ci.yml)

A tiny, dependency-free REST API built with **Node.js core modules only**.  
Designed to showcase **clean project hygiene**, and **working tests** in a small, interview-ready repo.

**Quick links:**  
[API Reference](docs/API.md) • [OpenAPI (YAML)](openapi.yaml) • [Pretty API Docs (Redoc)](docs/site/openapi.html) • [Architecture](docs/ARCHITECTURE.md) • [CI Status](https://github.com/jvnadelberg2/tiny-tasks-api/actions)

---

## Features
- Minimal **task** API: `GET/POST /tasks`, `GET/DELETE /tasks/{id}`, `GET /health`
- **No external deps** (pure Node `http`)
- **OpenAPI 3.0** spec + **Redoc** HTML viewer
- **Tests** via Node’s built-in `node:test`
- **Docs** for API, architecture, ops, security, troubleshooting
- **GitHub hygiene**: CI, CODEOWNERS, PR/issue templates

## Run locally
```bash
npm start
# -> Tiny Tasks API listening on http://localhost:3000
