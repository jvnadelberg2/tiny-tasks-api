# Operations

## Run

    npm start
    default port 3000

    PORT=8080 npm start
    custom port

## Stop

    Ctrl-C to stop the server
    process handles SIGINT and SIGTERM and closes the HTTP server before exit

## Docs

    GET /docs            serves openapi.html
    GET /openapi.html    static Redoc page
    GET /openapi.yaml    OpenAPI 3.0 spec

## Health check

    GET /health    200 OK
    expected body:
        { "status": "ok" }

## Endpoints summary

    GET /health
    GET /tasks
    POST /tasks
    GET /tasks/{id}
    PUT /tasks/{id}
    DELETE /tasks/{id}

    see docs/API.md and openapi.yaml for details

## Configuration

    PORT  http port (default 3000)
    no other environment variables required

## Logging

    logs are written to stdout
    startup line shows bound address and port
    request and response logging is not enabled

## Data persistence

    in-memory only
    all data is lost when the server restarts

## See also

    docs/TROUBLESHOOTING.md for common issues and fixes
