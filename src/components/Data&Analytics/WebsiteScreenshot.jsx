import { useState, useEffect, useRef } from 'react';
import { Camera, Download, Upload, Settings, Save, Trash2, Zap, Eye, EyeOff, Copy, CheckCircle, AlertTriangle, RotateCcw, Link, Image, Monitor, Smartphone, Tablet, RefreshCw, Clock, Globe } from 'lucide-react';

const WebsiteScreenshot = () => {
  const [state, setState] = useState({
    url: '',
    screenshotUrl: '',
    isCapturing: false,
    error: null,
    viewMode: 'desktop', // 'desktop', 'mobile', 'tablet'
    history: [],
    currentScreenshot: null,
    captureSettings: {
      width: 1920,
      height: 1080,
      fullPage: false,
      delay: 2000,
      quality: 90
    }
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoCapture: false,
    saveToHistory: true,
    showPreview: true,
    defaultDevice: 'desktop',
    imageFormat: 'png',
    compression: 80
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Popular Websites',
      urls: [
        'https://google.com',
        'https://github.com',
        'https://stackoverflow.com'
      ]
    },
    {
      id: 2,
      name: 'News Sites',
      urls: [
        'https://bbc.com',
        'https://cnn.com',
        'https://reuters.com'
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('capture');
  const urlInputRef = useRef(null);
  const screenshotRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('websiteScreenshotHistory');
    const savedSettings = localStorage.getItem('websiteScreenshotSettings');
    const savedPresets = localStorage.getItem('websiteScreenshotPresets');
    
    if (savedHistory) setState(prev => ({ ...prev, history: JSON.parse(savedHistory) }));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('websiteScreenshotHistory', JSON.stringify(state.history));
    localStorage.setItem('websiteScreenshotSettings', JSON.stringify(settings));
    localStorage.setItem('websiteScreenshotPresets', JSON.stringify(presets));
  }, [state.history, settings, presets]);

  // Validate URL
  const validateURL = (url) => {
    if (!url.trim()) {
      return { isValid: false, error: 'URL cannot be empty' };
    }

    try {
      // Add protocol if missing
      let urlToValidate = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToValidate = 'https://' + url;
      }

      new URL(urlToValidate);
      return { 
        isValid: true, 
        error: null,
        formattedUrl: urlToValidate
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Please enter a valid URL',
        formattedUrl: null
      };
    }
  };

  // Mock screenshot capture function (in real app, this would call an API)
  const captureScreenshot = async (url, deviceType = 'desktop') => {
    // Simulate API delay
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Mock screenshot URL based on device type
    const mockScreenshots = {
      desktop: `https://picsum.photos/1920/1080?random=${Date.now()}`,
      mobile: `https://picsum.photos/375/667?random=${Date.now()}`,
      tablet: `https://picsum.photos/768/1024?random=${Date.now()}`
    };

    return {
      id: Date.now(),
      url: url,
      screenshotUrl: mockScreenshots[deviceType],
      device: deviceType,
      timestamp: new Date().toISOString(),
      dimensions: getDeviceDimensions(deviceType),
      size: Math.floor(Math.random() * 500000) + 100000, // Random size between 100KB-600KB
      format: settings.imageFormat
    };
  };

  // Get device dimensions
  const getDeviceDimensions = (deviceType) => {
    const dimensions = {
      desktop: { width: 1920, height: 1080 },
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 }
    };
    return dimensions[deviceType] || dimensions.desktop;
  };

  // Capture screenshot
  const capture = async (customUrl = null) => {
    const urlToCapture = customUrl || state.url;
    
    const validation = validateURL(urlToCapture);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.error
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isCapturing: true, 
      error: null,
      url: validation.formattedUrl
    }));

    try {
      const screenshot = await captureScreenshot(validation.formattedUrl, state.viewMode);
      
      setState(prev => ({
        ...prev,
        screenshotUrl: screenshot.screenshotUrl,
        currentScreenshot: screenshot,
        isCapturing: false,
        history: settings.saveToHistory ? [screenshot, ...prev.history.slice(0, 49)] : prev.history
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to capture screenshot',
        isCapturing: false,
        screenshotUrl: '',
        currentScreenshot: null
      }));
    }
  };

  // Quick capture actions
  const captureCurrentURL = () => {
    if (state.url) {
      capture();
    }
  };

  const captureExample = (exampleUrl) => {
    setState(prev => ({ ...prev, url: exampleUrl }));
    setTimeout(() => capture(exampleUrl), 100);
  };

  // Handle file upload (URL list)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const urls = content.split('\n')
        .map(url => url.trim())
        .filter(url => validateURL(url).isValid)
        .slice(0, 5); // Limit to first 5 valid URLs
      
      if (urls.length > 0) {
        setState(prev => ({ ...prev, url: urls[0] }));
        // Could implement batch capture here
      }
    };
    reader.readAsText(file);
  };

  // Download screenshot
  const downloadScreenshot = () => {
    if (!state.currentScreenshot) return;

    const link = document.createElement('a');
    link.href = state.screenshotUrl;
    link.download = `screenshot-${state.currentScreenshot.url.replace(/^https?:\/\//, '')}-${Date.now()}.${settings.imageFormat}`;
    link.click();
  };

  // Copy screenshot to clipboard
  const copyToClipboard = async () => {
    if (!state.screenshotUrl) return;

    try {
      const response = await fetch(state.screenshotUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      // Show success feedback
      const button = document.querySelector('.copy-button');
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<CheckCircle size={16} /> Copied!';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to copy image to clipboard'
      }));
    }
  };

  // Clear history
  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
  };

  // Update capture settings
  const updateCaptureSettings = (key, value) => {
    setState(prev => ({
      ...prev,
      captureSettings: {
        ...prev.captureSettings,
        [key]: value
      }
    }));
  };

  // Load preset
  const loadPreset = (preset) => {
    if (preset.urls && preset.urls.length > 0) {
      setState(prev => ({ ...prev, url: preset.urls[0] }));
    }
    setActiveTab('capture');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name || !state.url) return;

    const newPreset = {
      id: Date.now(),
      name,
      urls: [state.url]
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

  // Get device icon
  const getDeviceIcon = (deviceType) => {
    const icons = {
      desktop: Monitor,
      mobile: Smartphone,
      tablet: Tablet
    };
    return icons[deviceType] || Monitor;
  };

  const theme = getThemeColors();
  const hasScreenshot = state.currentScreenshot && state.screenshotUrl;

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Camera className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Website Screenshot</h2>
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
                { id: 'capture', name: 'Capture', icon: Camera },
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
            <h3 className="font-semibold text-gray-800 mb-3">Quick Capture</h3>
            <div className="space-y-2">
              <button
                onClick={captureCurrentURL}
                disabled={!state.url || state.isCapturing}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Camera size={16} />
                Capture Screenshot
              </button>
              <button
                onClick={downloadScreenshot}
                disabled={!hasScreenshot}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, url: '', screenshotUrl: '', currentScreenshot: null }))}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear
              </button>
            </div>
          </div>

          {/* Device Selection */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Device View</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'desktop', icon: Monitor, label: 'Desktop' },
                  { type: 'tablet', icon: Tablet, label: 'Tablet' },
                  { type: 'mobile', icon: Smartphone, label: 'Mobile' }
                ].map(device => {
                  const IconComponent = device.icon;
                  return (
                    <button
                      key={device.type}
                      onClick={() => setState(prev => ({ ...prev, viewMode: device.type }))}
                      className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                        state.viewMode === device.type 
                          ? `border-${theme.primary}-500 bg-${theme.primary}-50` 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <IconComponent size={20} className={state.viewMode === device.type ? `text-${theme.primary}-600` : 'text-gray-600'} />
                      <span className="text-xs font-medium">{device.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Batch Capture</h3>
            </div>
            <div className="p-4">
              <label className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer text-center justify-center">
                <Upload size={16} />
                Upload URL List
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Supports .txt files (one URL per line)
              </div>
            </div>
          </div>

          {/* Screenshot Info */}
          {hasScreenshot && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Screenshot Info</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Device:</span>
                  <span className="font-bold text-gray-800 capitalize">
                    {state.currentScreenshot.device}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-bold text-gray-800">
                    {state.currentScreenshot.dimensions.width}×{state.currentScreenshot.dimensions.height}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-bold text-gray-800">
                    {(state.currentScreenshot.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-bold text-gray-800 uppercase">
                    {state.currentScreenshot.format}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Capture Tab */}
          {activeTab === 'capture' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* URL Input */}
              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        ref={urlInputRef}
                        value={state.url}
                        onChange={(e) => setState(prev => ({ ...prev, url: e.target.value, error: null }))}
                        placeholder="Enter website URL (e.g., https://example.com)"
                        className="w-full px-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && capture()}
                      />
                      <button
                        onClick={() => capture()}
                        disabled={!state.url || state.isCapturing}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600 transition disabled:opacity-50"
                      >
                        {state.isCapturing ? (
                          <RefreshCw size={20} className="animate-spin" />
                        ) : (
                          <Camera size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => capture()}
                    disabled={!state.url || state.isCapturing}
                    className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                  >
                    {state.isCapturing ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Capturing...
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
                        Capture
                      </>
                    )}
                  </button>
                </div>

                {/* Quick URL Examples */}
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-600">Try:</span>
                  {['google.com', 'github.com', 'stackoverflow.com', 'wikipedia.org'].map(url => (
                    <button
                      key={url}
                      onClick={() => captureExample(url)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                    >
                      {url}
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

              {/* Screenshot Display */}
              {hasScreenshot && (
                <div className="space-y-6">
                  {/* Screenshot Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {state.currentScreenshot.url}
                        </h3>
                        <p className="text-gray-600">
                          Captured at {new Date(state.currentScreenshot.timestamp).toLocaleString()} • 
                          <span className="capitalize"> {state.currentScreenshot.device} view</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 copy-button"
                        >
                          <Copy size={16} />
                          Copy Image
                        </button>
                        <button
                          onClick={downloadScreenshot}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Screenshot Preview */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-gray-600" />
                        <span className="font-semibold text-gray-800">Screenshot Preview</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="capitalize">{state.currentScreenshot.device}</span>
                        <span>•</span>
                        <span>{state.currentScreenshot.dimensions.width}×{state.currentScreenshot.dimensions.height}</span>
                      </div>
                    </div>
                    <div className={`p-4 bg-gray-100 flex justify-center ${
                      state.currentScreenshot.device === 'mobile' ? 'max-w-sm mx-auto' : ''
                    }`}>
                      <img
                        ref={screenshotRef}
                        src={state.screenshotUrl}
                        alt={`Screenshot of ${state.currentScreenshot.url}`}
                        className={`rounded-lg shadow-lg max-w-full ${
                          state.currentScreenshot.device === 'mobile' ? 'border-8 border-black rounded-3xl' :
                          state.currentScreenshot.device === 'tablet' ? 'border-4 border-gray-400 rounded-xl' :
                          'border-2 border-gray-300'
                        }`}
                        style={{
                          maxHeight: '70vh',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>

                  {/* Capture Settings */}
                  <div className="border-2 border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800">Capture Settings</h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Quality
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={state.captureSettings.quality}
                            onChange={(e) => updateCaptureSettings('quality', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Quality: {state.captureSettings.quality}%
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capture Delay
                          </label>
                          <select
                            value={state.captureSettings.delay}
                            onChange={(e) => updateCaptureSettings('delay', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          >
                            <option value={1000}>1 second</option>
                            <option value={2000}>2 seconds</option>
                            <option value={3000}>3 seconds</option>
                            <option value={5000}>5 seconds</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Screenshot State */}
              {!hasScreenshot && !state.error && !state.isCapturing && (
                <div className="text-center py-12 text-gray-500">
                  <Camera size={48} className="mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-semibold mb-2">No Screenshot Captured</div>
                  <div>Enter a website URL above to capture a screenshot</div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Screenshot History</h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {state.history.map((item) => {
                  const DeviceIcon = getDeviceIcon(item.device);
                  return (
                    <div
                      key={item.id}
                      className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        <img
                          src={item.screenshotUrl}
                          alt={`Screenshot of ${item.url}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.device === 'desktop' ? 'bg-blue-100 text-blue-800' :
                            item.device === 'tablet' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            <DeviceIcon size={12} className="inline mr-1" />
                            {item.device}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-800 truncate mb-1">
                          {item.url}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          <span>{item.dimensions.width}×{item.dimensions.height}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setState(prev => ({
                                ...prev,
                                url: item.url,
                                screenshotUrl: item.screenshotUrl,
                                currentScreenshot: item,
                                viewMode: item.device
                              }));
                              setActiveTab('capture');
                            }}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = item.screenshotUrl;
                              link.download = `screenshot-${item.url.replace(/^https?:\/\//, '')}-${item.id}.${item.format}`;
                              link.click();
                            }}
                            className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {state.history.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No screenshot history yet</div>
                    <div className="text-sm">Your captured screenshots will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Website Presets</h3>
                <button
                  onClick={saveAsPreset}
                  disabled={!state.url}
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
                      {preset.urls.map((url, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded truncate flex-1 mr-2">
                            {url}
                          </code>
                          <button
                            onClick={() => {
                              setState(prev => ({ ...prev, url: url }));
                              setActiveTab('capture');
                              setTimeout(() => capture(url), 100);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap"
                          >
                            Capture
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
                    <div className="text-sm">Save your frequent websites as presets</div>
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

                {/* Capture Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Auto Save to History</h4>
                    <button
                      onClick={() => updateSettings('saveToHistory', !settings.saveToHistory)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.saveToHistory 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Save size={16} />
                      Save History {settings.saveToHistory ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Default Device</h4>
                    <select
                      value={settings.defaultDevice}
                      onChange={(e) => updateSettings('defaultDevice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="desktop">Desktop</option>
                      <option value="tablet">Tablet</option>
                      <option value="mobile">Mobile</option>
                    </select>
                  </div>
                </div>

                {/* Image Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Image Format</h4>
                    <select
                      value={settings.imageFormat}
                      onChange={(e) => updateSettings('imageFormat', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="png">PNG (High Quality)</option>
                      <option value="jpg">JPG (Compressed)</option>
                      <option value="webp">WebP (Modern)</option>
                    </select>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Image Compression</h4>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.compression}
                      onChange={(e) => updateSettings('compression', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      Compression: {settings.compression}%
                    </div>
                  </div>
                </div>

                {/* Screenshot Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">About Website Screenshots</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Website Screenshots</strong> allow you to capture and save visual representations 
                      of web pages for documentation, monitoring, and analysis purposes.
                    </p>
                    <p>
                      <strong>Common Uses:</strong> Website monitoring, design verification, 
                      content archiving, performance testing, and competitive analysis.
                    </p>
                    <p>
                      <strong>Best Practices:</strong> Use appropriate device views for testing responsive designs, 
                      consider capture delays for dynamic content, and choose the right image format for your needs.
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
          <Camera className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multi-Device</div>
          <div className="text-sm text-gray-600">Desktop, tablet & mobile views</div>
        </div>
        <div className="text-center p-4">
          <Download className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">High Quality</div>
          <div className="text-sm text-gray-600">Full resolution screenshots</div>
        </div>
        <div className="text-center p-4">
          <Clock className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">History</div>
          <div className="text-sm text-gray-600">Track all your captures</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Presets</div>
          <div className="text-sm text-gray-600">Save frequent websites</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Screenshot Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <strong>different device views</strong> to test responsive design and mobile compatibility</li>
          <li>• Adjust <strong>capture delay</strong> to ensure dynamic content loads completely</li>
          <li>• <strong>Save frequent websites</strong> as presets for quick monitoring and comparison</li>
          <li>• Use <strong>appropriate image formats</strong>: PNG for quality, JPG for size, WebP for modern browsers</li>
          <li>• Enable <strong>auto-save to history</strong> to keep track of all your captures</li>
          <li>• Perfect for <strong>website monitoring, design reviews, and content archiving</strong></li>
          <li>• Combine with <strong>batch processing</strong> for monitoring multiple websites efficiently</li>
        </ul>
      </div>
    </div>
  );
};

export default WebsiteScreenshot;