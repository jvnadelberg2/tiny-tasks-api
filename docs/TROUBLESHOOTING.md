# Troubleshooting

## Server does not start

    Symptom
        npm start prints no output or exits immediately

    Causes
        Port already in use
        Node version mismatch

    Fix
        change the port:
            PORT=8081 npm start
        ensure Node 20.x:
            node -v
            nvm use 20

## Health check fails

    Symptom
        GET /health returns non-200 or connection refused

    Causes
        Server not running
        Wrong port

    Fix
        start the server:
            npm start
        verify port:
            echo $PORT  (defaults to 3000)
            curl http://localhost:3000/health

## Invalid JSON errors

    Symptom
        400 with { "error": "Invalid request body" }

    Causes
        Request body is not valid JSON
        Missing required fields for create/update

    Fix
        send valid JSON with the required fields (see docs/API.md):
            curl -H "Content-Type: application/json" \
                 -d '{ "title": "demo task", "due": "2025-12-31" }' \
                 http://localhost:3000/tasks

## 404 Not Found for task endpoints

    Symptom
        GET /tasks/{id} returns 404

    Causes
        Task ID does not exist
        Task was deleted or server restarted (in-memory data)

    Fix
        create a task and use the returned id:
            curl -s -H "Content-Type: application/json" \
                 -d '{ "title": "t", "due": "2025-12-31" }' \
                 http://localhost:3000/tasks

## Method not allowed

    Symptom
        Response includes { "error": "Method not allowed" }

    Causes
        Unsupported HTTP method for the path

    Fix
        use one of the supported methods (see docs/API.md)

## Docs not available at /docs

    Symptom
        404 at /docs or /openapi.html

    Causes
        Server file did not include docs routes
        openapi.html or openapi.yaml missing from repo root

    Fix
        ensure server exposes routes:
            GET /docs           serves openapi.html
            GET /openapi.html  static Redoc page
            GET /openapi.yaml  OpenAPI spec
        confirm files exist at repo root:
            openapi.html
            openapi.yaml

## Tests fail

    Symptom
        npm test shows failures

    Causes
        Server code diverged from tests
        Node version mismatch

    Fix
        run tests locally and check failing assertions:
            npm test
        ensure Node 20.x:
            node -v
            nvm use 20

## OpenAPI lint or CI failures

    Symptom
        openapi-lint or CI workflow fails in GitHub Actions

    Causes
        YAML syntax errors in openapi.yaml
        Missing repository secrets (e.g., CODECOV_TOKEN) for coverage upload

    Fix
        validate YAML locally:
            yq e . openapi.yaml > /dev/null
        add required repository secrets in GitHub if using Codecov
