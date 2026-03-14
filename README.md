# Business News Aggregator

A sophisticated news aggregation website that collates business news from multiple sources with intelligent deduplication and automatic refresh every 2 hours.

## Features

✅ **Three News Feeds:**
- **India Papers**: Economic Times, Business Standard, Mint, Financial Express, Business Line
- **Global Papers**: Reuters, Bloomberg, Financial Times, Wall Street Journal
- **Global India**: India-related news from global publications

✅ **Intelligent Deduplication**: Uses Levenshtein distance algorithm to detect and remove duplicate stories (75% similarity threshold)

✅ **Auto-Refresh**: Automatically refreshes every 2 hours

✅ **Caching**: 2-hour cache to reduce API calls and improve performance

✅ **Responsive Design**: Works on desktop, tablet, and mobile devices

✅ **Clean UI**: Modern, professional interface with easy navigation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **Open in browser:**
```
http://localhost:3000
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended - FREE)

Vercel offers free hosting with automatic HTTPS and global CDN.

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts:**
   - Set up and deploy: Y
   - Which scope: [Your account]
   - Link to existing project: N
   - Project name: news-aggregator
   - Directory: ./
   - Override settings: N

4. **Your site will be live at:** `https://biznews.vercel.app`

### Option 2: Deploy to Netlify (FREE)

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build and deploy:**
```bash
netlify deploy --prod
```

3. **Configure:**
   - Build command: `npm install`
   - Publish directory: `.`

### Option 3: Deploy to Railway (FREE tier available)

1. **Visit:** https://railway.app
2. **Create new project** → Deploy from GitHub
3. **Connect your repository**
4. **Railway will auto-detect Node.js** and deploy

### Option 4: Deploy to Render (FREE)

1. **Visit:** https://render.com
2. **New** → **Web Service**
3. **Connect your repository**
4. **Configuration:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

### Option 5: Deploy to Heroku

1. **Install Heroku CLI**
2. **Login:**
```bash
heroku login
```

3. **Create app:**
```bash
heroku create biznews
```

4. **Deploy:**
```bash
git push heroku main
```

## Configuration

### Environment Variables

Create a `.env` file for production:

```env
PORT=3000
NODE_ENV=production
CACHE_DURATION=7200
```

### Customizing News Sources

Edit `server.js` to add or remove news sources:

```javascript
const NEWS_SOURCES = {
    india: [
        { name: 'Source Name', url: 'RSS_FEED_URL' }
    ]
};
```

### Adjusting Refresh Interval

In `app.js`, modify:

```javascript
const CONFIG = {
    REFRESH_INTERVAL: 2 * 60 * 60 * 1000, // Change to desired milliseconds
};
```

In `server.js`, modify:

```javascript
const cache = new NodeCache({ stdTTL: 7200 }); // Change to desired seconds
```

## Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **RSS Parsing**: rss-parser
- **Caching**: node-cache
- **Deduplication**: Levenshtein distance algorithm

## API Endpoints

### Get News by Category
```
GET /api/news/:category
```

Categories:
- `india` - Indian business newspapers
- `global` - Global business newspapers  
- `global-india` - India mentions in global papers

Response:
```json
[
  {
    "title": "News headline",
    "description": "News description",
    "link": "Article URL",
    "source": "Source name",
    "pubDate": "ISO date string",
    "id": "Unique identifier"
  }
]
```

### Health Check
```
GET /api/health
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Caching**: 2-hour server-side cache reduces API calls
- **Deduplication**: Efficient algorithm processes ~50 items in <100ms
- **Lazy Loading**: News loads on demand
- **CDN Ready**: Static assets can be served via CDN

## Security

- CORS enabled for API access
- No API keys exposed to frontend
- Input sanitization for XSS prevention
- HTTPS recommended for production

## Troubleshooting

### News not loading
- Check browser console for errors
- Verify backend server is running
- Check RSS feed URLs are accessible

### Duplicates still appearing
- Adjust `SIMILARITY_THRESHOLD` in `server.js` (default: 0.75)
- Lower value = more strict deduplication

### Slow loading
- Increase cache duration
- Reduce number of sources
- Use CDN for static assets

## Future Enhancements

- [ ] User authentication
- [ ] Personalized feeds
- [ ] Email notifications
- [ ] Mobile app
- [ ] AI-powered summarization
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Search functionality
- [ ] Save/bookmark articles

## License

MIT License - feel free to use and modify!

## Support

For issues or questions, please open an issue on the repository.

---

**Made with ❤️ for staying informed on business news**
