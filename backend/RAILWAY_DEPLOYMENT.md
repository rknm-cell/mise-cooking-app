# Railway Deployment Guide for Mise Cooking Backend

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **PostgreSQL Database**: Set up on Railway or use external provider
3. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com)
4. **GitHub Repository**: Your code should be in a GitHub repo

## Step-by-Step Deployment

### 1. Connect Your Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose the `backend` directory as the source

### 2. Set Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```bash
# Required Environment Variables
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key-here
BETTER_AUTH_SECRET=your-super-secret-better-auth-key-here
API_KEY=your-super-secret-api-key-here
NODE_ENV=production

# Optional (Railway sets these automatically)
PORT=8080
```

### 3. Generate Secure Keys

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Generate API_KEY
openssl rand -base64 32
```

### 4. Database Setup

1. **Option A: Railway PostgreSQL**
   - Add PostgreSQL service in Railway
   - Copy the connection string to `DATABASE_URL`

2. **Option B: External PostgreSQL**
   - Use Supabase, Neon, or other provider
   - Copy connection string to `DATABASE_URL`

### 5. Deploy

1. Railway will automatically detect the `railway.json` configuration
2. The build process will:
   - Install dependencies with `bun install`
   - Run database migrations
   - Start the server with `./start.sh`

## Troubleshooting Common Issues

### Issue 1: "Build Failed"

**Symptoms**: Build process fails during `bun install`

**Solutions**:
- Check Railway logs for specific error messages
- Ensure `package.json` has correct dependencies
- Verify Bun is supported in your Railway region

### Issue 2: "Health Check Failed"

**Symptoms**: Railway shows unhealthy status

**Solutions**:
- Check if `/api/health` endpoint is accessible
- Verify server is listening on correct port
- Check environment variables are set correctly

### Issue 3: "Database Connection Failed"

**Symptoms**: API returns database errors

**Solutions**:
- Verify `DATABASE_URL` is correct
- Check database is accessible from Railway
- Run migrations manually if needed

### Issue 4: "CORS Errors"

**Symptoms**: Frontend can't connect to API

**Solutions**:
- Update CORS origins in `server.ts`
- Add your frontend URL to allowed origins
- Check if credentials are being sent correctly

### Issue 5: "Environment Variables Missing"

**Symptoms**: API returns "not configured" errors

**Solutions**:
- Double-check all required environment variables are set
- Verify variable names match exactly
- Restart deployment after adding variables

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app-name.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Mise Cooking API is running",
  "database": "Configured",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Recipe Generation
```bash
curl -X POST https://your-app-name.railway.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Make a simple pasta dish"}'
```

### 3. Test Database Connection
```bash
curl https://your-app-name.railway.app/api/recipes
```

## Updating Your Frontend

After successful deployment, update your frontend API configuration:

```typescript
// In your frontend config
const API_BASE_URL = 'https://your-app-name.railway.app';
```

## Monitoring

### Railway Dashboard
- Check deployment logs
- Monitor resource usage
- View environment variables

### Application Logs
- Use Railway's log viewer
- Check for error messages
- Monitor API response times

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "DATABASE_URL not configured" | Missing environment variable | Set DATABASE_URL in Railway |
| "CORS error" | Frontend URL not allowed | Add frontend URL to CORS origins |
| "Health check failed" | Server not starting | Check logs and environment variables |
| "Build failed" | Dependency issues | Check package.json and Railway logs |

## Support

If you're still having issues:

1. Check Railway logs for specific error messages
2. Verify all environment variables are set correctly
3. Test locally with the same environment variables
4. Check Railway documentation for platform-specific issues 