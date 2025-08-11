#!/usr/bin/env bash
# examples/curl-quickstart.sh
# Quick demo sequence for Tiny Tasks API

API="http://localhost:3000"

echo "Health check:"
curl -s "$API/health" | jq

echo -e "\nCreating a task..."
TASK_ID=$(curl -s -X POST "$API/v1/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"demo task","due":"2025-12-31"}' | jq -r '.id')

echo "Created task with ID: $TASK_ID"

echo -e "\nListing tasks:"
curl -s "$API/v1/tasks" | jq

echo -e "\nGetting task by ID:"
curl -s "$API/v1/tasks/$TASK_ID" | jq

echo -e "\nUpdating task:"
curl -s -X PUT "$API/v1/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"updated","completed":true}' | jq

echo -e "\nDeleting task:"
curl -s -X DELETE "$API/v1/tasks/$TASK_ID" -i
