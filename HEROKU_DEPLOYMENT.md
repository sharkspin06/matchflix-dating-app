# Heroku Deployment Guide for Matchflix

## Prerequisites
- Heroku account (sign up at https://heroku.com)
- Heroku CLI installed
- Git repository

## Step 1: Deploy Backend to Heroku

### 1.1 Login to Heroku
```bash
heroku login
```

### 1.2 Create Heroku App for Backend
```bash
cd backend
heroku create matchflix-backend
```

### 1.3 Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:essential-0
```

### 1.4 Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-cloudinary-api-key
heroku config:set CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 1.5 Deploy Backend
```bash
# From the root directory
git subtree push --prefix backend heroku main

# Or if you're in the backend directory
git push heroku main
```

### 1.6 Run Database Migrations
```bash
heroku run npx prisma migrate deploy
```

### 1.7 Get Backend URL
```bash
heroku info
# Note the "Web URL" - this is your backend URL
```

## Step 2: Deploy Frontend to Vercel (Recommended) or Heroku

### Option A: Vercel (Recommended for Next.js)

1. Go to https://vercel.com
2. Import your GitLab repository
3. Set Root Directory to `frontend`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://matchflix-backend.herokuapp.com
   NEXT_PUBLIC_SOCKET_URL=https://matchflix-backend.herokuapp.com
   ```
5. Deploy

### Option B: Heroku (Alternative)

```bash
cd frontend
heroku create matchflix-frontend

# Add buildpack for Next.js
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NEXT_PUBLIC_API_URL=https://matchflix-backend.herokuapp.com
heroku config:set NEXT_PUBLIC_SOCKET_URL=https://matchflix-backend.herokuapp.com

# Deploy
git subtree push --prefix frontend heroku main
```

## Step 3: Update Backend CORS Settings

Update your backend to allow requests from your frontend URL:

```typescript
// backend/src/index.ts
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://matchflix-frontend.herokuapp.com',  // If using Heroku
    'https://your-vercel-app.vercel.app'         // If using Vercel
  ],
  credentials: true
};
```

Then redeploy the backend.

## Important Notes

### Database URL
Heroku automatically sets the `DATABASE_URL` environment variable when you add PostgreSQL. Prisma will use this automatically.

### File Uploads
Make sure Cloudinary is properly configured as Heroku's filesystem is ephemeral (files uploaded directly to Heroku will be lost).

### WebSocket Support
Heroku supports WebSockets, but you may need to configure Socket.IO for production:

```typescript
// backend/src/index.ts
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
});
```

## Useful Heroku Commands

```bash
# View logs
heroku logs --tail

# Run commands
heroku run bash

# Restart app
heroku restart

# View config
heroku config

# Scale dynos
heroku ps:scale web=1
```

## Troubleshooting

### Build Fails
- Check `heroku logs --tail` for errors
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Verify Node version compatibility

### Database Connection Issues
- Run `heroku config` to verify DATABASE_URL is set
- Check Prisma schema matches your database

### CORS Errors
- Verify frontend URL is in CORS whitelist
- Check environment variables are set correctly

## Cost Optimization

- **Eco Dynos**: $5/month (sleeps after 30 min of inactivity)
- **Essential PostgreSQL**: $5/month
- **Total**: ~$10/month for both backend and database

For production, consider upgrading to Basic or Standard dynos for better performance.
