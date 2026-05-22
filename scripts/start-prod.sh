#!/bin/bash
set -e

echo "==> Starting API server on port 8080..."
PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs &

echo "==> Starting Hannah Brooks (fan app + admin) on port 5000..."
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/hannah-brooks run serve &

echo "==> Starting AI Persona Studio on port 3000..."
PORT=3000 pnpm --filter @workspace/ai-persona run preview &

wait
