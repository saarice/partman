#!/bin/sh
set -e

echo "🚀 Starting API server..."

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate

# Seed development data if in development mode
if [ "$NODE_ENV" = "development" ]; then
  echo "🌱 Seeding development data..."
  npm run seed:dev || echo "⚠️  Seed already exists or failed (continuing anyway)"
fi

# Start the server
echo "🎯 Starting server..."
npm run dev
