# 🚀 Complete Deployment Guide - GitHub + Render

## Prerequisites
- GitHub account (free) - Sign up at https://github.com
- Render account (free) - Sign up at https://render.com
- Git installed on your Mac

---

## 📁 STEP 1: Prepare Your Files

You have all the files ready. Your project structure:

```
news-aggregator/
├── index.html              # India Papers page
├── global.html             # Global Papers page
├── global-india.html       # Global India page
├── styles.css              # Styling
├── app.js                  # Frontend JavaScript
├── server.js               # Backend server
├── package.json            # Dependencies
├── vercel.json             # Deployment config
├── .gitignore              # Git ignore file
├── README.md               # Documentation
└── deploy.sh               # Deployment script
```

---

## 🔧 STEP 2: Install Git (if not already installed)

Open Terminal on your Mac and check if Git is installed:

```bash
git --version
```

If not installed, install it:
```bash
# Install Homebrew first (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git
brew install git
```

---

## 📤 STEP 3: Upload to GitHub

### A. Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - Repository name: `news-aggregator`
   - Description: `Business news aggregator with auto-refresh`
   - Visibility: **Public**
   - ☑️ **Do NOT** check "Add a README file"
4. Click **"Create repository"**

### B. Configure Git on Your Mac

Open Terminal and run these commands (replace with your info):

```bash
# Set your name and email (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### C. Upload Your Files

In Terminal, navigate to where you downloaded the files:

```bash
# Navigate to your downloads folder (or wherever you saved the files)
cd ~/Downloads/news-aggregator

# Initialize Git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - News aggregator website"

# Connect to GitHub (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/news-aggregator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** You'll be prompted to login to GitHub. Use your GitHub username and **personal access token** (not password).

#### How to Create GitHub Personal Access Token:

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `news-aggregator`
4. Expiration: 90 days
5. Select scopes: ☑️ **repo** (all sub-options)
6. Click "Generate token"
7. **Copy the token** (you won't see it again!)
8. Use this token as your password when pushing to GitHub

---

## 🌐 STEP 4: Deploy to Render

### A. Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (easiest option)
4. Authorize Render to access your GitHub account

### B. Create Web Service

1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find `news-aggregator` in the list and click **"Connect"**

### C. Configure the Service

Fill in these settings:

**Basic Settings:**
- **Name:** `news-aggregator` (or any name you like)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Plan:**
- Select **"Free"** plan

**Advanced (Optional):**
- **Auto-Deploy:** Yes (recommended - auto-updates when you push to GitHub)

### D. Deploy!

1. Click **"Create Web Service"**
2. Render will start building your app
3. Wait 2-5 minutes (you'll see logs)
4. When complete, you'll see **"Live"** with a green checkmark
5. Your URL will be: `https://news-aggregator-XXXX.onrender.com`

---

## ✅ STEP 5: Test Your Website

1. Click on your Render URL
2. You should see your News Aggregator website!
3. Test all three pages:
   - India Papers
   - Global Papers
   - Global India
4. Share the URL - it's accessible from anywhere!

---

## 🔄 How to Update Your Website Later

Whenever you make changes:

```bash
# Navigate to your project folder
cd ~/Downloads/news-aggregator

# Add changes
git add .

# Commit changes
git commit -m "Description of what you changed"

# Push to GitHub
git push

# Render will automatically redeploy!
```

---

## 🛠️ Troubleshooting

### Issue: "Permission denied" when pushing to GitHub
**Solution:** Use personal access token instead of password

### Issue: Build fails on Render
**Solution:** Check the logs in Render dashboard. Common fixes:
- Ensure `package.json` is present
- Check `npm install` command runs successfully
- Verify `server.js` has no syntax errors

### Issue: Website shows error 503
**Solution:** Render free tier may sleep after inactivity. First visit takes 30 seconds to wake up.

### Issue: RSS feeds not loading
**Solution:** Some RSS feeds may block server requests. This is normal - the code includes fallback mechanisms.

---

## 💡 Tips

1. **Free Render Tier Limitations:**
   - Spins down after 15 minutes of inactivity
   - First request takes ~30 seconds to wake up
   - 750 hours/month free (enough for this project)

2. **Keep It Running 24/7:**
   - Upgrade to Render paid plan ($7/month)
   - Or use a cron job to ping your site every 14 minutes

3. **Custom Domain:**
   - Go to Render dashboard → Settings → Custom Domain
   - Add your domain (e.g., mynews.com)

---

## 📊 What Happens After Deployment

✅ Your website is **live 24/7** (even when your Mac is off)
✅ **Auto-refreshes** every 2 hours with latest news
✅ **Accessible worldwide** from any device
✅ **Auto-deploys** when you push updates to GitHub
✅ **HTTPS enabled** automatically (secure)

---

## 🆘 Need Help?

If something doesn't work:
1. Check Render logs (Render Dashboard → Logs tab)
2. Check GitHub repository is public
3. Verify all files are uploaded to GitHub
4. Make sure `package.json` and `server.js` are present

---

**Congratulations! Your news aggregator is now live! 🎉**
