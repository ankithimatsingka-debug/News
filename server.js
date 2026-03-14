const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const NodeCache = require('node-cache');

const app = express();
const parser = new Parser();
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
        // US & International
        { name: 'Reuters Business', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best' },
        { name: 'Bloomberg', url: 'https://www.bloomberg.com/politics/feeds/site.xml' },
        { name: 'Financial Times', url: 'https://www.ft.com/news-feed?format=rss' },
        { name: 'WSJ', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml' },
        { name: 'WSJ Business', url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml' },
        { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
        { name: 'Forbes', url: 'https://www.forbes.com/business/feed/' },
        { name: 'Business Insider', url: 'https://www.businessinsider.com/rss' },
        
        // Europe
        { name: 'Handelsblatt', url: 'https://www.handelsblatt.com/contentexport/feed/top-themen' },
        { name: 'The Economist', url: 'https://www.economist.com/business/rss.xml' },
        
        // Asia-Pacific
        { name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss/feed/nar' },
        { name: 'Straits Times', url: 'https://www.straitstimes.com/news/business/rss.xml' },
        { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed' },
        { name: 'Japan Times Business', url: 'https://www.japantimes.co.jp/feed/business/' }
    ],
    
    'global-india': [
        // Dedicated India coverage from global sources
        { name: 'Reuters India', url: 'https://www.reuters.com/places/india/feed/' },
        { name: 'Bloomberg India', url: 'https://www.bloomberg.com/feeds/podcasts/india.xml' },
        { name: 'FT India', url: 'https://www.ft.com/world/asia-pacific/india?format=rss' },
        { name: 'WSJ India', url: 'https://www.wsj.com/news/types/india-news?mod=rsswn' },
        { name: 'BBC India Business', url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml' },
        { name: 'Guardian India', url: 'https://www.theguardian.com/world/india/rss' },
        { name: 'Nikkei Asia India', url: 'https://asia.nikkei.com/Location/South-Asia/India/feed' },
        { name: 'SCMP India', url: 'https://www.scmp.com/rss/322214/feed' }
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
            
            // Try different image fields
            if (item.enclosure && item.enclosure.url) {
                imageUrl = item.enclosure.url;
            } else if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
                imageUrl = item['media:content']['$'].url;
            } else if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
                imageUrl = item['media:thumbnail']['$'].url;
            } else if (item.content) {
                // Try to extract image from content HTML
                const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                    imageUrl = imgMatch[1];
                }
            }
            
            // Get description and truncate to 100 characters
            let description = item.contentSnippet || item.content || item.description || '';
            
            // Remove HTML tags if present
            description = description.replace(/<[^>]*>/g, '');
            
            // Truncate to 100 characters
            if (description.length > 100) {
                description = description.substring(0, 100).trim() + '...';
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`News aggregator server running on port ${PORT}`);
});
