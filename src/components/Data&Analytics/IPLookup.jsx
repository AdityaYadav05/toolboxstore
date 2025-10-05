import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Globe, Wifi, Server, Clock, Copy, Download, Upload, Settings, Save, Trash2, Zap, Eye, EyeOff, ChevronRight, ChevronDown, RotateCcw, CheckCircle, AlertTriangle, Shield, Cpu, Navigation } from 'lucide-react';

const IPLookup = () => {
  const [state, setState] = useState({
    inputIP: '',
    searchHistory: [],
    isSearching: false,
    currentResult: null,
    error: null,
    viewMode: 'detailed', // 'detailed', 'compact', 'map'
    expandedSections: new Set(['location', 'network']),
    selectedIP: null
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoRefresh: false,
    cacheResults: true,
    showISP: true,
    showTimezone: true,
    showSecurity: true,
    defaultSearch: 'myip'
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Common IPs',
      ips: ['8.8.8.8', '1.1.1.1', '208.67.222.222']
    },
    {
      id: 2,
      name: 'Local Network',
      ips: ['192.168.1.1', '192.168.0.1', '10.0.0.1']
    }
  ]);

  const [activeTab, setActiveTab] = useState('lookup');
  const inputRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ipLookupHistory');
    const savedSettings = localStorage.getItem('ipLookupSettings');
    const savedPresets = localStorage.getItem('ipLookupPresets');
    
    if (savedHistory) setState(prev => ({ ...prev, searchHistory: JSON.parse(savedHistory) }));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ipLookupHistory', JSON.stringify(state.searchHistory));
    localStorage.setItem('ipLookupSettings', JSON.stringify(settings));
    localStorage.setItem('ipLookupPresets', JSON.stringify(presets));
  }, [state.searchHistory, settings, presets]);

  // Validate IP address
  const validateIP = (ip) => {
    if (ip === 'myip') return { isValid: true, type: 'current' };
    
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.');
      const valid = parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
      return { isValid: valid, type: valid ? 'ipv4' : 'invalid' };
    }
    
    if (ipv6Regex.test(ip)) {
      return { isValid: true, type: 'ipv6' };
    }
    
    return { isValid: false, type: 'invalid' };
  };

  // Mock IP lookup function (in real app, this would call an API)
  const lookupIP = async (ip) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Mock data based on IP
    const isCurrentIP = ip === 'myip';
    const ipToUse = isCurrentIP ? '203.0.113.1' : ip; // Example IP for current
    
    const mockData = {
      ip: ipToUse,
      type: ipToUse.includes(':') ? 'ipv6' : 'ipv4',
      location: {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'San Francisco',
        zipcode: '94107',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles'
      },
      network: {
        isp: 'Example ISP Inc.',
        org: 'Example Organization',
        as: 'AS12345 Example Network',
        domain: 'example.com'
      },
      security: {
        proxy: false,
        vpn: false,
        tor: false,
        hosting: true,
        threatLevel: 'low'
      },
      technical: {
        reverseDNS: `host-${ipToUse.replace(/\./g, '-')}.example.com`,
        anonymity: 'none'
      },
      timestamp: new Date().toISOString()
    };

    return mockData;
  };

  // Perform IP lookup
  const performLookup = async (ip = state.inputIP) => {
    if (!ip.trim()) return;

    const validation = validateIP(ip);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: 'Invalid IP address format',
        currentResult: null
      }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const result = await lookupIP(ip);
      
      setState(prev => ({
        ...prev,
        currentResult: result,
        isSearching: false,
        error: null,
        searchHistory: [
          {
            id: Date.now(),
            ip: result.ip,
            timestamp: result.timestamp,
            country: result.location.country,
            isp: result.network.isp
          },
          ...prev.searchHistory.slice(0, 49) // Keep last 50
        ]
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to lookup IP address',
        currentResult: null,
        isSearching: false
      }));
    }
  };

  // Quick lookup actions
  const lookupMyIP = () => {
    setState(prev => ({ ...prev, inputIP: 'myip' }));
    setTimeout(() => performLookup('myip'), 100);
  };

  const lookupLocalhost = () => {
    setState(prev => ({ ...prev, inputIP: '127.0.0.1' }));
    setTimeout(() => performLookup('127.0.0.1'), 100);
  };

  // Handle file upload (IP list)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const ips = content.split('\n')
        .map(ip => ip.trim())
        .filter(ip => validateIP(ip).isValid)
        .slice(0, 10); // Limit to first 10 valid IPs
      
      if (ips.length > 0) {
        setState(prev => ({ ...prev, inputIP: ips[0] }));
        // Could implement batch lookup here
      }
    };
    reader.readAsText(file);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show temporary success feedback
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

  // Download results
  const downloadResults = () => {
    if (!state.currentResult) return;

    const data = {
      lookup: state.currentResult,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-lookup-${state.currentResult.ip}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear history
  const clearHistory = () => {
    setState(prev => ({ ...prev, searchHistory: [] }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setState(prev => {
      const newExpandedSections = new Set(prev.expandedSections);
      if (newExpandedSections.has(section)) {
        newExpandedSections.delete(section);
      } else {
        newExpandedSections.add(section);
      }
      return { ...prev, expandedSections: newExpandedSections };
    });
  };

  // Load preset
  const loadPreset = (preset) => {
    if (preset.ips && preset.ips.length > 0) {
      setState(prev => ({ ...prev, inputIP: preset.ips[0] }));
    }
    setActiveTab('lookup');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name || !state.inputIP) return;

    const newPreset = {
      id: Date.now(),
      name,
      ips: [state.inputIP]
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

  // Get threat level color
  const getThreatColor = (level) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'red',
      critical: 'red'
    };
    return colors[level] || 'gray';
  };

  const theme = getThemeColors();
  const hasResult = state.currentResult && !state.error;

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Globe className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">IP Address Lookup</h2>
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
                { id: 'lookup', name: 'IP Lookup', icon: Search },
                { id: 'history', name: 'Search History', icon: Clock },
                { id: 'presets', name: 'IP Presets', icon: Save },
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
            <h3 className="font-semibold text-gray-800 mb-3">Quick Lookup</h3>
            <div className="space-y-2">
              <button
                onClick={lookupMyIP}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Wifi size={16} />
                My IP Address
              </button>
              <button
                onClick={lookupLocalhost}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Server size={16} />
                Localhost (127.0.0.1)
              </button>
              <button
                onClick={downloadResults}
                disabled={!hasResult}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Download Results
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Batch Lookup</h3>
            </div>
            <div className="p-4">
              <label className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2 cursor-pointer text-center justify-center">
                <Upload size={16} />
                Upload IP List
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Supports .txt files (one IP per line)
              </div>
            </div>
          </div>

          {/* IP Information */}
          {hasResult && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">IP Information</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">IP Version:</span>
                  <span className="font-bold text-gray-800">
                    {state.currentResult.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-bold text-gray-800">
                    {state.currentResult.location.country}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ISP:</span>
                  <span className="font-bold text-gray-800">
                    {state.currentResult.network.isp}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Threat Level:</span>
                  <span className={`font-bold text-${getThreatColor(state.currentResult.security.threatLevel)}-600`}>
                    {state.currentResult.security.threatLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Lookup Tab */}
          {activeTab === 'lookup' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Search Input */}
              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        value={state.inputIP}
                        onChange={(e) => setState(prev => ({ ...prev, inputIP: e.target.value }))}
                        placeholder="Enter IP address (e.g., 8.8.8.8) or 'myip' for your current IP"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                        onKeyPress={(e) => e.key === 'Enter' && performLookup()}
                      />
                      <button
                        onClick={() => performLookup()}
                        disabled={!state.inputIP || state.isSearching}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600 transition disabled:opacity-50"
                      >
                        <Search size={20} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => performLookup()}
                    disabled={!state.inputIP || state.isSearching}
                    className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                  >
                    {state.isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Lookup IP
                      </>
                    )}
                  </button>
                </div>

                {/* Quick IP Examples */}
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-600">Try:</span>
                  {['8.8.8.8', '1.1.1.1', 'myip', '127.0.0.1'].map(ip => (
                    <button
                      key={ip}
                      onClick={() => {
                        setState(prev => ({ ...prev, inputIP: ip }));
                        setTimeout(() => performLookup(ip), 100);
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                    >
                      {ip}
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

              {/* Results Display */}
              {hasResult && (
                <div className="space-y-6">
                  {/* IP Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 font-mono">
                          {state.currentResult.ip}
                        </h3>
                        <p className="text-gray-600">
                          Lookup performed at {new Date(state.currentResult.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(state.currentResult.ip)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition copy-button"
                          title="Copy IP"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={downloadResults}
                          className="p-2 text-gray-600 hover:text-green-600 transition"
                          title="Download Results"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="border-2 border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('location')}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="text-blue-600" size={20} />
                        <span className="font-semibold text-gray-800">Location Information</span>
                      </div>
                      {state.expandedSections.has('location') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {state.expandedSections.has('location') && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Country:</span>
                              <span className="font-semibold">{state.currentResult.location.country}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Region:</span>
                              <span className="font-semibold">{state.currentResult.location.region}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">City:</span>
                              <span className="font-semibold">{state.currentResult.location.city}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ZIP Code:</span>
                              <span className="font-semibold">{state.currentResult.location.zipcode}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Timezone:</span>
                              <span className="font-semibold">{state.currentResult.location.timezone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coordinates:</span>
                              <span className="font-semibold">
                                {state.currentResult.location.latitude}, {state.currentResult.location.longitude}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Network Information */}
                  <div className="border-2 border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('network')}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Wifi className="text-green-600" size={20} />
                        <span className="font-semibold text-gray-800">Network Information</span>
                      </div>
                      {state.expandedSections.has('network') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {state.expandedSections.has('network') && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ISP:</span>
                              <span className="font-semibold">{state.currentResult.network.isp}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Organization:</span>
                              <span className="font-semibold">{state.currentResult.network.org}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">AS Number:</span>
                              <span className="font-semibold">{state.currentResult.network.as}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Domain:</span>
                              <span className="font-semibold">{state.currentResult.network.domain}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security Information */}
                  <div className="border-2 border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('security')}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="text-purple-600" size={20} />
                        <span className="font-semibold text-gray-800">Security Information</span>
                      </div>
                      {state.expandedSections.has('security') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {state.expandedSections.has('security') && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-800">Proxy</div>
                            <div className={`text-${state.currentResult.security.proxy ? 'red' : 'green'}-600 font-bold`}>
                              {state.currentResult.security.proxy ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-800">VPN</div>
                            <div className={`text-${state.currentResult.security.vpn ? 'red' : 'green'}-600 font-bold`}>
                              {state.currentResult.security.vpn ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-800">TOR</div>
                            <div className={`text-${state.currentResult.security.tor ? 'red' : 'green'}-600 font-bold`}>
                              {state.currentResult.security.tor ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-800">Hosting</div>
                            <div className={`text-${state.currentResult.security.hosting ? 'blue' : 'gray'}-600 font-bold`}>
                              {state.currentResult.security.hosting ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Threat Level:</span>
                            <span className={`font-bold text-${getThreatColor(state.currentResult.security.threatLevel)}-600`}>
                              {state.currentResult.security.threatLevel.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Results State */}
              {!hasResult && !state.error && !state.isSearching && (
                <div className="text-center py-12 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-semibold mb-2">No IP Lookup Performed</div>
                  <div>Enter an IP address above to start looking up information</div>
                </div>
              )}
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
                {state.searchHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="font-mono font-semibold text-gray-800">{item.ip}</div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {item.country}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setState(prev => ({ ...prev, inputIP: item.ip }));
                          setActiveTab('lookup');
                          setTimeout(() => performLookup(item.ip), 100);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Lookup Again
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{item.isp}</span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                
                {state.searchHistory.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No search history yet</div>
                    <div className="text-sm">Your IP lookups will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">IP Presets</h3>
                <button
                  onClick={saveAsPreset}
                  disabled={!state.inputIP}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  Save Current as Preset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {preset.ips.map((ip, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {ip}
                          </code>
                          <button
                            onClick={() => {
                              setState(prev => ({ ...prev, inputIP: ip }));
                              setActiveTab('lookup');
                              setTimeout(() => performLookup(ip), 100);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Lookup
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {presets.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No presets saved yet</div>
                    <div className="text-sm">Save your frequent IP lookups as presets</div>
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

                {/* Lookup Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Cache Results</h4>
                    <button
                      onClick={() => updateSettings('cacheResults', !settings.cacheResults)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.cacheResults 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Save size={16} />
                      Cache Results {settings.cacheResults ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Show ISP Info</h4>
                    <button
                      onClick={() => updateSettings('showISP', !settings.showISP)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showISP 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Wifi size={16} />
                      ISP Info {settings.showISP ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Show Security</h4>
                    <button
                      onClick={() => updateSettings('showSecurity', !settings.showSecurity)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showSecurity 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Shield size={16} />
                      Security Info {settings.showSecurity ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Show Timezone</h4>
                    <button
                      onClick={() => updateSettings('showTimezone', !settings.showTimezone)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showTimezone 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Clock size={16} />
                      Timezone {settings.showTimezone ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* IP Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">About IP Lookup</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>IP Address Lookup</strong> provides detailed information about any IP address 
                      including geographic location, network provider, and security assessment.
                    </p>
                    <p>
                      <strong>Common Uses:</strong> Network troubleshooting, security analysis, 
                      geographic targeting, and understanding network infrastructure.
                    </p>
                    <p>
                      <strong>Privacy Note:</strong> IP lookups only reveal public information. 
                      For personal IP addresses, this typically shows your ISP's location, not your exact location.
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
          <Globe className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Geolocation</div>
          <div className="text-sm text-gray-600">Find IP location worldwide</div>
        </div>
        <div className="text-center p-4">
          <Wifi className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Network Info</div>
          <div className="text-sm text-gray-600">ISP and organization details</div>
        </div>
        <div className="text-center p-4">
          <Shield className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Security Check</div>
          <div className="text-sm text-gray-600">Proxy, VPN, and threat detection</div>
        </div>
        <div className="text-center p-4">
          <Clock className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">History & Presets</div>
          <div className="text-sm text-gray-600">Save and reuse IP lookups</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 IP Lookup Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <strong>"myip"</strong> to quickly lookup your current public IP address</li>
          <li>• Check <strong>security information</strong> to identify VPNs, proxies, and potential threats</li>
          <li>• <strong>Upload IP lists</strong> for batch processing and analysis</li>
          <li>• Save frequent IPs as <strong>presets</strong> for quick access and monitoring</li>
          <li>• Use <strong>different view modes</strong> to focus on specific information types</li>
          <li>• Perfect for <strong>network administration, security analysis, and development</strong></li>
          <li>• Combine with <strong>WHOIS lookup</strong> for complete domain and IP information</li>
        </ul>
      </div>
    </div>
  );
};

export default IPLookup;
