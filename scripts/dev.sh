#!/bin/bash

echo "🚀 Starting Partnership Management Platform Development Environment"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building shared packages..."
npm run build --workspace=packages/shared

echo "🐳 Starting Docker services..."
cd infrastructure/docker
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🗄️  Running database migrations..."
cd ../../apps/api
# Copy migration to docker container
docker cp src/migrations/001_initial_schema.sql $(docker-compose -f ../../infrastructure/docker/docker-compose.yml ps -q postgres):/docker-entrypoint-initdb.d/
docker exec $(docker-compose -f ../../infrastructure/docker/docker-compose.yml ps -q postgres) psql -U partner_user -d partnership_mgmt -f /docker-entrypoint-initdb.d/001_initial_schema.sql

echo "🌟 Starting development servers..."
cd ../..

# Start backend and frontend concurrently
npm run dev

echo ""
echo "✅ Development environment started!"
echo ""
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:3001"
echo "🔗 Health Check: http://localhost:3001/health"
echo ""
echo "📧 Demo Login: vp@partman.com / password"