# ✓ Deployment Checklist

## Before You Start
- [ ] GitHub account created (https://github.com)
- [ ] Render account created (https://render.com)
- [ ] Git installed on Mac (`git --version`)
- [ ] All files downloaded to a folder

## GitHub Setup
- [ ] Created new repository on GitHub (public)
- [ ] Configured git username and email
- [ ] Generated GitHub personal access token
- [ ] Initialized git in project folder (`git init`)
- [ ] Added all files (`git add .`)
- [ ] Made first commit (`git commit -m "Initial commit"`)
- [ ] Connected to GitHub (`git remote add origin ...`)
- [ ] Pushed to GitHub (`git push -u origin main`)
- [ ] Verified files appear on GitHub.com

## Render Deployment
- [ ] Signed up for Render with GitHub
- [ ] Created new Web Service
- [ ] Connected news-aggregator repository
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Selected Free plan
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment to complete
- [ ] Saw "Live" status with green checkmark

## Testing
- [ ] Opened Render URL in browser
- [ ] India Papers page loads
- [ ] Global Papers page loads
- [ ] Global India page loads
- [ ] Navigation between pages works
- [ ] News items display (or loading state shows)
- [ ] Tested on mobile device
- [ ] Shared URL with someone else to verify public access

## Post-Deployment
- [ ] Bookmarked Render dashboard URL
- [ ] Saved GitHub repository URL
- [ ] Saved Render public URL
- [ ] Tested auto-refresh (wait 2 hours or check logs)

## Optional Enhancements
- [ ] Set up custom domain in Render settings
- [ ] Enable auto-deploy on GitHub push
- [ ] Set up environment variables if needed
- [ ] Configure email notifications for deploy status

---

**All done?** 🎉 Your website is live and accessible 24/7!

**Your live URL:** https://news-aggregator-XXXX.onrender.com
(Replace XXXX with your actual Render app name)
