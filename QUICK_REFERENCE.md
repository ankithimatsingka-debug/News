# ⚡ Quick Command Reference

## First Time Setup (Do Once)

```bash
# 1. Configure Git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 2. Navigate to project folder
cd ~/Downloads/news-aggregator

# 3. Initialize and push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/news-aggregator.git
git branch -M main
git push -u origin main
```

## Update Website (After Changes)

```bash
cd ~/Downloads/news-aggregator
git add .
git commit -m "Updated news sources"
git push
```

## Render Settings (Copy-Paste)

```
Build Command: npm install
Start Command: npm start
Environment: Node
Plan: Free
```

## Your URLs After Deployment

- **Render URL:** https://news-aggregator-XXXX.onrender.com
- **GitHub Repo:** https://github.com/YOUR-USERNAME/news-aggregator

## Test Local Before Deploy

```bash
npm install
npm start
# Open: http://localhost:3000
```
