# Contributing

## Workflow
1. Branch from `main`.
2. Write code + tests (`npm test`).
3. Update docs if behavior changes (`docs/*`, `README.md`, `openapi.yaml`).
4. Push and open a Pull Request.

## Coding & Tests
- Keep it dependency-free (Node core only).
- Add/adjust tests in `test/` for any change to routes or behavior.
- Run `npm test` locally before pushing.

## OpenAPI & Docs
- If you change an endpoint, update `openapi.yaml` and `docs/API.md`.
- If you add routes or architecture changes, update `docs/ARCHITECTURE.md`.

## Commit Style
- Use clear, concise messages (Conventional Commits optional).
  - Examples: `feat: add delete by id`, `fix: 400 on empty title`, `docs: update API reference`.

## PR Checklist
- [ ] Tests pass (`npm test`)
- [ ] Manually verified endpoints (health, create/list tasks)
- [ ] Docs updated (`doc
