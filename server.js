const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');

const app = express();
const parser = new Parser({
    timeout: 10000, // 10 second timeout
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
});
const cache = new NodeCache({ stdTTL: 7200 }); // 2 hours cache

app.use(cors());
app.use(express.static('.'));

// News sources configuration
const NEWS_SOURCES = {
    india: [
        // Major Business Papers
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/home_page_top_stories.rss' },
        { name: 'Mint', url: 'https://www.livemint.com/rss/news' },
        { name: 'Mint Market', url: 'https://www.livemint.com/rss/markets' },
        { name: 'Financial Express', url: 'https://www.financialexpress.com/feed/' },
        { name: 'Business Line', url: 'https://www.thehindubusinessline.com/news/feeder/default.rss' },
        { name: 'Business Line Economy', url: 'https://www.thehindubusinessline.com/economy/feeder/default.rss' },
        
        // Additional Indian Sources
        { name: 'MoneyControl', url: 'https://www.moneycontrol.com/rss/latestnews.xml' },
        { name: 'Business Today', url: 'https://www.businesstoday.in/latest/rss' },
        { name: 'Forbes India', url: 'https://www.forbesindia.com/rss/news.xml' },
        { name: 'Indian Express Business', url: 'https://indianexpress.com/section/business/feed/' },
        { name: 'News18 Business', url: 'https://www.news18.com/rss/business.xml' },
        { name: 'BloombergQuint', url: 'https://www.bloombergquint.com/feed' }
    ],
    
    global: [
        // US & International - Working Feeds
        { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/businessNews' },
        { name: 'Reuters Markets', url: 'https://feeds.reuters.com/reuters/marketsNews' },
        { name: 'AP Business', url: 'https://feedx.net/rss/ap-business.xml' },
        { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
        { name: 'CNN Business', url: 'http://rss.cnn.com/rss/money_latest.rss' },
        { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories' },
        { name: 'CNBC Top News', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147' },
        { name: 'Financial Times', url: 'https://www.ft.com/rss/home' },
        { name: 'WSJ World', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml' },
        { name: 'NYT Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml' },
        { name: 'Washington Post Business', url: 'https://feeds.washingtonpost.com/rss/business' },
        
        // Tech & Business
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
        { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
        
        // Asia-Pacific
        { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed' },
        { name: 'Japan Times', url: 'https://www.japantimes.co.jp/feed/' },
        { name: 'Channel NewsAsia', url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511' }
    ],
    
    'global-india': [
        // Dedicated India coverage from global sources - Working Feeds
        { name: 'Reuters India', url: 'https://feeds.reuters.com/reuters/INbusinessNews' },
        { name: 'BBC India', url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml' },
        { name: 'Al Jazeera India', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
        { name: 'NYT Asia Pacific', url: 'https://rss.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml' },
        { name: 'Guardian Asia', url: 'https://www.theguardian.com/world/asia/rss' },
        { name: 'SCMP Asia', url: 'https://www.scmp.com/rss/2/feed' }
    ]
};

// Similarity calculation for deduplication
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

function removeDuplicates(newsItems) {
    const unique = [];
    const SIMILARITY_THRESHOLD = 0.75;
    
    for (const item of newsItems) {
        let isDuplicate = false;
        
        for (const uniqueItem of unique) {
            const titleSimilarity = calculateSimilarity(item.title, uniqueItem.title);
            
            if (titleSimilarity >= SIMILARITY_THRESHOLD) {
                isDuplicate = true;
                // Keep the one with more content
                if (item.contentSnippet && item.contentSnippet.length > (uniqueItem.contentSnippet || '').length) {
                    const index = unique.indexOf(uniqueItem);
                    unique[index] = item;
                }
                break;
            }
        }
        
        if (!isDuplicate) {
            unique.push(item);
        }
    }
    
    return unique;
}

// Fetch and aggregate news
async function fetchNewsFromSource(source) {
    try {
        const feed = await parser.parseURL(source.url);
        return feed.items.map(item => {
            // Extract image from various possible fields
            let imageUrl = null;
            
            // Method 1: Enclosure (common in RSS 2.0)
            if (item.enclosure && item.enclosure.url) {
                imageUrl = item.enclosure.url;
            } 
            // Method 2: Media RSS namespace - media:content
            else if (item['media:content']) {
                if (Array.isArray(item['media:content'])) {
                    imageUrl = item['media:content'][0]?.$ ? item['media:content'][0].$.url : null;
                } else if (item['media:content'].$) {
                    imageUrl = item['media:content'].$.url;
                } else if (item['media:content'].url) {
                    imageUrl = item['media:content'].url;
                }
            }
            // Method 3: Media RSS namespace - media:thumbnail
            else if (item['media:thumbnail']) {
                if (Array.isArray(item['media:thumbnail'])) {
                    imageUrl = item['media:thumbnail'][0]?.$ ? item['media:thumbnail'][0].$.url : null;
                } else if (item['media:thumbnail'].$) {
                    imageUrl = item['media:thumbnail'].$.url;
                } else if (item['media:thumbnail'].url) {
                    imageUrl = item['media:thumbnail'].url;
                }
            }
            // Method 4: iTunes image
            else if (item.itunes && item.itunes.image) {
                imageUrl = item.itunes.image;
            }
            // Method 5: Content with image tag
            else if (item.content) {
                const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch && imgMatch[1]) {
                    imageUrl = imgMatch[1];
                }
            }
            // Method 6: Content:encoded field
            else if (item['content:encoded']) {
                const imgMatch = item['content:encoded'].match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch && imgMatch[1]) {
                    imageUrl = imgMatch[1];
                }
            }
            // Method 7: Description with image
            else if (item.description) {
                const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch && imgMatch[1]) {
                    imageUrl = imgMatch[1];
                }
            }
            
            // Get description and truncate to 100 characters
            let description = item.contentSnippet || item.summary || item.description || '';
            
            // Remove HTML tags if present
            description = description.replace(/<[^>]*>/g, '');
            
            // Remove extra whitespace
            description = description.replace(/\s+/g, ' ').trim();
            
            // Truncate to 100 characters
            if (description.length > 100) {
                description = description.substring(0, 97).trim() + '...';
            }
            
            return {
                title: item.title || '',
                description: description,
                link: item.link || '',
                source: source.name,
                pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                id: item.guid || item.link || `${source.name}-${Date.now()}`,
                image: imageUrl
            };
        });
    } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error.message);
        return [];
    }
}

async function aggregateNews(category) {
    const sources = NEWS_SOURCES[category] || [];
    const allNews = [];
    
    // Fetch from all sources in parallel
    const promises = sources.map(source => fetchNewsFromSource(source));
    const results = await Promise.all(promises);
    
    // Flatten results
    results.forEach(items => {
        allNews.push(...items);
    });
    
    // Remove duplicates
    const uniqueNews = removeDuplicates(allNews);
    
    // Sort by date
    uniqueNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    return uniqueNews;
}

// API endpoints
app.get('/api/news/:category', async (req, res) => {
    const category = req.params.category;
    
    // Check cache
    const cached = cache.get(category);
    if (cached) {
        return res.json(cached);
    }
    
    try {
        // Fetch news for the category (now global-india has its own sources)
        const news = await aggregateNews(category);
        
        // Cache the results
        cache.set(category, news);
        
        res.json(news);
    } catch (error) {
        console.error('Error aggregating news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to check image extraction
app.get('/api/debug/:category', async (req, res) => {
    const category = req.params.category;
    try {
        const news = await aggregateNews(category);
        const stats = {
            total: news.length,
            withImages: news.filter(item => item.image).length,
            withoutImages: news.filter(item => !item.image).length,
            sampleWithImage: news.find(item => item.image) || null,
            sources: [...new Set(news.map(item => item.source))]
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`News aggregator server running on port ${PORT}`);
});
