# Security

This is a demo service. It intentionally omits production controls.

## Risks in this demo
- No authentication or authorization
- No rate limiting or IP throttling
- No input schema validation beyond minimal checks
- No TLS (assumes localhost)
- No request size limits
- In-memory data (lost on restart; per-process state)
- Very simple error handling/logging

## If exposing publicly, add:
- **Auth**: token-based (Bearer/JWT) or OAuth2; protect write endpoints
- **Rate limiting**: per-IP and per-token; consider a WAF/CDN in front
- **Validation**: JSON schema validation for all inputs; reject unknown fields
- **TLS**: terminate HTTPS at a proxy/load balancer
- **Limits**: cap request body size and concurrency
- **CORS**: restrict origins and headers
- **Headers**: security headers (CSP, X-Conte
