#!/bin/bash
set -e

pnpm --filter backend migrate

pnpm --filter backend start &
BACKEND_PID=$!

pnpm --filter frontend start &
FRONTEND_PID=$!

trap 'kill -TERM $BACKEND_PID $FRONTEND_PID 2>/dev/null' TERM INT

wait -n "$BACKEND_PID" "$FRONTEND_PID"
EXIT_CODE=$?

kill -TERM $BACKEND_PID $FRONTEND_PID 2>/dev/null
wait
exit $EXIT_CODE