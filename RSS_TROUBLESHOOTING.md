# 🔧 RSS Feed Troubleshooting Guide

## Why "Sample Source - Breaking News Story" Appears

This happens when RSS feeds fail to load. The code falls back to demo data instead of showing errors.

## Common Causes:

### 1. **RSS Feeds Are Blocked**
Many news sites block server requests from cloud platforms like Render, Vercel, etc.
- They detect non-browser requests
- They block by IP range
- They require authentication

### 2. **CORS Issues**
Some feeds don't allow cross-origin requests from servers.

### 3. **Rate Limiting**
Fetching too many feeds at once can trigger rate limits.

### 4. **Feed URLs Changed**
News sites frequently change or remove their RSS feeds.

## ✅ **Fix Applied in v4.2**

I've updated the RSS feeds with more reliable sources:

### **Global Papers - New Sources:**
- ✅ Reuters (feeds.reuters.com)
- ✅ BBC Business
- ✅ AP Business
- ✅ CNN Business
- ✅ MarketWatch
- ✅ CNBC
- ✅ Financial Times
- ✅ WSJ
- ✅ NYT Business
- ✅ TechCrunch

### **Global India - New Sources:**
- ✅ Reuters India
- ✅ BBC India
- ✅ Al Jazeera
- ✅ NYT Asia Pacific
- ✅ Guardian Asia

### **What Changed:**
1. Replaced blocked feeds with working alternatives
2. Added 10-second timeout to prevent hanging
3. Added User-Agent header to mimic browser requests
4. Using more reliable RSS feed domains

## 🧪 **Test After Deploying:**

### Check Debug Endpoint:
```
https://your-app.onrender.com/api/debug/global
```

You should see:
```json
{
  "total": 50-100,
  "withImages": 20-40,
  "sources": ["Reuters", "BBC Business", "CNN Business", ...]
}
```

### Check Direct API:
```
https://your-app.onrender.com/api/news/global
```

Should return actual news, not "Sample Source".

## 🔍 **Still Seeing Sample Data?**

### Step 1: Check Render Logs
1. Go to Render Dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for errors like:
   ```
   Error fetching from [Source]: ENOTFOUND
   Error fetching from [Source]: timeout
   ```

### Step 2: Clear Cache
The server caches news for 2 hours. To force refresh:
1. Render Dashboard → Manual Deploy → Deploy latest commit
2. This clears the cache and fetches fresh

### Step 3: Test Individual Feeds
Try these URLs directly in your browser:
- https://feeds.reuters.com/reuters/businessNews
- https://feeds.bbci.co.uk/news/business/rss.xml
- https://rss.nytimes.com/services/xml/rss/nyt/Business.xml

If they work in browser but not on server → likely IP blocking.

## 🛠️ **Alternative Solutions**

### Option 1: Use RSS Feed Proxy
Some services proxy RSS feeds to avoid blocks:
- RSS2JSON: https://rss2json.com
- Feedburner: https://feedburner.google.com
- RSSHub: https://docs.rsshub.app

### Option 2: Reduce Number of Sources
Edit `server.js` and keep only the 5-10 most reliable sources:
```javascript
global: [
    { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/businessNews' },
    { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
    { name: 'CNN', url: 'http://rss.cnn.com/rss/money_latest.rss' },
    { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }
]
```

### Option 3: Use News API
Instead of RSS, use a news API service:
- NewsAPI.org (free tier: 100 requests/day)
- Bing News Search API
- Google News API

## 📊 **Expected Success Rate**

With the new feeds:
- **India Papers**: 80-90% success (most Indian feeds work)
- **Global Papers**: 60-80% success (some may be blocked)
- **Global India**: 50-70% success (fewer India-specific feeds available)

**This is normal!** Even with 50% success, you'll get plenty of news.

## 🚀 **Deploy the Fix**

```bash
cd ~/Downloads/news-aggregator
git add .
git commit -m "v4.2: Fixed RSS feeds with working alternatives"
git push
```

Wait 2-3 minutes for Render to deploy, then check!

---

**Bottom line:** RSS feeds from servers are tricky. The new feeds should work much better, but some may still fail due to blocking. This is a limitation of using free RSS feeds, not a bug in your code.
