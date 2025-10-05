import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Search, Download, Upload, Settings, Save, Trash2, Zap, Eye, EyeOff, Copy, CheckCircle, AlertTriangle, RotateCcw, Clock, Star, Bell, BellOff, Activity, BarChart3, Target } from 'lucide-react';

const StockChecker = () => {
  const [state, setState] = useState({
    symbol: '',
    stockData: null,
    isFetching: false,
    error: null,
    viewMode: 'overview', // 'overview', 'chart', 'details'
    history: [],
    watchlist: [],
    selectedStock: null,
    lastUpdated: null
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoRefresh: false,
    refreshInterval: 30000,
    showPercentChange: true,
    showVolume: true,
    showMarketCap: true,
    defaultCurrency: 'USD',
    priceAlerts: true
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Tech Stocks',
      symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']
    },
    {
      id: 2,
      name: 'Index Funds',
      symbols: ['SPY', 'QQQ', 'VTI', 'IVV', 'VOO']
    },
    {
      id: 3,
      name: 'Cryptocurrency',
      symbols: ['BTC-USD', 'ETH-USD', 'ADA-USD', 'DOT-USD']
    }
  ]);

  const [activeTab, setActiveTab] = useState('checker');
  const symbolInputRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('stockCheckerHistory');
    const savedSettings = localStorage.getItem('stockCheckerSettings');
    const savedPresets = localStorage.getItem('stockCheckerPresets');
    const savedWatchlist = localStorage.getItem('stockCheckerWatchlist');
    
    if (savedHistory) setState(prev => ({ ...prev, history: JSON.parse(savedHistory) }));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
    if (savedWatchlist) setState(prev => ({ ...prev, watchlist: JSON.parse(savedWatchlist) }));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('stockCheckerHistory', JSON.stringify(state.history));
    localStorage.setItem('stockCheckerSettings', JSON.stringify(settings));
    localStorage.setItem('stockCheckerPresets', JSON.stringify(presets));
    localStorage.setItem('stockCheckerWatchlist', JSON.stringify(state.watchlist));
  }, [state.history, settings, presets, state.watchlist]);

  // Auto-refresh if enabled
  useEffect(() => {
    let interval;
    if (settings.autoRefresh && state.stockData) {
      interval = setInterval(() => {
        fetchStockData(state.symbol);
      }, settings.refreshInterval);
    }
    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval, state.symbol, state.stockData]);

  // Validate stock symbol
  const validateSymbol = (symbol) => {
    if (!symbol.trim()) {
      return { isValid: false, error: 'Stock symbol cannot be empty' };
    }

    // Basic validation - in real app, this would check against a known list
    const validSymbol = /^[A-Z0-9.-]{1,10}$/i.test(symbol);
    return { 
      isValid: validSymbol, 
      error: validSymbol ? null : 'Please enter a valid stock symbol'
    };
  };

  // Mock stock data function (in real app, this would call a financial API)
  const fetchStockData = async (symbol) => {
    // Simulate API delay
    const delay = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Mock data based on symbol
    const basePrice = Math.random() * 1000 + 50;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    const marketCap = basePrice * volume * Math.random() * 10;

    const mockData = {
      symbol: symbol.toUpperCase(),
      companyName: getCompanyName(symbol),
      price: basePrice,
      change: change,
      changePercent: changePercent,
      volume: volume,
      marketCap: marketCap,
      open: basePrice - Math.random() * 10,
      high: basePrice + Math.random() * 15,
      low: basePrice - Math.random() * 15,
      previousClose: basePrice - change,
      currency: settings.defaultCurrency,
      timestamp: new Date().toISOString(),
      exchange: getExchange(symbol),
      sector: getSector(symbol),
      peRatio: Math.random() * 50 + 10,
      dividendYield: Math.random() * 5,
      yearHigh: basePrice + Math.random() * 50,
      yearLow: basePrice - Math.random() * 50
    };

    return mockData;
  };

  // Helper functions for mock data
  const getCompanyName = (symbol) => {
    const companies = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'SPY': 'SPDR S&P 500 ETF Trust',
      'QQQ': 'Invesco QQQ Trust',
      'BTC-USD': 'Bitcoin USD',
      'ETH-USD': 'Ethereum USD'
    };
    return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Company`;
  };

  const getExchange = (symbol) => {
    if (symbol.includes('-USD')) return 'CRYPTO';
    if (['SPY', 'QQQ', 'VTI'].includes(symbol)) return 'NYSE ARCA';
    return 'NASDAQ';
  };

  const getSector = (symbol) => {
    const sectors = {
      'AAPL': 'Technology',
      'GOOGL': 'Communication Services',
      'MSFT': 'Technology',
      'AMZN': 'Consumer Cyclical',
      'TSLA': 'Automotive',
      'SPY': 'ETF',
      'QQQ': 'ETF',
      'BTC-USD': 'Cryptocurrency',
      'ETH-USD': 'Cryptocurrency'
    };
    return sectors[symbol.toUpperCase()] || 'Various';
  };

  // Fetch stock data
  const fetchStock = async (customSymbol = null) => {
    const symbolToFetch = customSymbol || state.symbol;
    
    const validation = validateSymbol(symbolToFetch);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.error
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isFetching: true, 
      error: null,
      symbol: symbolToFetch.toUpperCase()
    }));

    try {
      const stockData = await fetchStockData(symbolToFetch);
      
      setState(prev => ({
        ...prev,
        stockData: stockData,
        isFetching: false,
        lastUpdated: new Date().toISOString(),
        history: [
          {
            id: Date.now(),
            symbol: stockData.symbol,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            timestamp: stockData.timestamp
          },
          ...prev.history.slice(0, 49)
        ]
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch stock data',
        isFetching: false,
        stockData: null
      }));
    }
  };

  // Quick fetch actions
  const fetchCurrentSymbol = () => {
    if (state.symbol) {
      fetchStock();
    }
  };

  const fetchExample = (exampleSymbol) => {
    setState(prev => ({ ...prev, symbol: exampleSymbol }));
    setTimeout(() => fetchStock(exampleSymbol), 100);
  };

  // Add to watchlist
  const addToWatchlist = () => {
    if (!state.stockData || state.watchlist.find(item => item.symbol === state.stockData.symbol)) {
      return;
    }

    const watchlistItem = {
      id: Date.now(),
      symbol: state.stockData.symbol,
      companyName: state.stockData.companyName,
      price: state.stockData.price,
      change: state.stockData.change,
      changePercent: state.stockData.changePercent,
      timestamp: state.stockData.timestamp
    };

    setState(prev => ({
      ...prev,
      watchlist: [watchlistItem, ...prev.watchlist]
    }));
  };

  // Remove from watchlist
  const removeFromWatchlist = (symbol) => {
    setState(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter(item => item.symbol !== symbol)
    }));
  };

  // Handle file upload (symbol list)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const symbols = content.split('\n')
        .map(symbol => symbol.trim().toUpperCase())
        .filter(symbol => validateSymbol(symbol).isValid)
        .slice(0, 10); // Limit to first 10 valid symbols
      
      if (symbols.length > 0) {
        setState(prev => ({ ...prev, symbol: symbols[0] }));
        // Could implement batch fetch here
      }
    };
    reader.readAsText(file);
  };

  // Copy data to clipboard
  const copyToClipboard = () => {
    if (!state.stockData) return;

    const text = `${state.stockData.symbol}: $${state.stockData.price.toFixed(2)} (${state.stockData.change >= 0 ? '+' : ''}${state.stockData.changePercent.toFixed(2)}%)`;
    navigator.clipboard.writeText(text).then(() => {
      // Show success feedback
      const button = document.querySelector('.copy-button');
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<CheckCircle size={16} /> Copied!';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      }
    });
  };

  // Download data
  const downloadData = () => {
    if (!state.stockData) return;

    const data = {
      stock: state.stockData,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-data-${state.stockData.symbol}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear history
  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
  };

  // Load preset
  const loadPreset = (preset) => {
    if (preset.symbols && preset.symbols.length > 0) {
      setState(prev => ({ ...prev, symbol: preset.symbols[0] }));
    }
    setActiveTab('checker');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name || !state.symbol) return;

    const newPreset = {
      id: Date.now(),
      name,
      symbols: [state.symbol]
    };

    setPresets(prev => [newPreset, ...prev]);
  };

  // Remove preset
  const removePreset = (id) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // Update settings
  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.defaultCurrency
    }).format(value);
  };

  // Format large numbers
  const formatNumber = (value) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(2) + 'B';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    }
    return value.toString();
  };

  const theme = getThemeColors();
  const hasStockData = state.stockData && !state.error;
  const isPositive = hasStockData && state.stockData.change >= 0;

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Stock Market Checker</h2>
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
                { id: 'checker', name: 'Stock Checker', icon: Search },
                { id: 'watchlist', name: 'Watchlist', icon: Star },
                { id: 'history', name: 'History', icon: Clock },
                { id: 'presets', name: 'Presets', icon: Save },
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

          {/* Quick Actions */}
          <div className={`bg-${theme.primary}-50 p-4 rounded-xl`}>
            <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={fetchCurrentSymbol}
                disabled={!state.symbol || state.isFetching}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <TrendingUp size={16} />
                Check Stock
              </button>
              <button
                onClick={addToWatchlist}
                disabled={!hasStockData || state.watchlist.find(item => item.symbol === state.stockData.symbol)}
                className="w-full px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Star size={16} />
                Add to Watchlist
              </button>
              <button
                onClick={downloadData}
                disabled={!hasStockData}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Download Data
              </button>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">View Mode</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[
                  { mode: 'overview', icon: Activity, label: 'Overview' },
                  { mode: 'chart', icon: BarChart3, label: 'Chart' },
                  { mode: 'details', icon: PieChart, label: 'Details' }
                ].map(view => {
                  const IconComponent = view.icon;
                  return (
                    <button
                      key={view.mode}
                      onClick={() => setState(prev => ({ ...prev, viewMode: view.mode }))}
                      className={`w-full px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                        state.viewMode === view.mode 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <IconComponent size={16} />
                      {view.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Batch Check</h3>
            </div>
            <div className="p-4">
              <label className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer text-center justify-center">
                <Upload size={16} />
                Upload Symbol List
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Supports .txt files (one symbol per line)
              </div>
            </div>
          </div>

          {/* Stock Info */}
          {hasStockData && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Stock Info</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Exchange:</span>
                  <span className="font-bold text-gray-800">
                    {state.stockData.exchange}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sector:</span>
                  <span className="font-bold text-gray-800">
                    {state.stockData.sector}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">P/E Ratio:</span>
                  <span className="font-bold text-gray-800">
                    {state.stockData.peRatio.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dividend Yield:</span>
                  <span className="font-bold text-gray-800">
                    {state.stockData.dividendYield.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Checker Tab */}
          {activeTab === 'checker' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Symbol Input */}
              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        ref={symbolInputRef}
                        value={state.symbol}
                        onChange={(e) => setState(prev => ({ ...prev, symbol: e.target.value.toUpperCase(), error: null }))}
                        placeholder="Enter stock symbol (e.g., AAPL, GOOGL, BTC-USD)"
                        className="w-full px-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                        onKeyPress={(e) => e.key === 'Enter' && fetchStock()}
                      />
                      <button
                        onClick={() => fetchStock()}
                        disabled={!state.symbol || state.isFetching}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600 transition disabled:opacity-50"
                      >
                        <Search size={20} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchStock()}
                    disabled={!state.symbol || state.isFetching}
                    className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                  >
                    {state.isFetching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Fetching...
                      </>
                    ) : (
                      <>
                        <TrendingUp size={20} />
                        Check Stock
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Symbol Examples */}
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-600">Try:</span>
                  {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'BTC-USD'].map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => fetchExample(symbol)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-red-600" />
                    <span className="text-red-800 font-medium">{state.error}</span>
                  </div>
                </div>
              )}

              {/* Stock Data Display */}
              {hasStockData && (
                <div className="space-y-6">
                  {/* Stock Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {state.stockData.companyName}
                        </h3>
                        <p className="text-gray-600 font-mono">
                          {state.stockData.symbol} • {state.stockData.exchange}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                          {formatCurrency(state.stockData.price)}
                        </div>
                        <div className={`flex items-center gap-1 text-lg font-semibold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          {state.stockData.change >= 0 ? '+' : ''}{state.stockData.change.toFixed(2)} 
                          ({state.stockData.change >= 0 ? '+' : ''}{state.stockData.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        Last updated: {new Date(state.stockData.timestamp).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 copy-button"
                        >
                          <Copy size={16} />
                          Copy Data
                        </button>
                        <button
                          onClick={downloadData}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Overview View */}
                  {state.viewMode === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Open</div>
                        <div className="text-xl font-bold text-gray-800">
                          {formatCurrency(state.stockData.open)}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">High</div>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(state.stockData.high)}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Low</div>
                        <div className="text-xl font-bold text-red-600">
                          {formatCurrency(state.stockData.low)}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Previous Close</div>
                        <div className="text-xl font-bold text-gray-800">
                          {formatCurrency(state.stockData.previousClose)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chart View */}
                  {state.viewMode === 'chart' && (
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-800">Price Chart</h4>
                        <div className="flex gap-2 text-sm">
                          {['1D', '1W', '1M', '3M', '1Y'].map(period => (
                            <button
                              key={period}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                          <div>Interactive chart would appear here</div>
                          <div className="text-sm">Mock data - real implementation would show price history</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details View */}
                  {state.viewMode === 'details' && (
                    <div className="bg-white border-2 border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800">Detailed Information</h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Market Cap:</span>
                              <span className="font-semibold text-gray-800">
                                {formatCurrency(state.stockData.marketCap)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Volume:</span>
                              <span className="font-semibold text-gray-800">
                                {formatNumber(state.stockData.volume)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">52W High:</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(state.stockData.yearHigh)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">52W Low:</span>
                              <span className="font-semibold text-red-600">
                                {formatCurrency(state.stockData.yearLow)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">P/E Ratio:</span>
                              <span className="font-semibold text-gray-800">
                                {state.stockData.peRatio.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Dividend Yield:</span>
                              <span className="font-semibold text-gray-800">
                                {state.stockData.dividendYield.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Sector:</span>
                              <span className="font-semibold text-gray-800">
                                {state.stockData.sector}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Exchange:</span>
                              <span className="font-semibold text-gray-800">
                                {state.stockData.exchange}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Data State */}
              {!hasStockData && !state.error && !state.isFetching && (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-semibold mb-2">No Stock Data</div>
                  <div>Enter a stock symbol above to check current market data</div>
                </div>
              )}
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === 'watchlist' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">My Watchlist</h3>
                <div className="text-sm text-gray-600">
                  {state.watchlist.length} stocks
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {state.watchlist.map((item) => {
                  const isPositive = item.change >= 0;
                  return (
                    <div
                      key={item.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800">{item.companyName}</div>
                          <div className="text-sm text-gray-600 font-mono">{item.symbol}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">
                            {formatCurrency(item.price)}
                          </div>
                          <div className={`flex items-center gap-1 text-sm ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} 
                            ({item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-gray-500">
                          Last checked: {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setState(prev => ({ ...prev, symbol: item.symbol }));
                              setActiveTab('checker');
                              setTimeout(() => fetchStock(item.symbol), 100);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => removeFromWatchlist(item.symbol)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {state.watchlist.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Star size={48} className="mx-auto mb-4 opacity-50" />
                    <div>Your watchlist is empty</div>
                    <div className="text-sm">Add stocks to your watchlist to track them</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Search History</h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.history.map((item) => {
                  const isPositive = item.change >= 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="font-mono font-semibold text-gray-800">{item.symbol}</div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setState(prev => ({ ...prev, symbol: item.symbol }));
                            setActiveTab('checker');
                            setTimeout(() => fetchStock(item.symbol), 100);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Check Again
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} 
                          ({item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                        </span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
                
                {state.history.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No search history yet</div>
                    <div className="text-sm">Your stock checks will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Stock Presets</h3>
                <button
                  onClick={saveAsPreset}
                  disabled={!state.symbol}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  Save Current as Preset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800">{preset.name}</h4>
                      <button
                        onClick={() => removePreset(preset.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2 mb-3">
                      {preset.symbols.map((symbol, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {symbol}
                          </code>
                          <button
                            onClick={() => {
                              setState(prev => ({ ...prev, symbol: symbol }));
                              setActiveTab('checker');
                              setTimeout(() => fetchStock(symbol), 100);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Check
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {presets.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No presets saved yet</div>
                    <div className="text-sm">Save your frequent stock symbols as presets</div>
                  </div>
                )}
              </div>
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
                        onClick={() => updateSettings('theme', color)}
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
                      onClick={() => updateSettings('autoRefresh', !settings.autoRefresh)}
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
                    <h4 className="font-semibold text-gray-800 mb-3">Refresh Interval</h4>
                    <select
                      value={settings.refreshInterval}
                      onChange={(e) => updateSettings('refreshInterval', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value={15000}>15 seconds</option>
                      <option value={30000}>30 seconds</option>
                      <option value={60000}>1 minute</option>
                      <option value={300000}>5 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Show Percent Change</h4>
                    <button
                      onClick={() => updateSettings('showPercentChange', !settings.showPercentChange)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showPercentChange 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <TrendingUp size={16} />
                      Percent Change {settings.showPercentChange ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Show Volume</h4>
                    <button
                      onClick={() => updateSettings('showVolume', !settings.showVolume)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showVolume 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Activity size={16} />
                      Volume {settings.showVolume ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">About Stock Data</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Stock Market Data</strong> provides real-time or delayed information 
                      about publicly traded companies, ETFs, and other financial instruments.
                    </p>
                    <p>
                      <strong>Common Uses:</strong> Investment research, portfolio tracking, 
                      market analysis, trading decisions, and financial education.
                    </p>
                    <p>
                      <strong>Key Metrics:</strong> Price, volume, market capitalization, 
                      P/E ratio, dividend yield, and 52-week high/low provide comprehensive 
                      insights into company performance.
                    </p>
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
          <div className="font-semibold text-gray-800">Real-time Data</div>
          <div className="text-sm text-gray-600">Live stock prices & changes</div>
        </div>
        <div className="text-center p-4">
          <Star className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Watchlist</div>
          <div className="text-sm text-gray-600">Track favorite stocks</div>
        </div>
        <div className="text-center p-4">
          <BarChart3 className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Views</div>
          <div className="text-sm text-gray-600">Overview, charts & details</div>
        </div>
        <div className="text-center p-4">
          <Bell className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Auto Refresh</div>
          <div className="text-sm text-gray-600">Stay updated automatically</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Stock Checker Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use the <strong>watchlist</strong> to track your favorite stocks and monitor their performance</li>
          <li>• Enable <strong>auto-refresh</strong> to get real-time updates on stock prices</li>
          <li>• Switch between <strong>different view modes</strong> to see overview data, charts, or detailed metrics</li>
          <li>• Use <strong>presets</strong> for quick access to frequently checked stocks and sectors</li>
          <li>• Monitor key metrics like <strong>P/E ratio, volume, and market cap</strong> for better analysis</li>
          <li>• Perfect for <strong>investors, traders, and financial enthusiasts</strong></li>
          <li>• Combine with <strong>technical analysis tools</strong> for comprehensive market insights</li>
        </ul>
      </div>
    </div>
  );
};

export default StockChecker;