# Changelog

## Unreleased

    No changes logged.

## 1.0.0

    Added
        HTTP API
            GET /health
            GET /tasks
            POST /tasks
            GET /tasks/{id}
            PUT /tasks/{id}
            DELETE /tasks/{id}

        Documentation
            openapi.yaml (OpenAPI 3.0 spec)
            openapi.html (static Redoc page)
            docs/API.md
            docs/OPERATIONS.md
            docs/ARCHITECTURE.md
            docs/SECURITY.md
            docs/CONTRIBUTING.md
            docs/FAQ.md
            docs/TROUBLESHOOTING.md

        Examples
            examples/curl-quickstart.sh

        Tests and coverage
            node --test suite in tests/
            nyc coverage configuration (.nycrc.json)

        CI
            .github/workflows/ci.yml
            .github/workflows/openapi-lint.yml
