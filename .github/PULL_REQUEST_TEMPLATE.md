## Summary
Explain **what** changed and **why**.

## Changes
- Bullet the key code/doc changes
- Mention any refactors or cleanup

## Testing
- [ ] Unit tests pass locally (`npm test`)
- [ ] Manually verified endpoints:
  - [ ] `GET /health`
  - [ ] `POST /tasks` (valid/invalid title)
  - [ ] `GET /tasks`
  - [ ] `GET /tasks/{id}`
  - [ ] `DELETE /tasks/{id}`

## Docs
- [ ] Updated `docs/API.md` (if endpoints changed)
- [ ] Updated `openapi.yaml` (if schema/paths changed)
- [ ] Updated `README.md`/`docs/ARCHITECTURE.md` as needed

## Breaking Changes
- [ ] None
- If yes, describe impact and migration steps.

## Checklist
- [ ] Clear commit message(s)
- [ ] Backward compatible (or documented in **Breaking Changes**)
- [ ] Added/updated tests for new behavior
- [ ] Updated `docs/CHANGELOG.md`

## Linked Issues
Closes #____
