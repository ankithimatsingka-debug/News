// Configuration
const CONFIG = {
    REFRESH_INTERVAL: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    CACHE_KEY_PREFIX: 'news_cache_',
    LAST_UPDATE_KEY: 'last_update_'
};

// News sources configuration
const NEWS_SOURCES = {
    india: [
        { name: 'Economic Times', rss: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms' },
        { name: 'Business Standard', rss: 'https://www.business-standard.com/rss/home_page_top_stories.rss' },
        { name: 'Mint', rss: 'https://www.livemint.com/rss/news' },
        { name: 'Financial Express', rss: 'https://www.financialexpress.com/feed/' },
        { name: 'Business Line', rss: 'https://www.thehindubusinessline.com/news/feeder/default.rss' }
    ],
    global: [
        { name: 'Wall Street Journal', rss: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml' },
        { name: 'Financial Times', rss: 'https://www.ft.com/?format=rss' },
        { name: 'Bloomberg', rss: 'https://www.bloomberg.com/feed/podcast/bloomberg-businessweek.xml' },
        { name: 'Nikkei Asia', rss: 'https://asia.nikkei.com/rss/feed/nar' },
        { name: 'Straits Times', rss: 'https://www.straitstimes.com/news/singapore/rss.xml' }
    ],
    'global-india': [
        { name: 'WSJ India', search: 'india' },
        { name: 'FT India', search: 'india' },
        { name: 'Bloomberg India', search: 'india' },
        { name: 'Nikkei India', search: 'india' }
    ]
};

// Deduplication using similarity threshold
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
    const SIMILARITY_THRESHOLD = 0.75; // 75% similarity threshold
    
    for (const item of newsItems) {
        let isDuplicate = false;
        
        for (const uniqueItem of unique) {
            const titleSimilarity = calculateSimilarity(item.title, uniqueItem.title);
            
            if (titleSimilarity >= SIMILARITY_THRESHOLD) {
                isDuplicate = true;
                // Keep the one with more content or earlier timestamp
                if (item.description && item.description.length > (uniqueItem.description || '').length) {
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

// Fetch news from backend API
async function fetchNews(category) {
    try {
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000'
            : ''; // Use relative URL in production
        
        const response = await fetch(`${API_URL}/api/news/${category}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newsItems = await response.json();
        return newsItems;
    } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback to demo data if API fails
        return generateDemoNews('Sample Source', 5);
    }
}

// Generate demo news (replace with actual API calls in production)
function generateDemoNews(source, count) {
    const items = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
        items.push({
            title: `${source} - Breaking News Story ${i + 1}`,
            description: `This is a sample news description from ${source}. In production, this would contain actual news content fetched from RSS feeds or news APIs.`,
            link: `https://example.com/news/${Date.now()}-${i}`,
            source: source.split(' ')[0],
            pubDate: new Date(now - (i * 3600000)), // Stagger by hours
            id: `${source}-${Date.now()}-${i}`
        });
    }
    
    return items;
}

// Display news items
function displayNews(newsItems) {
    const container = document.getElementById('newsContainer');
    
    if (!newsItems || newsItems.length === 0) {
        container.innerHTML = '<div class="error">No news items found. Please check back later.</div>';
        return;
    }
    
    // Sort by publication date
    newsItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    container.innerHTML = newsItems.map((item, index) => `
        <article class="news-item" style="animation-delay: ${index * 0.05}s">
            <div class="news-content">
                ${item.image ? `
                    <div class="news-image">
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" onerror="this.parentElement.style.display='none'">
                    </div>
                ` : ''}
                <div class="news-text">
                    <span class="news-source">${escapeHtml(item.source)}</span>
                    <h3 class="news-title">
                        <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
                            ${escapeHtml(item.title)}
                        </a>
                    </h3>
                    ${item.description ? `<p class="news-description">${escapeHtml(item.description)}</p>` : ''}
                    <div class="news-meta">
                        <span class="news-time">
                            🕒 ${formatTime(item.pubDate)}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours === 0) {
        return minutes === 0 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else {
        return new Date(date).toLocaleDateString();
    }
}

function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = new Date().toLocaleString();
    }
}

// Cache management
function getCachedNews(category) {
    const cached = localStorage.getItem(CONFIG.CACHE_KEY_PREFIX + category);
    if (cached) {
        return JSON.parse(cached);
    }
    return null;
}

function setCachedNews(category, news) {
    localStorage.setItem(CONFIG.CACHE_KEY_PREFIX + category, JSON.stringify(news));
    localStorage.setItem(CONFIG.LAST_UPDATE_KEY + category, Date.now().toString());
}

function shouldRefresh(category) {
    const lastUpdate = localStorage.getItem(CONFIG.LAST_UPDATE_KEY + category);
    if (!lastUpdate) return true;
    
    const timeSinceUpdate = Date.now() - parseInt(lastUpdate);
    return timeSinceUpdate >= CONFIG.REFRESH_INTERVAL;
}

// Main load function
async function loadNews(category) {
    const container = document.getElementById('newsContainer');
    
    // Check cache first
    const cached = getCachedNews(category);
    if (cached && !shouldRefresh(category)) {
        displayNews(cached);
        updateLastUpdateTime();
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="loading">Loading latest news...</div>';
    
    try {
        const news = await fetchNews(category);
        setCachedNews(category, news);
        displayNews(news);
        updateLastUpdateTime();
    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = '<div class="error">Failed to load news. Please try again later.</div>';
    }
}

// Auto-refresh functionality
function setupAutoRefresh(category) {
    setInterval(() => {
        loadNews(category);
    }, CONFIG.REFRESH_INTERVAL);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Auto-refresh will be set up when loadNews is called from each page
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'india';
    
    // Setup auto-refresh
    setupAutoRefresh(category);
    
    // Setup scroll-to-hide header
    setupScrollHeader();
    
    // Setup read state tracking
    setupReadStateTracking();
    
    // Setup scroll-to-top button
    setupScrollToTop();
    
    // Setup automatic page refresh every hour
    setupAutoPageRefresh();
});

// Automatic page refresh every hour
function setupAutoPageRefresh() {
    const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
    const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before refresh
    
    // Store the initial load time
    const loadTime = Date.now();
    sessionStorage.setItem('pageLoadTime', loadTime);
    
    let warningShown = false;
    
    // Check if we should refresh
    const checkInterval = setInterval(() => {
        const currentTime = Date.now();
        const storedLoadTime = parseInt(sessionStorage.getItem('pageLoadTime') || loadTime);
        const timeSinceLoad = currentTime - storedLoadTime;
        const timeUntilRefresh = ONE_HOUR - timeSinceLoad;
        
        // Show warning 5 minutes before refresh
        if (!warningShown && timeUntilRefresh <= WARNING_TIME && timeUntilRefresh > 0) {
            showRefreshNotification(Math.floor(timeUntilRefresh / 60000)); // minutes remaining
            warningShown = true;
        }
        
        // If it's been an hour, refresh the page
        if (timeSinceLoad >= ONE_HOUR) {
            console.log('Auto-refreshing page for fresh news...');
            // Save scroll position
            sessionStorage.setItem('scrollPosition', window.scrollY);
            // Reload the page (hard refresh)
            window.location.reload(true);
            clearInterval(checkInterval);
        }
    }, 60000); // Check every minute
    
    // Restore scroll position after refresh (if available)
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
            sessionStorage.removeItem('scrollPosition');
        }, 100);
    }
}

// Show refresh notification
function showRefreshNotification(minutesRemaining) {
    const notification = document.createElement('div');
    notification.className = 'refresh-notification';
    notification.innerHTML = `
        <span>🔄 Fresh news loading in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}...</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 10000);
}

// Scroll-to-top button
function setupScrollToTop() {
    // Create button element
    const button = document.createElement('div');
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(button);
    
    let ticking = false;
    
    // Show/hide based on scroll position
    function updateScrollButton() {
        const scrollY = window.scrollY;
        
        if (scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
        
        ticking = false;
    }
    
    // Scroll event listener
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollButton);
            ticking = true;
        }
    });
    
    // Click to scroll to top
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Scroll-to-hide header
function setupScrollHeader() {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const navbar = document.querySelector('.navbar');
    
    function updateNavbar() {
        const scrollY = window.scrollY;
        
        if (scrollY > lastScrollY && scrollY > 100) {
            // Scrolling down
            navbar.classList.add('hidden');
        } else {
            // Scrolling up
            navbar.classList.remove('hidden');
        }
        
        lastScrollY = scrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
}

// Track read state
function setupReadStateTracking() {
    // Load read articles from localStorage
    const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
    
    // Mark read articles
    setTimeout(() => {
        document.querySelectorAll('.news-item').forEach(item => {
            const link = item.querySelector('.news-title a');
            if (link && readArticles.includes(link.href)) {
                item.classList.add('read');
            }
        });
    }, 100);
    
    // Track clicks
    document.addEventListener('click', (e) => {
        const newsLink = e.target.closest('.news-title a');
        if (newsLink) {
            const newsItem = newsLink.closest('.news-item');
            if (newsItem) {
                newsItem.classList.add('read');
                
                // Save to localStorage
                const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
                if (!readArticles.includes(newsLink.href)) {
                    readArticles.push(newsLink.href);
                    // Keep only last 100 articles
                    if (readArticles.length > 100) {
                        readArticles.shift();
                    }
                    localStorage.setItem('readArticles', JSON.stringify(readArticles));
                }
            }
        }
    });
}
