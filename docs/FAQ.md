# FAQ

## What is this project?

    A minimal REST API implemented with Node.js core modules only (no Express).
    Endpoints provide CRUD for a simple Task resource plus a health check.

## How do I run it?

    npm ci
    npm start
    # default port is 3000; use PORT to change it
    PORT=8080 npm start

## What Node.js version is required?

    Node 20.x (see .nvmrc and package.json engines)

## Where are the API docs?

    Open the spec in a browser:
        openapi.html

    Or view the raw spec:
        openapi.yaml

    If the server exposes docs routes:
        GET /docs            serves openapi.html
        GET /openapi.html    static Redoc page
        GET /openapi.yaml    OpenAPI 3.0 spec

## How do I test the API quickly?

    Use the example script:
        ./examples/curl-quickstart.sh

    Or manual sequence:
        curl http://localhost:3000/health
        curl -H "Content-Type: application/json" -d '{ "title": "demo", "due": "2025-12-31" }' http://localhost:3000/tasks

## Why do I get 400 Invalid request body?

    The request body must be valid JSON and include required fields.
    Create requires: title (string) and due (YYYY-MM-DD).
    Update accepts partial fields; invalid JSON or bad dates return 400.

## How do I unset a task's due date?

    Send null or an empty string for due in an update:
        { "due": null }
        { "due": "" }

## Where is data stored?

    In-memory. Restarting the process clears all data.

## Is there authentication?

    No. This is a demo service and does not implement auth.

## How do I run tests and coverage?

    npm test
    npm run coverage
    # open coverage/index.html for the report
