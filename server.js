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
        { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms' },
        { name: 'Business Standard', url: 'https://www.business-standard.com/rss/home_page_top_stories.rss' },
        { name: 'Mint', url: 'https://www.livemint.com/rss/news' },
        { name: 'Financial Express', url: 'https://www.financialexpress.com/feed/' },
        { name: 'Business Line', url: 'https://www.thehindubusinessline.com/news/feeder/default.rss' }
    ],
    global: [
        { name: 'Reuters', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best' },
        { name: 'Bloomberg', url: 'https://www.bloomberg.com/politics/feeds/site.xml' },
        { name: 'Financial Times', url: 'https://www.ft.com/news-feed?format=rss' },
        { name: 'WSJ', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml' }
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
        return feed.items.map(item => ({
            title: item.title || '',
            description: item.contentSnippet || item.content || '',
            link: item.link || '',
            source: source.name,
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            id: item.guid || item.link || `${source.name}-${Date.now()}`
        }));
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
        let news;
        
        if (category === 'global-india') {
            // Fetch global news and filter for India mentions
            const globalNews = await aggregateNews('global');
            news = globalNews.filter(item => 
                item.title.toLowerCase().includes('india') ||
                item.description.toLowerCase().includes('india')
            );
        } else {
            news = await aggregateNews(category);
        }
        
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
