# Architecture

## Overview

    Tiny Tasks API is a small HTTP service implemented with Node.js core modules only.
    It provides CRUD operations for a simple Task resource and a health endpoint.
    Data is stored in-memory and resets when the process restarts.

## Components

    HTTP layer
        node:http createServer is used to accept connections and handle requests
        a single request handler inspects URL and method to dispatch to routes

    Routing
        GET  /health            service liveness
        GET  /tasks             list tasks
        POST /tasks             create task
        GET  /tasks/{id}        get task by id
        PUT  /tasks/{id}        update task by id
        DELETE /tasks/{id}      delete task by id

    Storage
        in-memory Map keyed by task id
        task shape: id (string), title (string), due (YYYY-MM-DD), completed (boolean)

    Validation
        JSON request bodies are parsed manually
        basic checks ensure title is present and due is a valid YYYY-MM-DD date
        update accepts partial fields; due can be cleared with null or empty string

    Error model
        all errors return a JSON object with an "error" string
        common responses: 400 Invalid request body, 404 Task not found, 405 Method not allowed

    Graceful shutdown
        the process handles SIGINT and SIGTERM and closes the HTTP server before exit

## Identifier generation

    ids are timestamp-based strings created at task creation time

## OpenAPI specification

    openapi.yaml at repo root documents the API surface
    static HTML (openapi.html) renders the spec for browsing
    if the server exposes docs routes, /docs serves openapi.html and /openapi.yaml serves the spec

## Data model

    Task
        id          string
        title       string
        due         string (YYYY-MM-DD)
        completed   boolean

## Decisions and trade-offs

    Node core only
        avoids external framework dependencies, keeps the code small and portable
        trades off convenience middleware and plugins

    In-memory storage
        simple and deterministic for demos and tests
        not durable, not concurrent-safe across processes

    No authentication
        reduces complexity for a minimal example
        not suitable for production use

## Non-goals

    high availability or clustering
    persistent database integration
    role-based access control

## Future improvements

    pluggable storage backend (e.g., JSON file, SQLite, Postgres)
    input validation via JSON Schema
    pagination and filtering on GET /tasks
    structured request logging and basic metrics
