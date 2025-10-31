# MatchFlix Deployment Guide

This guide will help you deploy MatchFlix to production using Vercel (frontend) and Heroku (backend).

## Prerequisites

- Git repository set up
- Heroku CLI installed
- Vercel account
- Cloudinary account (for image uploads)
- PostgreSQL database (Heroku provides this)

## Backend Deployment (Heroku)

### 1. Create Heroku App

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Add PostgreSQL database
heroku addons:create heroku-postgresql:mini
```

### 2. Set Environment Variables

```bash
# Set all required environment variables
heroku config:set JWT_SECRET="your-super-secret-jwt-key-change-in-production"
heroku config:set NODE_ENV=production
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
heroku config:set CLOUDINARY_API_KEY="your-cloudinary-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
heroku config:set FRONTEND_URL="https://matchflix-dating-up-frontend-qivq.vercel.app"
```

### 3. Deploy to Heroku

```bash
# Commit your changes
git add .
git commit -m "Prepare for Heroku deployment"

# Push to Heroku
git push heroku main

# Or if you're on a different branch:
git push heroku your-branch:main
```

### 4. Verify Deployment

```bash
# Check logs
heroku logs --tail

# Open your app
heroku open
```

Your backend should now be running at: `https://your-app-name.herokuapp.com`

## Frontend Deployment (Vercel)

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Select the `frontend` directory as the root

### 2. Configure Environment Variables

In Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add the following variables:

```
NEXT_PUBLIC_API_URL=https://your-app-name.herokuapp.com
NEXT_PUBLIC_SOCKET_URL=https://your-app-name.herokuapp.com
```

### 3. Deploy

1. Click **Deploy** in Vercel dashboard
2. Wait for the build to complete
3. Your app will be live at: `https://your-project.vercel.app`

### 4. Update Backend CORS

After deployment, update your Heroku backend to allow your Vercel URL:

```bash
heroku config:set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

Or add it directly in `backend/src/index.ts` in the `allowedOrigins` array.

## Environment Variables Summary

### Backend (Heroku)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Heroku |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | Auto-set by Heroku |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` |
| `FRONTEND_URL` | Allowed frontend URLs (CORS) | `https://your-app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-app.herokuapp.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.IO URL | `https://your-app.herokuapp.com` |

## Local Development

For local development, create `.env` files:

### Backend `.env`

```env
DATABASE_URL="postgresql://username:password@localhost:5432/matchflix"
JWT_SECRET="your-local-secret"
PORT=5001
NODE_ENV=development
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
FRONTEND_URL="http://localhost:3000"
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

## Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `FRONTEND_URL` is set correctly in Heroku
2. Verify the URL matches exactly (no trailing slashes)
3. Check `backend/src/index.ts` allowedOrigins array

### Connection Refused

If frontend can't connect to backend:
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Check Heroku app is running: `heroku ps`
3. Check Heroku logs: `heroku logs --tail`

### Database Issues

If you see database errors:
1. Run migrations: `heroku run npx prisma migrate deploy`
2. Generate Prisma client: `heroku run npx prisma generate`
3. Check database connection: `heroku pg:info`

### Socket.IO Not Connecting

1. Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
2. Check browser console for connection errors
3. Ensure backend allows WebSocket connections

## Updating Deployment

### Backend Updates

```bash
git add .
git commit -m "Update backend"
git push heroku main
```

### Frontend Updates

Vercel automatically deploys when you push to your connected Git branch.

Or manually trigger a deployment in the Vercel dashboard.

## Monitoring

### Heroku

```bash
# View logs
heroku logs --tail

# Check dyno status
heroku ps

# Open app
heroku open
```

### Vercel

- View deployments in Vercel dashboard
- Check build logs for errors
- Monitor analytics and performance

## Production Checklist

- [ ] Backend deployed to Heroku
- [ ] PostgreSQL database created
- [ ] All Heroku environment variables set
- [ ] Frontend deployed to Vercel
- [ ] All Vercel environment variables set
- [ ] CORS configured correctly
- [ ] Database migrations run
- [ ] Test user registration
- [ ] Test user login
- [ ] Test image uploads
- [ ] Test real-time messaging
- [ ] Test Socket.IO connection
- [ ] Monitor error logs

## Support

For issues or questions:
1. Check Heroku logs: `heroku logs --tail`
2. Check Vercel deployment logs
3. Review browser console for frontend errors
4. Verify all environment variables are set correctly
