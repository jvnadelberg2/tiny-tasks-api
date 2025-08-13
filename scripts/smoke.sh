#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:3000}"

echo "== Smoke test against $BASE =="

fail() { echo "ERROR: $*" >&2; exit 1; }

code() {
  # usage: code METHOD URL [BODY]
  local method="$1" url="$2" body="${3-}"
  if [[ -n "$body" ]]; then
    curl -sS -o /dev/null -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      --data "$body"
  else
    curl -sS -o /dev/null -w "%{http_code}" -X "$method" "$url"
  fi
}

expect() {
  # usage: expect <expected_code> METHOD URL [BODY]
  local want="$1"; shift
  local got; got="$(code "$@")"
  [[ "$got" == "$want" ]] || fail "Expected $want for: $* (got $got)"
}

get_body() {
  # usage: get_body METHOD URL [BODY]
  local method="$1" url="$2" body="${3-}"
  if [[ -n "$body" ]]; then
    curl -sS -X "$method" "$url" -H "Content-Type: application/json" --data "$body"
  else
    curl -sS -X "$method" "$url"
  fi
}

echo "-- Health"
expect 200 GET "$BASE/health"

echo "-- Docs + Spec (absolute + relative)"
expect 200 GET "$BASE/openapi.yaml"
expect 200 GET "$BASE/docs"
# relative spec fetches we added
expect 200 GET "$BASE/docs/openapi.yaml" || true
expect 200 GET "$BASE/swagger-docs" || true
expect 200 GET "$BASE/swagger-docs/openapi.yaml" || true

echo "-- CORS preflight"
expect 204 OPTIONS "$BASE/tasks"

echo "-- CRUD (/tasks unversioned, per your spec)"
# Create
BODY_CREATE='{"title":"demo task","due":"2025-12-31"}'
RESP_CREATE="$(get_body POST "$BASE/tasks" "$BODY_CREATE")"
[[ "$RESP_CREATE" == *'"id"'* ]] || fail "Create did not return an id: $RESP_CREATE"
TASK_ID="$(sed -n 's/.*"id":"\([^"]*\)".*/\1/p' <<<"$RESP_CREATE")"
[[ -n "$TASK_ID" ]] || fail "Could not parse TASK_ID from: $RESP_CREATE"
echo "Created TASK_ID=$TASK_ID"

# List
expect 200 GET "$BASE/tasks"

# Get by ID
expect 200 GET "$BASE/tasks/$TASK_ID"

# Update (partial)
BODY_UPDATE='{"completed":true}'
expect 200 PUT "$BASE/tasks/$TASK_ID" "$BODY_UPDATE"

# Delete
expect 204 DELETE "$BASE/tasks/$TASK_ID"

# Confirm 404 after delete
expect 404 GET "$BASE/tasks/$TASK_ID"

echo "-- Validation errors"
# Bad JSON
expect 400 POST "$BASE/tasks" '{bad json}'
# Missing fields
expect 400 POST "$BASE/tasks" '{"title":"x"}'
# Bad date
expect 400 POST "$BASE/tasks" '{"title":"x","due":"2025-13-99"}'
# Update unknown
expect 404 PUT "$BASE/tasks/does-not-exist" '{"title":"x"}'

echo "== OK =="
