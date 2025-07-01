#!/bin/bash

# Setup script for backend environment variables

echo "🔧 Setting up backend environment variables..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Authentication
API_KEY=your-super-secret-api-key-here

# Database
DATABASE_URL=your-supabase-connection-string-here

# Better Auth
BETTER_AUTH_SECRET=your-super-secret-better-auth-key-here
BETTER_AUTH_URL=http://localhost:8080

# OpenAI (for recipe generation)
OPENAI_API_KEY=your-openai-api-key-here

# Environment
NODE_ENV=development
EOF
    echo "✅ .env file created!"
    echo "⚠️  Please update the values in .env with your actual credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update API_KEY in .env with a secure random string"
echo "2. Update DATABASE_URL with your Supabase connection string"
echo "3. Update BETTER_AUTH_SECRET with a secure random string"
echo "4. Update OPENAI_API_KEY with your OpenAI API key"
echo "5. Update constants/Config.ts to match your API_KEY"
echo ""
echo "🔑 To generate a secure API key, run:"
echo "   openssl rand -base64 32" 