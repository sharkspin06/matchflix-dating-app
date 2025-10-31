# Vercel Deployment Guide for Matchflix Frontend

## Step-by-Step Deployment

### 1. Sign Up / Login to Vercel
- Go to https://vercel.com
- Sign up or login with your GitLab account

### 2. Import Your Project

1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose **GitLab** as the provider
4. Select your repository: `sharkspin06/matchflix-dating-up`
5. Click **"Import"**

### 3. Configure Project Settings

#### Framework Preset
- **Framework**: Next.js (should auto-detect)

#### Root Directory
- **Root Directory**: `frontend`
- Click **"Edit"** next to Root Directory and enter: `frontend`

#### Build Settings (Auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Environment Variables

Add the following environment variables:

```
NEXT_PUBLIC_API_URL=https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com
NEXT_PUBLIC_SOCKET_URL=https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com
```

**How to add:**
1. Scroll down to **"Environment Variables"**
2. Click **"Add"**
3. Enter variable name and value
4. Repeat for each variable

### 5. Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (usually 2-3 minutes)
3. You'll get a URL like: `https://matchflix-dating-up.vercel.app`

### 6. Update Backend CORS (Already Done!)

The backend has been updated to allow requests from:
- `http://localhost:3000` (development)
- `https://matchflix-dating-up.vercel.app` (production)

If your Vercel URL is different, update the backend:

1. Edit `backend/src/index.ts`
2. Add your Vercel URL to the `allowedOrigins` array
3. Commit and redeploy backend to Heroku

### 7. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions
5. Update backend CORS with your custom domain

## Vercel CLI Deployment (Alternative)

If you prefer using CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? matchflix-frontend
# - In which directory is your code located? ./
# - Want to override settings? N

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com

vercel env add NEXT_PUBLIC_SOCKET_URL production
# Enter: https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com

# Deploy to production
vercel --prod
```

## Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you push to other branches or create PRs

To configure:
1. Go to project settings
2. Click **"Git"**
3. Set production branch to `main` or `upload`

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Next.js version compatibility

### API Connection Issues
- Verify environment variables are set correctly
- Check browser console for CORS errors
- Ensure backend is running on Heroku

### 404 Errors
- Check that root directory is set to `frontend`
- Verify build output directory is `.next`

### Environment Variables Not Working
- Environment variables must start with `NEXT_PUBLIC_` to be accessible in browser
- Redeploy after adding/changing environment variables

## Monitoring

- **Analytics**: Vercel provides built-in analytics
- **Logs**: View real-time logs in Vercel dashboard
- **Performance**: Check Web Vitals in project overview

## Cost

- **Hobby Plan**: Free
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Perfect for this project!

- **Pro Plan**: $20/month (if you need more)

## Your Deployment URLs

- **Backend (Heroku)**: https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com
- **Frontend (Vercel)**: https://matchflix-dating-up.vercel.app (or your custom URL)

## Next Steps After Deployment

1. Test all features on production
2. Update any hardcoded URLs
3. Set up monitoring/error tracking (optional)
4. Configure custom domain (optional)
5. Share your app! 🎉
