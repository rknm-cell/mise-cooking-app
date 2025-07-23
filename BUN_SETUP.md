# Bun Setup Guide for Mise Cooking

## Overview

This project now uses **Bun** as the package manager for both frontend and backend, providing faster installation and better performance.

## What Changed

### Frontend (Root Directory)
- ✅ Updated `package.json` scripts to use `bunx` for Expo commands
- ✅ Added Bun engine requirement
- ✅ Removed `package-lock.json` (Bun uses `bun.lockb`)

### Backend (Backend Directory)
- ✅ Already configured for Bun
- ✅ Uses `bun.lockb` for dependency locking
- ✅ Removed problematic `postinstall` script

## Installation Commands

### First Time Setup
```bash
# Install Bun globally (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install frontend dependencies
bun install

# Install backend dependencies
cd backend
bun install
cd ..
```

### Development Commands

#### Frontend (React Native/Expo)
```bash
# Start development server
bun start

# Run on specific platforms
bun run android
bun run ios
bun run web

# Lint code
bun run lint

# Build for production
bun run build
```

#### Backend (Express.js)
```bash
# Start development server
cd backend
bun run dev

# Start production server
bun start

# Run database migrations
bun run db:migrate

# Generate database schema
bun run db:generate

# Open database studio
bun run db:studio
```

## Benefits of Using Bun

1. **Faster Installation**: Bun installs dependencies significantly faster than npm
2. **Better Lock File**: `bun.lockb` is more reliable than `package-lock.json`
3. **Consistent Tooling**: Same package manager across frontend and backend
4. **Built-in TypeScript**: No need for separate TypeScript compilation
5. **Better Performance**: Faster startup times and better memory usage

## Troubleshooting

### Issue: Infinite Loop During Installation
**Cause**: Circular dependency in package.json scripts
**Solution**: Remove any `"install": "bun install"` scripts

### Issue: Database Migration Fails During Install
**Cause**: Postinstall script tries to run migrations without database
**Solution**: Run migrations manually after setting up database connection

### Issue: Expo Commands Not Found
**Cause**: Expo CLI not installed globally
**Solution**: Use `bunx expo` instead of `expo` directly

## Railway Deployment

The Railway deployment is configured to use Bun:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "bun install"
  },
  "deploy": {
    "startCommand": "./start.sh"
  }
}
```

## Environment Variables

Make sure these are set in Railway:

```bash
DATABASE_URL=your-postgresql-connection-string
OPENAI_API_KEY=sk-your-openai-key
BETTER_AUTH_SECRET=your-generated-secret
API_KEY=your-generated-api-key
NODE_ENV=production
```

## Migration from npm/yarn

If you were previously using npm or yarn:

1. **Remove old lock files**:
   ```bash
   rm package-lock.json
   rm yarn.lock
   rm backend/package-lock.json
   ```

2. **Install with Bun**:
   ```bash
   bun install
   cd backend && bun install
   ```

3. **Update scripts** to use `bunx` for global tools

## File Structure

```
mise-cooking/
├── package.json          # Frontend dependencies (Bun)
├── bun.lockb            # Frontend lock file (Bun)
├── backend/
│   ├── package.json     # Backend dependencies (Bun)
│   ├── bun.lockb        # Backend lock file (Bun)
│   └── start.sh         # Railway start script
└── BUN_SETUP.md         # This guide
```

## Best Practices

1. **Always use `bunx`** for global tools (expo, drizzle-kit, etc.)
2. **Use `bun run`** for local scripts
3. **Commit `bun.lockb`** files to version control
4. **Run migrations manually** after database setup
5. **Use Bun's built-in TypeScript** support

## Commands Reference

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun add <package>` | Add new dependency |
| `bun remove <package>` | Remove dependency |
| `bun run <script>` | Run package.json script |
| `bunx <command>` | Run global tool |
| `bun --version` | Check Bun version |

## Support

If you encounter issues:

1. Check Bun version: `bun --version`
2. Clear cache: `bun pm cache rm`
3. Reinstall: `rm -rf node_modules && bun install`
4. Check Railway logs for deployment issues 