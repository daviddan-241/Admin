#!/bin/bash
set -e

echo "==> Building API server..."
pnpm --filter @workspace/api-server run build

echo "==> Building Hannah Brooks fan app + admin..."
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/hannah-brooks run build

echo "==> Building AI Persona Studio..."
PORT=3000 pnpm --filter @workspace/ai-persona run build

echo "==> Build complete!"
