import { useState, useEffect, useRef } from 'react';
import { Gauge, Play, RotateCcw, Download, Upload, Wifi, Server, Clock, MapPin, Zap, Settings, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const SpeedTest = () => {
  const [state, setState] = useState({
    isTesting: false,
    testPhase: 'idle', // 'idle', 'ping', 'download', 'upload', 'complete'
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    jitter: 0,
    progress: 0,
    dataUsed: 0,
    serverInfo: null,
    error: null
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoStart: false,
    testDuration: 10, // seconds
    maxDownloadSize: 100, // MB
    maxUploadSize: 50, // MB
    serverLocation: 'auto',
    showAdvanced: false
  });

  const [history, setHistory] = useState([]);
  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Quick Test',
      testDuration: 5,
      maxDownloadSize: 50,
      maxUploadSize: 25
    },
    {
      id: 2,
      name: 'Comprehensive Test',
      testDuration: 30,
      maxDownloadSize: 200,
      maxUploadSize: 100
    }
  ]);

  const [servers] = useState([
    { id: 'auto', name: 'Auto (Best)', location: 'Automatic', distance: 0 },
    { id: 'nyc', name: 'New York', location: 'New York, USA', distance: 100 },
    { id: 'london', name: 'London', location: 'London, UK', distance: 3500 },
    { id: 'tokyo', name: 'Tokyo', location: 'Tokyo, Japan', distance: 6700 },
    { id: 'sydney', name: 'Sydney', location: 'Sydney, Australia', distance: 9500 }
  ]);

  const [activeTab, setActiveTab] = useState('test');
  const testIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('speedTestHistory');
    const savedSettings = localStorage.getItem('speedTestSettings');
    const savedPresets = localStorage.getItem('speedTestPresets');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('speedTestHistory', JSON.stringify(history));
    localStorage.setItem('speedTestSettings', JSON.stringify(settings));
    localStorage.setItem('speedTestPresets', JSON.stringify(presets));
  }, [history, settings, presets]);

  // Simulate network latency
  const simulateLatency = (baseLatency, distance) => {
    const distanceFactor = distance / 1000; // km
    const randomVariation = Math.random() * 10 - 5; // -5ms to +5ms
    return baseLatency + distanceFactor * 0.02 + randomVariation;
  };

  // Simulate download speed test
  const simulateDownloadTest = async () => {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalSize = settings.maxDownloadSize * 1024 * 1024; // Convert MB to bytes
    let downloaded = 0;
    
    startTimeRef.current = Date.now();
    
    return new Promise((resolve) => {
      const downloadChunk = () => {
        if (downloaded >= totalSize || !state.isTesting) {
          resolve(downloaded);
          return;
        }

        // Simulate network conditions
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const currentSpeed = Math.min(
          settings.maxDownloadSize * 0.8, // Base speed
          settings.maxDownloadSize * (1 - Math.exp(-elapsed / 2)) // Acceleration curve
        );

        const chunkDownloadTime = (chunkSize / (currentSpeed * 125000)); // Convert Mbps to bytes/ms
        const actualTime = chunkDownloadTime * (0.8 + Math.random() * 0.4); // Random variation

        setTimeout(() => {
          downloaded += chunkSize;
          const progress = (downloaded / totalSize) * 100;
          const currentSpeedMbps = (chunkSize * 8) / (actualTime * 1000000); // Convert to Mbps

          setState(prev => ({
            ...prev,
            downloadSpeed: currentSpeedMbps,
            progress: Math.min(progress, 100),
            dataUsed: prev.dataUsed + (chunkSize / (1024 * 1024)) // MB
          }));

          downloadChunk();
        }, actualTime);
      };

      downloadChunk();
    });
  };

  // Simulate upload speed test
  const simulateUploadTest = async () => {
    const chunkSize = 512 * 1024; // 512KB chunks
    const totalSize = settings.maxUploadSize * 1024 * 1024; // Convert MB to bytes
    let uploaded = 0;
    
    startTimeRef.current = Date.now();
    
    return new Promise((resolve) => {
      const uploadChunk = () => {
        if (uploaded >= totalSize || !state.isTesting) {
          resolve(uploaded);
          return;
        }

        // Upload is typically slower than download
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const currentSpeed = Math.min(
          settings.maxUploadSize * 0.6, // Base speed (60% of download)
          settings.maxUploadSize * (1 - Math.exp(-elapsed / 3)) // Slower acceleration
        );

        const chunkUploadTime = (chunkSize / (currentSpeed * 125000));
        const actualTime = chunkUploadTime * (0.7 + Math.random() * 0.6); // More variation

        setTimeout(() => {
          uploaded += chunkSize;
          const progress = 50 + (uploaded / totalSize) * 50; // Upload is second half
          const currentSpeedMbps = (chunkSize * 8) / (actualTime * 1000000);

          setState(prev => ({
            ...prev,
            uploadSpeed: currentSpeedMbps,
            progress: Math.min(progress, 100),
            dataUsed: prev.dataUsed + (chunkSize / (1024 * 1024))
          }));

          uploadChunk();
        }, actualTime);
      };

      uploadChunk();
    });
  };

  // Measure ping and jitter
  const measurePing = async () => {
    const selectedServer = servers.find(s => s.id === settings.serverLocation) || servers[0];
    const basePing = simulateLatency(15, selectedServer.distance);
    
    // Measure multiple times for accuracy
    const measurements = [];
    for (let i = 0; i < 10; i++) {
      if (!state.isTesting) break;
      
      const ping = simulateLatency(basePing, selectedServer.distance);
      measurements.push(ping);
      
      setState(prev => ({ 
        ...prev, 
        ping: Math.round(ping),
        progress: (i / 10) * 25 // Ping is first quarter
      }));
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Calculate jitter (variation in ping times)
    if (measurements.length > 1) {
      const jitter = measurements.reduce((acc, ping, index, arr) => {
        if (index === 0) return 0;
        return acc + Math.abs(ping - arr[index - 1]);
      }, 0) / (measurements.length - 1);

      setState(prev => ({ ...prev, jitter: Math.round(jitter * 100) / 100 }));
    }

    return measurements[measurements.length - 1];
  };

  // Start speed test
  const startSpeedTest = async () => {
    if (state.isTesting) return;

    setState({
      isTesting: true,
      testPhase: 'ping',
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      jitter: 0,
      progress: 0,
      dataUsed: 0,
      serverInfo: servers.find(s => s.id === settings.serverLocation) || servers[0],
      error: null
    });

    try {
      // Phase 1: Ping Test
      await measurePing();
      if (!state.isTesting) return;

      setState(prev => ({ ...prev, testPhase: 'download', progress: 25 }));

      // Phase 2: Download Test
      await simulateDownloadTest();
      if (!state.isTesting) return;

      setState(prev => ({ ...prev, testPhase: 'upload', progress: 75 }));

      // Phase 3: Upload Test
      await simulateUploadTest();
      if (!state.isTesting) return;

      // Test Complete
      setState(prev => ({ 
        ...prev, 
        testPhase: 'complete', 
        progress: 100,
        isTesting: false 
      }));

      // Add to history
      addToHistory();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Speed test failed. Please try again.',
        isTesting: false,
        testPhase: 'idle'
      }));
    }
  };

  // Stop speed test
  const stopSpeedTest = () => {
    setState(prev => ({ 
      ...prev, 
      isTesting: false, 
      testPhase: 'idle',
      progress: 0 
    }));
    
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
  };

  // Add to history
  const addToHistory = () => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      download: Math.round(state.downloadSpeed * 100) / 100,
      upload: Math.round(state.uploadSpeed * 100) / 100,
      ping: state.ping,
      jitter: state.jitter,
      server: state.serverInfo?.name || 'Auto'
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
  };

  // Reset test
  const resetTest = () => {
    stopSpeedTest();
    setState({
      isTesting: false,
      testPhase: 'idle',
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      jitter: 0,
      progress: 0,
      dataUsed: 0,
      serverInfo: null,
      error: null
    });
  };

  // Load preset
  const loadPreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      testDuration: preset.testDuration,
      maxDownloadSize: preset.maxDownloadSize,
      maxUploadSize: preset.maxUploadSize
    }));
    setActiveTab('test');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset = {
      id: Date.now(),
      name,
      testDuration: settings.testDuration,
      maxDownloadSize: settings.maxDownloadSize,
      maxUploadSize: settings.maxUploadSize
    };

    setPresets(prev => [newPreset, ...prev]);
  };

  // Remove preset
  const removePreset = (id) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
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

  // Format speed with units
  const formatSpeed = (speed) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(2)} Gbps`;
    }
    return `${speed.toFixed(2)} Mbps`;
  };

  // Get speed quality
  const getSpeedQuality = (speed, type) => {
    const thresholds = {
      download: { excellent: 100, good: 50, fair: 25, poor: 10 },
      upload: { excellent: 50, good: 25, fair: 10, poor: 5 },
      ping: { excellent: 20, good: 50, fair: 100, poor: 200 }
    };

    const threshold = thresholds[type];
    if (!threshold) return 'unknown';

    if (type === 'ping') {
      if (speed <= threshold.excellent) return 'excellent';
      if (speed <= threshold.good) return 'good';
      if (speed <= threshold.fair) return 'fair';
      return 'poor';
    } else {
      if (speed >= threshold.excellent) return 'excellent';
      if (speed >= threshold.good) return 'good';
      if (speed >= threshold.fair) return 'fair';
      return 'poor';
    }
  };

  // Get quality color
  const getQualityColor = (quality) => {
    const colors = {
      excellent: 'green',
      good: 'blue',
      fair: 'yellow',
      poor: 'red',
      unknown: 'gray'
    };
    return colors[quality] || 'gray';
  };

  const theme = getThemeColors();
  const downloadQuality = getSpeedQuality(state.downloadSpeed, 'download');
  const uploadQuality = getSpeedQuality(state.uploadSpeed, 'upload');
  const pingQuality = getSpeedQuality(state.ping, 'ping');

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Gauge className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Internet Speed Test</h2>
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
                { id: 'test', name: 'Speed Test', icon: Gauge },
                { id: 'history', name: 'Test History', icon: Save },
                { id: 'presets', name: 'Test Presets', icon: Save },
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
                onClick={startSpeedTest}
                disabled={state.isTesting}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Play size={16} />
                {state.isTesting ? 'Testing...' : 'Start Test'}
              </button>
              <button
                onClick={stopSpeedTest}
                disabled={!state.isTesting}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Stop Test
              </button>
              <button
                onClick={resetTest}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* Server Info */}
          {state.serverInfo && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Server Info</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">{state.serverInfo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-600">{state.serverInfo.location}</span>
                </div>
                {state.serverInfo.distance > 0 && (
                  <div className="text-xs text-gray-500">
                    Distance: {state.serverInfo.distance} km
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Stats */}
          {state.isTesting && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Test Statistics</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data Used:</span>
                  <span className="font-bold text-gray-800">{state.dataUsed.toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-bold text-gray-800">{Math.round(state.progress)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phase:</span>
                  <span className="font-bold text-gray-800 capitalize">{state.testPhase}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Speed Test Tab */}
          {activeTab === 'test' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Progress Bar */}
              {state.isTesting && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {state.testPhase === 'ping' && 'Measuring Ping...'}
                      {state.testPhase === 'download' && 'Testing Download Speed...'}
                      {state.testPhase === 'upload' && 'Testing Upload Speed...'}
                      {state.testPhase === 'complete' && 'Test Complete!'}
                    </span>
                    <span className="text-sm text-gray-600">{Math.round(state.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-${theme.primary}-500 transition-all duration-500`}
                      style={{ width: `${state.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Speed Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Download Speed */}
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <Download className="mx-auto text-blue-600 mb-3" size={32} />
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatSpeed(state.downloadSpeed)}
                  </div>
                  <div className="text-lg font-semibold text-blue-800 mb-2">Download</div>
                  <div className={`text-xs px-2 py-1 rounded-full bg-${getQualityColor(downloadQuality)}-100 text-${getQualityColor(downloadQuality)}-800`}>
                    {downloadQuality.toUpperCase()}
                  </div>
                </div>
                
                {/* Upload Speed */}
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <Upload className="mx-auto text-green-600 mb-3" size={32} />
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatSpeed(state.uploadSpeed)}
                  </div>
                  <div className="text-lg font-semibold text-green-800 mb-2">Upload</div>
                  <div className={`text-xs px-2 py-1 rounded-full bg-${getQualityColor(uploadQuality)}-100 text-${getQualityColor(uploadQuality)}-800`}>
                    {uploadQuality.toUpperCase()}
                  </div>
                </div>
                
                {/* Ping & Jitter */}
                <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <Wifi className="mx-auto text-purple-600 mb-3" size={32} />
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {state.ping} ms
                  </div>
                  <div className="text-lg font-semibold text-purple-800 mb-2">Ping</div>
                  <div className={`text-xs px-2 py-1 rounded-full bg-${getQualityColor(pingQuality)}-100 text-${getQualityColor(pingQuality)}-800 mb-1`}>
                    {pingQuality.toUpperCase()}
                  </div>
                  <div className="text-xs text-purple-600">Jitter: {state.jitter} ms</div>
                </div>
              </div>

              {/* Test Controls */}
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                <button
                  onClick={startSpeedTest}
                  disabled={state.isTesting}
                  className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                >
                  <Play size={20} />
                  {state.isTesting ? 'Testing in Progress...' : 'Start Speed Test'}
                </button>
                
                {state.testPhase === 'complete' && (
                  <button
                    onClick={saveAsPreset}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2"
                  >
                    <Save size={20} />
                    Save as Preset
                  </button>
                )}
              </div>

              {/* Error Display */}
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle size={16} />
                    <span className="font-medium">{state.error}</span>
                  </div>
                </div>
              )}

              {/* Test Complete Message */}
              {state.testPhase === 'complete' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle size={16} />
                    <span className="font-medium">Speed test completed successfully!</span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Your internet connection has been tested and results are saved to history.
                  </div>
                </div>
              )}

              {/* Server Selection */}
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Test Server</h4>
                <div className="flex flex-wrap gap-2">
                  {servers.map(server => (
                    <button
                      key={server.id}
                      onClick={() => updateSettings('serverLocation', server.id)}
                      className={`px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                        settings.serverLocation === server.id
                          ? `bg-${theme.primary}-600 text-white`
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Server size={14} />
                      {server.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Test History</h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((test, index) => (
                  <div
                    key={test.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          Test #{history.length - index}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(test.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{test.server}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatSpeed(test.download)}
                        </div>
                        <div className="text-sm text-gray-600">Download</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatSpeed(test.upload)}
                        </div>
                        <div className="text-sm text-gray-600">Upload</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {test.ping} ms
                        </div>
                        <div className="text-sm text-gray-600">Ping</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <span>Jitter: {test.jitter} ms</span>
                      <button
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            downloadSpeed: test.download,
                            uploadSpeed: test.upload,
                            ping: test.ping,
                            jitter: test.jitter,
                            testPhase: 'complete'
                          }));
                          setActiveTab('test');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Gauge size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No test history yet</div>
                    <div className="text-sm">Run a speed test to see results here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Test Presets</h3>
                <button
                  onClick={saveAsPreset}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
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
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-semibold">{preset.testDuration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Download Size:</span>
                        <span className="font-semibold">{preset.maxDownloadSize} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upload Size:</span>
                        <span className="font-semibold">{preset.maxUploadSize} MB</span>
                      </div>
                    </div>
                    <button
                      onClick={() => loadPreset(preset)}
                      className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                    >
                      Load Preset
                    </button>
                  </div>
                ))}
                
                {presets.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No presets saved yet</div>
                    <div className="text-sm">Save your test configurations as presets</div>
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

                {/* Test Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Test Duration: {settings.testDuration} seconds
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={settings.testDuration}
                      onChange={(e) => updateSettings('testDuration', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5s</span>
                      <span>60s</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Download Size: {settings.maxDownloadSize} MB
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={settings.maxDownloadSize}
                      onChange={(e) => updateSettings('maxDownloadSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10MB</span>
                      <span>500MB</span>
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Auto Start</h4>
                    <button
                      onClick={() => updateSettings('autoStart', !settings.autoStart)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.autoStart 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Zap size={16} />
                      Auto Start {settings.autoStart ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Advanced Metrics</h4>
                    <button
                      onClick={() => updateSettings('showAdvanced', !settings.showAdvanced)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showAdvanced 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Gauge size={16} />
                      Advanced {settings.showAdvanced ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Speed Quality Guide */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Speed Quality Guide</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="font-semibold mb-2">Download Speed</div>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span>Excellent:</span> <span className="text-green-600">100+ Mbps</span></div>
                        <div className="flex justify-between"><span>Good:</span> <span className="text-blue-600">50-100 Mbps</span></div>
                        <div className="flex justify-between"><span>Fair:</span> <span className="text-yellow-600">25-50 Mbps</span></div>
                        <div className="flex justify-between"><span>Poor:</span> <span className="text-red-600">Below 25 Mbps</span></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">Ping/Latency</div>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span>Excellent:</span> <span className="text-green-600">Below 20ms</span></div>
                        <div className="flex justify-between"><span>Good:</span> <span className="text-blue-600">20-50ms</span></div>
                        <div className="flex justify-between"><span>Fair:</span> <span className="text-yellow-600">50-100ms</span></div>
                        <div className="flex justify-between"><span>Poor:</span> <span className="text-red-600">Above 100ms</span></div>
                      </div>
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
          <Download className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Download Test</div>
          <div className="text-sm text-gray-600">Measure download speed</div>
        </div>
        <div className="text-center p-4">
          <Upload className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Upload Test</div>
          <div className="text-sm text-gray-600">Measure upload speed</div>
        </div>
        <div className="text-center p-4">
          <Wifi className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Ping & Jitter</div>
          <div className="text-sm text-gray-600">Measure latency</div>
        </div>
        <div className="text-center p-4">
          <Server className="mx-auto text-orange-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Servers</div>
          <div className="text-sm text-gray-600">Test from different locations</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🚀 Speed Test Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>Close other applications</strong> and browser tabs for accurate speed measurements</li>
          <li>• Use <strong>wired Ethernet connection</strong> instead of WiFi for the most reliable results</li>
          <li>• Test from <strong>different server locations</strong> to check connectivity to various regions</li>
          <li>• Run tests at <strong>different times of day</strong> to identify peak usage periods</li>
          <li>• Compare results with your <strong>internet plan's advertised speeds</strong></li>
          <li>• Use <strong>quick tests</strong> for frequent checks and <strong>comprehensive tests</strong> for detailed analysis</li>
          <li>• Monitor <strong>ping and jitter</strong> for gaming and video conferencing quality</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeedTest;