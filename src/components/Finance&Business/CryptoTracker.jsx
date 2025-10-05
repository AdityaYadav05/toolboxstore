import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Star, Plus, Minus, Search, RefreshCw, Download, Settings, Save, Trash2, Eye, EyeOff, Wallet, PieChart, AlertCircle, Clock } from 'lucide-react';


const CryptoTracker = () => {
  const [state, setState] = useState({
    cryptocurrencies: [],
    portfolio: [],
    watchlist: [],
    selectedCurrency: null,
    isLoading: true,
    lastUpdated: null,
    error: null,
    viewMode: 'all', // 'all', 'portfolio', 'watchlist'
    currency: 'USD',
    sortBy: 'market_cap',
    sortOrder: 'desc'
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoRefresh: true,
    refreshInterval: 60, // seconds
    priceAlerts: true,
    showHidden: false,
    defaultCurrency: 'USD'
  });

  const [portfolio, setPortfolio] = useState([
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      amount: 0.5,
      buyPrice: 45000,
      currentPrice: 0,
      value: 0,
      profitLoss: 0,
      profitLossPercentage: 0
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      amount: 2,
      buyPrice: 3000,
      currentPrice: 0,
      value: 0,
      profitLoss: 0,
      profitLossPercentage: 0
    }
  ]);

  const [watchlist, setWatchlist] = useState(['bitcoin', 'ethereum', 'cardano', 'solana']);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const refreshIntervalRef = useRef(null);

  // Mock cryptocurrency data
  const mockCryptos = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 52150.42,
      price_change_24h: 1250.67,
      price_change_percentage_24h: 2.46,
      market_cap: 1024567890123,
      total_volume: 34567890123,
      high_24h: 52500.00,
      low_24h: 50800.00,
      market_cap_rank: 1,
      image: '₿',
      last_updated: new Date().toISOString()
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 2850.75,
      price_change_24h: -45.25,
      price_change_percentage_24h: -1.56,
      market_cap: 342567890123,
      total_volume: 15678901234,
      high_24h: 2950.00,
      low_24h: 2800.00,
      market_cap_rank: 2,
      image: 'Ξ',
      last_updated: new Date().toISOString()
    },
    {
      id: 'cardano',
      symbol: 'ada',
      name: 'Cardano',
      current_price: 0.52,
      price_change_24h: 0.02,
      price_change_percentage_24h: 4.00,
      market_cap: 18567890123,
      total_volume: 567890123,
      high_24h: 0.53,
      low_24h: 0.49,
      market_cap_rank: 8,
      image: 'ADA',
      last_updated: new Date().toISOString()
    },
    {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      current_price: 102.45,
      price_change_24h: 5.25,
      price_change_percentage_24h: 5.40,
      market_cap: 44567890123,
      total_volume: 2345678901,
      high_24h: 105.00,
      low_24h: 97.50,
      market_cap_rank: 5,
      image: 'SOL',
      last_updated: new Date().toISOString()
    },
    {
      id: 'ripple',
      symbol: 'xrp',
      name: 'Ripple',
      current_price: 0.58,
      price_change_24h: -0.01,
      price_change_percentage_24h: -1.69,
      market_cap: 31567890123,
      total_volume: 1234567890,
      high_24h: 0.60,
      low_24h: 0.57,
      market_cap_rank: 6,
      image: 'XRP',
      last_updated: new Date().toISOString()
    },
    {
      id: 'polkadot',
      symbol: 'dot',
      name: 'Polkadot',
      current_price: 7.25,
      price_change_24h: 0.15,
      price_change_percentage_24h: 2.11,
      market_cap: 9256789012,
      total_volume: 345678901,
      high_24h: 7.40,
      low_24h: 7.10,
      market_cap_rank: 12,
      image: 'DOT',
      last_updated: new Date().toISOString()
    },
    {
      id: 'dogecoin',
      symbol: 'doge',
      name: 'Dogecoin',
      current_price: 0.085,
      price_change_24h: 0.002,
      price_change_percentage_24h: 2.41,
      market_cap: 12123456789,
      total_volume: 456789012,
      high_24h: 0.087,
      low_24h: 0.082,
      market_cap_rank: 9,
      image: 'DOGE',
      last_updated: new Date().toISOString()
    },
    {
      id: 'chainlink',
      symbol: 'link',
      name: 'Chainlink',
      current_price: 18.42,
      price_change_24h: -0.25,
      price_change_percentage_24h: -1.34,
      market_cap: 10765432109,
      total_volume: 345678901,
      high_24h: 19.00,
      low_24h: 18.20,
      market_cap_rank: 15,
      image: 'LINK',
      last_updated: new Date().toISOString()
    }
  ];

  // Initialize from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('cryptoPortfolio');
    const savedWatchlist = localStorage.getItem('cryptoWatchlist');
    const savedSettings = localStorage.getItem('cryptoSettings');
    
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    // Load initial crypto data
    loadCryptoData();
  }, []);

  // Save to localStorage and setup auto-refresh
  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
    localStorage.setItem('cryptoWatchlist', JSON.stringify(watchlist));
    localStorage.setItem('cryptoSettings', JSON.stringify(settings));

    // Setup auto-refresh
    if (settings.autoRefresh && refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    if (settings.autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadCryptoData();
      }, settings.refreshInterval * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [portfolio, watchlist, settings]);

  // Load crypto data
  const loadCryptoData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update portfolio with current prices
      const updatedPortfolio = portfolio.map(item => {
        const crypto = mockCryptos.find(c => c.id === item.id);
        if (crypto) {
          const currentPrice = crypto.current_price;
          const value = item.amount * currentPrice;
          const profitLoss = value - (item.amount * item.buyPrice);
          const profitLossPercentage = (profitLoss / (item.amount * item.buyPrice)) * 100;
          
          return {
            ...item,
            currentPrice,
            value,
            profitLoss,
            profitLossPercentage
          };
        }
        return item;
      });

      setPortfolio(updatedPortfolio);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastUpdated: new Date().toISOString(),
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load cryptocurrency data' 
      }));
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  // Format large numbers
  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  // Add to watchlist
  const addToWatchlist = (cryptoId) => {
    if (!watchlist.includes(cryptoId)) {
      setWatchlist(prev => [...prev, cryptoId]);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = (cryptoId) => {
    setWatchlist(prev => prev.filter(id => id !== cryptoId));
  };

  // Add to portfolio
  const addToPortfolio = (crypto, amount, buyPrice) => {
    const existingItem = portfolio.find(item => item.id === crypto.id);
    
    if (existingItem) {
      // Update existing portfolio item
      const totalAmount = existingItem.amount + amount;
      const averagePrice = ((existingItem.amount * existingItem.buyPrice) + (amount * buyPrice)) / totalAmount;
      
      setPortfolio(prev => prev.map(item =>
        item.id === crypto.id
          ? { ...item, amount: totalAmount, buyPrice: averagePrice }
          : item
      ));
    } else {
      // Add new portfolio item
      const newItem = {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        amount: amount,
        buyPrice: buyPrice,
        currentPrice: crypto.current_price,
        value: amount * crypto.current_price,
        profitLoss: (amount * crypto.current_price) - (amount * buyPrice),
        profitLossPercentage: ((crypto.current_price - buyPrice) / buyPrice) * 100
      };
      
      setPortfolio(prev => [...prev, newItem]);
    }
  };

  // Remove from portfolio
  const removeFromPortfolio = (cryptoId) => {
    setPortfolio(prev => prev.filter(item => item.id !== cryptoId));
  };

  // Calculate portfolio totals
  const calculatePortfolioTotals = () => {
    return portfolio.reduce((totals, item) => ({
      totalValue: totals.totalValue + item.value,
      totalInvested: totals.totalInvested + (item.amount * item.buyPrice),
      totalProfitLoss: totals.totalProfitLoss + item.profitLoss
    }), { totalValue: 0, totalInvested: 0, totalProfitLoss: 0 });
  };

  // Refresh data
  const refreshData = () => {
    loadCryptoData();
  };

  // Get filtered cryptocurrencies
  const getFilteredCryptos = () => {
    let filtered = mockCryptos;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply view mode filter
    if (state.viewMode === 'watchlist') {
      filtered = filtered.filter(crypto => watchlist.includes(crypto.id));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (state.sortBy) {
        case 'price':
          aValue = a.current_price;
          bValue = b.current_price;
          break;
        case 'price_change_24h':
          aValue = a.price_change_percentage_24h;
          bValue = b.price_change_percentage_24h;
          break;
        case 'market_cap':
        default:
          aValue = a.market_cap;
          bValue = b.market_cap;
          break;
      }
      
      return state.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return filtered;
  };

  // Get theme colors
  const getThemeColors = () => {
    const themes = {
      blue: { primary: 'blue', bg: 'blue', text: 'blue' },
      green: { primary: 'green', bg: 'green', text: 'green' },
      purple: { primary: 'purple', bg: 'purple', text: 'purple' },
      orange: { primary: 'orange', bg: 'orange', text: 'orange' }
    };
    return themes[settings.theme] || themes.blue;
  };

  const theme = getThemeColors();
  const portfolioTotals = calculatePortfolioTotals();
  const filteredCryptos = getFilteredCryptos();

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Crypto Tracker</h2>
        <div className="ml-auto flex items-center gap-2">
          {state.lastUpdated && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={14} />
              Updated: {new Date(state.lastUpdated).toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={refreshData}
            disabled={state.isLoading}
            className="p-2 text-gray-600 hover:text-blue-600 transition disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={state.isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Navigation */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Navigation</h3>
            </div>
            <div className="p-2">
              {[
                { id: 'dashboard', name: 'Market Overview', icon: TrendingUp },
                { id: 'portfolio', name: 'My Portfolio', icon: Wallet },
                { id: 'watchlist', name: 'Watchlist', icon: Star },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map(item => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                      activeTab === item.id 
                        ? `bg-${theme.primary}-100 text-${theme.primary}-800` 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent size={16} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portfolio Summary */}
          {portfolio.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Portfolio Summary</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(portfolioTotals.totalValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Invested:</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(portfolioTotals.totalInvested)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profit/Loss:</span>
                  <span className={`font-bold ${
                    portfolioTotals.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(portfolioTotals.totalProfitLoss)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Return:</span>
                  <span className={`font-bold ${
                    portfolioTotals.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(
                      ((portfolioTotals.totalValue - portfolioTotals.totalInvested) / portfolioTotals.totalInvested) * 100
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`bg-${theme.primary}-50 p-4 rounded-xl`}>
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={refreshData}
                disabled={state.isLoading}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={state.isLoading ? 'animate-spin' : ''} />
                Refresh Data
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Add to Portfolio
              </button>
            </div>
          </div>

          {/* Market Stats */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Market Stats</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Coins:</span>
                <span className="font-bold text-gray-800">{mockCryptos.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Watchlist:</span>
                <span className="font-bold text-gray-800">{watchlist.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Portfolio:</span>
                <span className="font-bold text-gray-800">{portfolio.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search cryptocurrencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={state.sortBy}
                    onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="market_cap">Market Cap</option>
                    <option value="price">Price</option>
                    <option value="price_change_24h">24h Change</option>
                  </select>
                  
                  <button
                    onClick={() => setState(prev => ({ ...prev, sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' }))}
                    className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                  >
                    {state.sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                </div>
              </div>

              {/* Cryptocurrencies List */}
              <div className="space-y-3">
                {filteredCryptos.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-lg">
                        {crypto.image}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{crypto.name}</h3>
                          <span className="text-sm text-gray-500 uppercase">{crypto.symbol}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            #{crypto.market_cap_rank}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Market Cap: {formatMarketCap(crypto.market_cap)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-gray-800 text-lg">
                        {formatCurrency(crypto.current_price)}
                      </div>
                      <div className={`flex items-center gap-1 ${
                        crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        <span className="font-semibold">
                          {formatPercentage(crypto.price_change_percentage_24h)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => watchlist.includes(crypto.id) ? removeFromWatchlist(crypto.id) : addToWatchlist(crypto.id)}
                        className={`p-2 rounded transition ${
                          watchlist.includes(crypto.id)
                            ? 'text-yellow-500 bg-yellow-50'
                            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                        }`}
                        title={watchlist.includes(crypto.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star size={18} fill={watchlist.includes(crypto.id) ? 'currentColor' : 'none'} />
                      </button>
                      
                      <button
                        onClick={() => {
                          const amount = parseFloat(prompt(`Enter amount of ${crypto.symbol.toUpperCase()} to add:`) || '0');
                          const buyPrice = parseFloat(prompt(`Enter buy price per ${crypto.symbol.toUpperCase()}:`) || crypto.current_price);
                          if (amount > 0) {
                            addToPortfolio(crypto, amount, buyPrice);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition"
                        title="Add to Portfolio"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredCryptos.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No cryptocurrencies found</div>
                    <div className="text-sm">Try adjusting your search terms</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">My Portfolio</h3>
                <button
                  onClick={() => {
                    const crypto = mockCryptos[0]; // Default to Bitcoin
                    const amount = parseFloat(prompt(`Enter amount of ${crypto.symbol.toUpperCase()} to add:`) || '0');
                    const buyPrice = parseFloat(prompt(`Enter buy price per ${crypto.symbol.toUpperCase()}:`) || crypto.current_price);
                    if (amount > 0) {
                      addToPortfolio(crypto, amount, buyPrice);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Asset
                </button>
              </div>

              {portfolio.length > 0 ? (
                <div className="space-y-4">
                  {/* Portfolio Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(portfolioTotals.totalValue)}
                      </div>
                      <div className="text-sm text-blue-800">Total Portfolio Value</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(portfolioTotals.totalProfitLoss)}
                      </div>
                      <div className="text-sm text-green-800">Total Profit/Loss</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentage(
                          ((portfolioTotals.totalValue - portfolioTotals.totalInvested) / portfolioTotals.totalInvested) * 100
                        )}
                      </div>
                      <div className="text-sm text-purple-800">Total Return</div>
                    </div>
                  </div>

                  {/* Portfolio Assets */}
                  <div className="space-y-3">
                    {portfolio.map((item) => {
                      const crypto = mockCryptos.find(c => c.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-lg">
                              {crypto?.image || item.symbol.toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                <span className="text-sm text-gray-500 uppercase">{item.symbol}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.amount} {item.symbol.toUpperCase()} • Avg Buy: {formatCurrency(item.buyPrice)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-gray-800 text-lg">
                              {formatCurrency(item.value)}
                            </div>
                            <div className={`flex items-center gap-1 ${
                              item.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.profitLoss >= 0 ? (
                                <TrendingUp size={16} />
                              ) : (
                                <TrendingDown size={16} />
                              )}
                              <span className="font-semibold">
                                {formatCurrency(item.profitLoss)} ({formatPercentage(item.profitLossPercentage)})
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => removeFromPortfolio(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                              title="Remove from Portfolio"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Wallet size={48} className="mx-auto mb-4 opacity-50" />
                  <div>Your portfolio is empty</div>
                  <div className="text-sm">Add some cryptocurrencies to get started</div>
                </div>
              )}
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Watchlist</h3>
                <span className="text-gray-600">{watchlist.length} items</span>
              </div>

              {watchlist.length > 0 ? (
                <div className="space-y-3">
                  {mockCryptos
                    .filter(crypto => watchlist.includes(crypto.id))
                    .map((crypto) => (
                      <div
                        key={crypto.id}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-lg">
                            {crypto.image}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800">{crypto.name}</h3>
                              <span className="text-sm text-gray-500 uppercase">{crypto.symbol}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                #{crypto.market_cap_rank}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Market Cap: {formatMarketCap(crypto.market_cap)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-gray-800 text-lg">
                            {formatCurrency(crypto.current_price)}
                          </div>
                          <div className={`flex items-center gap-1 ${
                            crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {crypto.price_change_percentage_24h >= 0 ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                            <span className="font-semibold">
                              {formatPercentage(crypto.price_change_percentage_24h)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => removeFromWatchlist(crypto.id)}
                            className="p-2 text-yellow-500 bg-yellow-50 rounded transition hover:bg-yellow-100"
                            title="Remove from Watchlist"
                          >
                            <Star size={18} fill="currentColor" />
                          </button>
                          
                          <button
                            onClick={() => {
                              const amount = parseFloat(prompt(`Enter amount of ${crypto.symbol.toUpperCase()} to add:`) || '0');
                              const buyPrice = parseFloat(prompt(`Enter buy price per ${crypto.symbol.toUpperCase()}:`) || crypto.current_price);
                              if (amount > 0) {
                                addToPortfolio(crypto, amount, buyPrice);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition"
                            title="Add to Portfolio"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Star size={48} className="mx-auto mb-4 opacity-50" />
                  <div>Your watchlist is empty</div>
                  <div className="text-sm">Add some cryptocurrencies to track them</div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="text-gray-600" />
                Settings
              </h3>
              
              <div className="space-y-8">
                {/* Theme Selection */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Theme Color</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['blue', 'green', 'purple', 'orange'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(prev => ({ ...prev, theme: color }))}
                        className={`p-4 rounded-lg border-2 transition ${
                          settings.theme === color 
                            ? `border-${color}-500 bg-${color}-100` 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-${color}-500 mx-auto`}></div>
                        <div className="text-sm mt-2 capitalize">{color}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-Refresh Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Auto Refresh</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.autoRefresh 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <RefreshCw size={16} />
                      Auto Refresh {settings.autoRefresh ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Refresh Interval: {settings.refreshInterval} seconds
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      step="30"
                      value={settings.refreshInterval}
                      onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>30s</span>
                      <span>5m</span>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Price Alerts</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, priceAlerts: !prev.priceAlerts }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.priceAlerts 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <AlertCircle size={16} />
                      Price Alerts {settings.priceAlerts ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Show Hidden</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showHidden: !prev.showHidden }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showHidden 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Eye size={16} />
                      Show Hidden {settings.showHidden ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Data Management</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        localStorage.removeItem('cryptoPortfolio');
                        localStorage.removeItem('cryptoWatchlist');
                        setPortfolio([]);
                        setWatchlist([]);
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                      Clear All Data
                    </button>
                    <div className="text-xs text-gray-500">
                      This will remove your portfolio and watchlist data. This action cannot be undone.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <TrendingUp className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Real-time Prices</div>
          <div className="text-sm text-gray-600">Live cryptocurrency data</div>
        </div>
        <div className="text-center p-4">
          <Wallet className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Portfolio Tracking</div>
          <div className="text-sm text-gray-600">Track your investments</div>
        </div>
        <div className="text-center p-4">
          <Star className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Watchlist</div>
          <div className="text-sm text-gray-600">Monitor favorite coins</div>
        </div>
        <div className="text-center p-4">
          <PieChart className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Market Analysis</div>
          <div className="text-sm text-gray-600">Comprehensive metrics</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Crypto Tracker Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use the <strong>watchlist</strong> to track cryptocurrencies you're interested in without adding them to your portfolio</li>
          <li>• Enable <strong>auto-refresh</strong> to keep prices updated automatically at your preferred interval</li>
          <li>• <strong>Diversify your portfolio</strong> by adding multiple cryptocurrencies with different risk profiles</li>
          <li>• Monitor <strong>24-hour price changes</strong> to identify market trends and volatility</li>
          <li>• Use <strong>market cap rankings</strong> to understand a cryptocurrency's relative size in the market</li>
          <li>• Set <strong>price alerts</strong> to get notified when your watched cryptocurrencies hit target prices</li>
          <li>• Regularly <strong>review your portfolio performance</strong> to make informed investment decisions</li>
        </ul>
      </div>
    </div>
  );
};

export default CryptoTracker;