#!/bin/bash

# Railway start script for Mise Cooking backend

echo "🚀 Starting Mise Cooking API server..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY is not set"
    exit 1
fi

if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo "❌ BETTER_AUTH_SECRET is not set"
    exit 1
fi

echo "✅ Environment variables are configured"

# Run database migrations
echo "🗄️ Running database migrations..."
bun run db:migrate

# Start the server
echo "🌐 Starting server on port $PORT..."
bun run server.ts 