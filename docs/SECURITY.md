# Security

## Scope

    This project is a minimal demonstration API. It is not intended for production use.

## Threat model (non-production)

    No authentication or authorization
    In-memory data only; no persistence
    HTTP only; no TLS termination
    No rate limiting, input throttling, or abuse protection

## Data handling

    No PII is collected by default
    All data is stored in process memory and lost on restart
    Logs are written to stdout only

## Dependencies

    Node.js core modules only (no third-party runtime deps)
    Keep Node.js updated to receive security fixes

## Network

    Listens on a configurable port (default 3000)
    Intended for localhost development
    If exposed to a network, place behind a trusted reverse proxy and add authentication

## Vulnerability reporting

    If you discover a vulnerability, please open a private report rather than a public issue.
    Provide reproduction steps and environment details.

## Hardening suggestions (if you adapt for real use)

    Add authentication and authorization
    Validate all inputs with a strict schema
    Add rate limiting and request logging
    Serve over HTTPS
    Replace in-memory storage with a durable datastore
    Run behind a reverse proxy and restrict exposure with a firewall
