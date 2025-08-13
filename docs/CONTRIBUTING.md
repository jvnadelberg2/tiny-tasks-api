# Contributing

## Prerequisites

    Node.js 20.x
    npm 10+

## Getting started

    npm ci
    npm start

## Branch and PR workflow

    create a feature branch from main
    commit small, focused changes
    push the branch and open a pull request
    ensure CI checks are green before merge

## Coding conventions

    use Node.js core modules only (no new runtime dependencies)
    keep functions small and readable
    return JSON errors in the form: { "error": "message" }
    keep behavior consistent with docs/API.md and openapi.yaml

## Lint and format

    npm run lint
    npm run lint:fix
    configuration:
        .eslintrc.json
        .prettierrc
        .editorconfig

## Tests and coverage

    run tests:
        npm test
    coverage:
        npm run coverage
        open coverage/index.html

## OpenAPI and docs

    edit openapi.yaml for API changes
    open openapi.html in a browser to view the spec
    keep docs/API.md in sync with the spec

## Commit messages

    short imperative subject (e.g., "add PUT validation")
    body explains the why when needed
    reference issues or PRs when useful

## Release and changelog

    update docs/CHANGELOG.md with notable changes
    bump version in package.json only if publishing to npm (not required for this demo)

## Local checks before PR

    npm ci
    npm run lint
    npm test
    npm run coverage
