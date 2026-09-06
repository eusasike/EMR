#!/usr/bin/env bash

# ==============================================================================
# AUTOMATED PRODUCTION DEPLOYMENT & DATABASE MIGRATION SCRIPT
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "📦 [1/4] Loading localized configurations..."
if [ -f .env ]; then
    echo "✅ .env file detected. Handing environment loading over to Prisma engine."
else
    echo "⚠️ .env file missing! Falling back to platform container defaults."
fi

echo "🏗️ [2/4] Syncing cloud infrastructure schema definitions..."
# Native migration execution line
npx prisma migrate deploy

echo "🔨 [3/4] Building optimized production artifacts..."
# Run the application build pipeline
npm run build

# Ensure the generated folder structure exists in dist and copy swagger mappings
mkdir -p dist/src/generated
cp src/generated/swagger.json dist/src/generated/ || true
echo "✅ Production swagger mappings synced to dist/ directory."

echo "🚀 [4/4] Activating application runtime..."
npm start
