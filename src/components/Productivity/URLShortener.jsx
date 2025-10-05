import { useState, useEffect } from 'react';
import { Link, Copy, Check, BarChart3, Clock, Trash2, Edit3, ExternalLink, Zap, Plus, Search, Filter, Download, QrCode } from 'lucide-react';

const URLShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [showQRCode, setShowQRCode] = useState(null);

  // Sample initial data
  const sampleUrls = [
    {
      id: 1,
      originalUrl: 'https://www.example.com/very-long-url-that-needs-shortening',
      shortUrl: 'https://short.ly/abc123',
      slug: 'abc123',
      clicks: 15,
      createdAt: new Date('2024-01-15'),
      lastClicked: new Date('2024-01-19'),
      title: 'Example Website'
    },
    {
      id: 2,
      originalUrl: 'https://www.google.com/search?q=url+shortener+react+component',
      shortUrl: 'https://short.ly/goog123',
      slug: 'goog123',
      clicks: 8,
      createdAt: new Date('2024-01-16'),
      lastClicked: new Date('2024-01-18'),
      title: 'Google Search'
    },
    {
      id: 3,
      originalUrl: 'https://github.com/reactjs/react',
      shortUrl: 'https://short.ly/react',
      slug: 'react',
      clicks: 23,
      createdAt: new Date('2024-01-10'),
      lastClicked: new Date('2024-01-19'),
      title: 'React GitHub'
    }
  ];

  // Initialize data
  useEffect(() => {
    const savedUrls = localStorage.getItem('shortenedUrls');
    if (savedUrls) {
      setShortenedUrls(JSON.parse(savedUrls));
    } else {
      setShortenedUrls(sampleUrls);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
    calculateStats();
  }, [shortenedUrls]);

  // Calculate statistics
  const calculateStats = () => {
    const totalUrls = shortenedUrls.length;
    const totalClicks = shortenedUrls.reduce((sum, url) => sum + url.clicks, 0);
    const mostPopular = shortenedUrls.reduce((max, url) => 
      url.clicks > max.clicks ? url : max, shortenedUrls[0] || { clicks: 0 }
    );
    const todayClicks = shortenedUrls.reduce((sum, url) => {
      const today = new Date().toDateString();
      const lastClicked = new Date(url.lastClicked).toDateString();
      return sum + (lastClicked === today ? url.clicks : 0);
    }, 0);

    setStats({
      totalUrls,
      totalClicks,
      mostPopular,
      todayClicks,
      averageClicks: totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0
    });
  };

  // Generate random slug
  const generateSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let slug = '';
    for (let i = 0; i < 6; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  };

  // Validate URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Shorten URL
  const shortenUrl = () => {
    if (!originalUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    if (!isValidUrl(originalUrl)) {
      alert('Please enter a valid URL (include http:// or https://)');
      return;
    }

    const slug = customSlug.trim() || generateSlug();
    
    // Check if slug already exists
    if (shortenedUrls.some(url => url.slug === slug)) {
      alert('This custom slug is already in use. Please choose another one.');
      return;
    }

    const shortUrl = `https://short.ly/${slug}`;
    const newUrl = {
      id: Date.now(),
      originalUrl: originalUrl.trim(),
      shortUrl,
      slug,
      clicks: 0,
      createdAt: new Date(),
      lastClicked: null,
      title: getUrlTitle(originalUrl)
    };

    setShortenedUrls(prev => [newUrl, ...prev]);
    setOriginalUrl('');
    setCustomSlug('');
  };

  // Get URL title (simplified)
  const getUrlTitle = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Unknown Website';
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  // Simulate click (for demo purposes)
  const simulateClick = (urlId) => {
    setShortenedUrls(prev => prev.map(url => {
      if (url.id === urlId) {
        return {
          ...url,
          clicks: url.clicks + 1,
          lastClicked: new Date()
        };
      }
      return url;
    }));
  };

  // Delete URL
  const deleteUrl = (urlId) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== urlId));
  };

  // Edit URL
  const editUrl = (urlId, newSlug) => {
    if (!newSlug.trim()) return;

    if (shortenedUrls.some(url => url.slug === newSlug && url.id !== urlId)) {
      alert('This custom slug is already in use. Please choose another one.');
      return;
    }

    setShortenedUrls(prev => prev.map(url => 
      url.id === urlId 
        ? { 
            ...url, 
            slug: newSlug.trim(),
            shortUrl: `https://short.ly/${newSlug.trim()}`
          }
        : url
    ));
  };

  // Generate QR Code (mock implementation)
  const generateQRCode = (url) => {
    // In a real app, you would generate an actual QR code
    // For demo, we'll return a mock data URL
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12">QR Code for: ${url}</text>
      </svg>
    `)}`;
  };

  // Export data
  const exportData = () => {
    const data = {
      shortenedUrls,
      exportDate: new Date().toISOString(),
      totalUrls: shortenedUrls.length,
      totalClicks: shortenedUrls.reduce((sum, url) => sum + url.clicks, 0)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `url-shortener-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Get filtered URLs
  const getFilteredUrls = () => {
    let filtered = shortenedUrls;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(url => 
        url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'popular') {
      filtered = filtered.sort((a, b) => b.clicks - a.clicks);
    } else if (filter === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filter === 'oldest') {
      filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filtered;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  };

  const filteredUrls = getFilteredUrls();

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">URL Shortener</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* URL Shortener Form */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="text-blue-600" />
              Shorten Your URL
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Original URL
                </label>
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://www.example.com/very-long-url"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Slug (Optional)
                </label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 py-3 border-2 border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                    short.ly/
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    placeholder="custom-name"
                    className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-r-lg focus:border-blue-500 focus:outline-none"
                    maxLength={30}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Letters, numbers, hyphens, and underscores only. Leave empty for auto-generated.
                </div>
              </div>

              <button
                onClick={shortenUrl}
                disabled={!originalUrl.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Zap size={24} />
                Shorten URL
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All URLs</option>
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Added</option>
                <option value="oldest">Oldest First</option>
              </select>

              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* URLs List */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                Your Shortened URLs ({filteredUrls.length})
              </h3>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {filteredUrls.length === 0 ? (
                <div className="text-center py-12">
                  <Link className="mx-auto text-gray-400 mb-4" size={48} />
                  <div className="text-gray-500">
                    {searchTerm ? 'No URLs match your search' : 'No shortened URLs yet'}
                  </div>
                  {!searchTerm && (
                    <button
                      onClick={() => setOriginalUrl('https://www.example.com')}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Create Your First URL
                    </button>
                  )}
                </div>
              ) : (
                filteredUrls.map(url => (
                  <div key={url.id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800 truncate">{url.title}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {url.clicks} clicks
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 flex-shrink-0">Original:</span>
                            <a 
                              href={url.originalUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 truncate flex items-center gap-1"
                            >
                              {url.originalUrl}
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 flex-shrink-0">Short:</span>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <a 
                                href={url.shortUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={() => simulateClick(url.id)}
                                className="text-lg font-semibold text-green-600 hover:text-green-800 truncate flex items-center gap-1"
                              >
                                {url.shortUrl}
                                <ExternalLink size={14} />
                              </a>
                              
                              <button
                                onClick={() => copyToClipboard(url.shortUrl)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition"
                              >
                                {copiedUrl === url.shortUrl ? <Check size={16} /> : <Copy size={16} />}
                              </button>

                              <button
                                onClick={() => setShowQRCode(showQRCode === url.id ? null : url.id)}
                                className="p-1 text-gray-400 hover:text-purple-600 transition"
                              >
                                <QrCode size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            const newSlug = prompt('Enter new slug:', url.slug);
                            if (newSlug) editUrl(url.id, newSlug);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteUrl(url.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* QR Code Display */}
                    {showQRCode === url.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                          <img 
                            src={generateQRCode(url.shortUrl)} 
                            alt="QR Code" 
                            className="w-24 h-24 border border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 mb-2">QR Code</h5>
                            <p className="text-sm text-gray-600 mb-2">
                              Scan this QR code to quickly access your shortened URL
                            </p>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = generateQRCode(url.shortUrl);
                                link.download = `qrcode-${url.slug}.svg`;
                                link.click();
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Download QR Code
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Created: {formatDate(url.createdAt)}
                        </span>
                        {url.lastClicked && (
                          <span className="flex items-center gap-1">
                            <BarChart3 size={14} />
                            Last click: {formatDate(url.lastClicked)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {url.slug}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          {stats && (
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="text-blue-600" />
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalUrls}</div>
                  <div className="text-sm text-gray-600">Total URLs</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalClicks}</div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-gray-800">{stats.todayClicks}</div>
                  <div className="text-sm text-gray-600">Today's Clicks</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-gray-800">{stats.averageClicks}</div>
                  <div className="text-sm text-gray-600">Avg. Clicks per URL</div>
                </div>
              </div>
            </div>
          )}

          {/* Most Popular URL */}
          {stats?.mostPopular && (
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-green-600" />
                Most Popular
              </h3>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="font-semibold text-gray-800 mb-2 truncate">
                  {stats.mostPopular.title}
                </div>
                <div className="text-sm text-gray-600 mb-2 truncate">
                  {stats.mostPopular.shortUrl}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    {stats.mostPopular.clicks} clicks
                  </span>
                  <button
                    onClick={() => copyToClipboard(stats.mostPopular.shortUrl)}
                    className="p-1 text-gray-400 hover:text-green-600 transition"
                  >
                    {copiedUrl === stats.mostPopular.shortUrl ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setOriginalUrl('https://www.');
                  document.querySelector('input[type="url"]')?.focus();
                }}
                className="w-full p-3 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Create New URL</div>
                <div className="text-sm text-gray-600">Shorten another URL</div>
              </button>
              <button
                onClick={() => {
                  const urls = shortenedUrls.map(url => `${url.shortUrl} -> ${url.originalUrl}`).join('\n');
                  navigator.clipboard.writeText(urls);
                  alert('All URLs copied to clipboard!');
                }}
                className="w-full p-3 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Copy All URLs</div>
                <div className="text-sm text-gray-600">Copy all shortened URLs</div>
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="w-full p-3 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Clear Filters</div>
                <div className="text-sm text-gray-600">Reset search and filters</div>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-orange-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">URL Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Custom Slugs</div>
                <div className="text-gray-600">Use memorable slugs for important URLs</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">QR Codes</div>
                <div className="text-gray-600">Generate QR codes for printed materials</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Analytics</div>
                <div className="text-gray-600">Track click-through rates and popularity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Link className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">URL Shortening</div>
          <div className="text-sm text-gray-600">Create short, memorable links</div>
        </div>
        <div className="text-center p-4">
          <BarChart3 className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Click Analytics</div>
          <div className="text-sm text-gray-600">Track link performance</div>
        </div>
        <div className="text-center p-4">
          <QrCode className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">QR Codes</div>
          <div className="text-sm text-gray-600">Generate QR codes for links</div>
        </div>
        <div className="text-center p-4">
          <Download className="mx-auto text-orange-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Export Data</div>
          <div className="text-sm text-gray-600">Backup your shortened URLs</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 URL Shortening Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use custom slugs for important URLs to make them more memorable</li>
          <li>• Track click analytics to understand which links are most popular</li>
          <li>• Use QR codes for printed materials, presentations, or business cards</li>
          <li>• Regularly export your data to maintain backups of your shortened URLs</li>
          <li>• Use descriptive custom slugs that hint at the destination content</li>
        </ul>
      </div>
    </div>
  );
};

export default URLShortener;