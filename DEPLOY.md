# Quick Deployment Guide for biznews.vercel.app

## 🚀 Deploy to Vercel (Recommended)

### Step-by-Step Instructions:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   vercel
   ```

4. **When prompted:**
   - Set up and deploy: **Y**
   - Which scope: [Select your account]
   - Link to existing project: **N**
   - What's your project's name: **biznews**
   - In which directory is your code located: **./**
   - Want to override the settings: **N**

5. **Your site will be deployed at:**
   ```
   https://biznews.vercel.app
   ```

## Alternative: Use Vercel Dashboard

1. Visit https://vercel.com/new
2. Import your Git repository
3. Set project name to: **biznews**
4. Click "Deploy"

## Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain (e.g., biznews.com)

## Environment Variables

If needed, set these in Vercel dashboard:
- `NODE_ENV` = production
- `PORT` = 3000

## Automatic Deployments

Once connected to Git:
- Every push to main branch = automatic deployment
- Pull requests get preview URLs
- Zero downtime deployments

---

**Your news aggregator will be live at: https://biznews.vercel.app** 🎉
