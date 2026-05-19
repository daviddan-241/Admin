#!/bin/bash
set -e

echo "==> Installing dependencies..."
pnpm install

echo "==> Pushing DB schema..."
pnpm --filter @workspace/db run push || echo "DB push skipped"

echo "==> Setup complete. All three apps ready to start."
