#!/bin/sh
set -e

pnpm --filter backend migrate
exec pnpm --filter backend start
