#!/bin/bash
# Hannah Brooks Creator Platform — First-Run Setup
# Run this once after cloning the repo to install dependencies and set up the database.
set -e

echo ""
echo "========================================"
echo " Hannah Brooks Creator Platform Setup"
echo "========================================"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Please install Node.js 20+."
  exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "==> Installing pnpm..."
  npm install -g pnpm@9
fi

echo "==> Installing all workspace dependencies..."
pnpm install

echo "==> Pushing database schema..."
pnpm --filter @workspace/db run push || echo "DB push skipped — set DATABASE_URL to enable."

echo ""
echo "========================================"
echo " Setup complete! Start the platform:"
echo ""
echo "   API Server:        PORT=8080 pnpm --filter @workspace/api-server run dev"
echo "   Fan App:           PORT=5000 BASE_PATH=/ pnpm --filter @workspace/hannah-brooks run dev"
echo "   AI Persona Studio: PORT=8082 pnpm --filter @workspace/ai-persona run dev"
echo ""
echo " On Replit: click Run — all three start automatically."
echo "========================================"
echo ""
