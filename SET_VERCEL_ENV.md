# Set Vercel Environment Variables

Your backend is deployed at: **https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com**

## Option 1: Using Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select your project: **matchflix-dating-up-frontend-qivq**
3. Click **Settings** → **Environment Variables**
4. Add these variables:

### Variable 1:
- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com`
- **Environment:** Production, Preview, Development (select all)

### Variable 2:
- **Name:** `NEXT_PUBLIC_SOCKET_URL`
- **Value:** `https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com`
- **Environment:** Production, Preview, Development (select all)

5. Click **Save**
6. Go to **Deployments** tab
7. Click the three dots (**...**) on your latest deployment
8. Click **Redeploy**
9. Wait for the build to complete

## Option 2: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
# When prompted, paste: https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_SOCKET_URL
# When prompted, paste: https://matchflix-backend-sharkspin-7495c8c8bf7e.herokuapp.com
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

## Verify It's Working

After redeploying, test:

1. Go to: https://matchflix-dating-up-frontend-qivq.vercel.app
2. Try to register a new account
3. Try to login
4. Check browser console (F12) - you should see API calls to your Heroku backend

## Current Status

✅ Backend deployed and running on Heroku
✅ Frontend deployed on Vercel
❌ Environment variables NOT set in Vercel (this is why login/register fails)

Once you set the environment variables and redeploy, everything will work! 🚀
