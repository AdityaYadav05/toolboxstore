import { useState, useEffect, useRef } from 'react';
import { Hash, Copy, CheckCircle, Download, Upload, Settings, Save, Trash2, Zap, Eye, EyeOff, Shield, Lock, Key, RotateCcw } from 'lucide-react';

const HashGenerator = () => {
  const [state, setState] = useState({
    inputText: '',
    outputText: '',
    isProcessing: false,
    copied: false,
    showInput: true,
    hashType: 'md5', // 'md5', 'sha1', 'sha256', 'sha512'
    salt: '',
    useSalt: false,
    iterations: 1
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoProcess: true,
    uppercase: false,
    encoding: 'hex', // 'hex', 'base64'
    chunkSize: 1024
  });

  const [history, setHistory] = useState([]);
  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Password Hash',
      input: 'mySecurePassword123',
      hashType: 'sha256',
      useSalt: true,
      salt: 'randomSalt123'
    },
    {
      id: 2,
      name: 'API Key Hash',
      input: 'sk_live_1234567890abcdef',
      hashType: 'sha512',
      useSalt: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('generator');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Hash algorithms implementation
  const hashAlgorithms = {
    md5: async (data) => {
      // Simple MD5 implementation (for demonstration)
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('MD5', dataBuffer);
      return hashBuffer;
    },
    sha1: async (data) => {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-1', dataBuffer);
      return hashBuffer;
    },
    sha256: async (data) => {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      return hashBuffer;
    },
    sha512: async (data) => {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
      return hashBuffer;
    }
  };

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('hashGeneratorHistory');
    const savedSettings = localStorage.getItem('hashGeneratorSettings');
    const savedPresets = localStorage.getItem('hashGeneratorPresets');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('hashGeneratorHistory', JSON.stringify(history));
    localStorage.setItem('hashGeneratorSettings', JSON.stringify(settings));
    localStorage.setItem('hashGeneratorPresets', JSON.stringify(presets));
  }, [history, settings, presets]);

  // Auto-process when input changes
  useEffect(() => {
    if (settings.autoProcess && state.inputText) {
      generateHash();
    }
  }, [state.inputText, state.hashType, state.salt, state.useSalt, state.iterations, settings.autoProcess]);

  // Convert array buffer to string
  const arrayBufferToString = (buffer, encoding = 'hex') => {
    const byteArray = new Uint8Array(buffer);
    
    if (encoding === 'base64') {
      return btoa(String.fromCharCode(...byteArray));
    }
    
    // Hex encoding
    return Array.from(byteArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Generate hash
  const generateHash = async () => {
    if (!state.inputText.trim()) {
      setState(prev => ({ ...prev, outputText: '' }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      let dataToHash = state.inputText;
      
      // Apply salt if enabled
      if (state.useSalt && state.salt) {
        dataToHash = dataToHash + state.salt;
      }

      // Apply iterations
      let hashBuffer;
      for (let i = 0; i < state.iterations; i++) {
        hashBuffer = await hashAlgorithms[state.hashType](dataToHash);
        if (i < state.iterations - 1) {
          dataToHash = arrayBufferToString(hashBuffer, settings.encoding);
        }
      }

      let hashString = arrayBufferToString(hashBuffer, settings.encoding);
      
      // Convert to uppercase if enabled
      if (settings.uppercase) {
        hashString = hashString.toUpperCase();
      }

      setState(prev => ({ 
        ...prev, 
        outputText: hashString,
        isProcessing: false
      }));

      // Add to history
      addToHistory(state.inputText, hashString, state.hashType);
    } catch (error) {
      console.error('Hash generation error:', error);
      setState(prev => ({ 
        ...prev, 
        outputText: 'Error generating hash',
        isProcessing: false
      }));
    }
  };

  // Add to history
  const addToHistory = (input, output, hashType) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
      output: output.slice(0, 32) + (output.length > 32 ? '...' : ''),
      hashType,
      length: output.length
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setState(prev => ({ 
        ...prev, 
        inputText: e.target.result 
      }));
    };
    reader.readAsText(file);
  };

  // Generate random salt
  const generateRandomSalt = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let salt = '';
    for (let i = 0; i < 16; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setState(prev => ({ ...prev, salt }));
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setState(prev => ({ ...prev, copied: true }));
      setTimeout(() => {
        setState(prev => ({ ...prev, copied: false }));
      }, 2000);
    });
  };

  // Download output as file
  const downloadOutput = () => {
    if (!state.outputText) return;

    const blob = new Blob([state.outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hash-${state.hashType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all
  const clearAll = () => {
    setState(prev => ({
      ...prev,
      inputText: '',
      outputText: '',
      salt: '',
      iterations: 1
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load preset
  const loadPreset = (preset) => {
    setState(prev => ({
      ...prev,
      inputText: preset.input,
      hashType: preset.hashType,
      useSalt: preset.useSalt || false,
      salt: preset.salt || ''
    }));
    setActiveTab('generator');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset = {
      id: Date.now(),
      name,
      input: state.inputText,
      hashType: state.hashType,
      useSalt: state.useSalt,
      salt: state.salt
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

  // Get hash algorithm info
  const getHashAlgorithmInfo = (type) => {
    const info = {
      md5: { name: 'MD5', bits: 128, security: 'Weak', color: 'red' },
      sha1: { name: 'SHA-1', bits: 160, security: 'Weak', color: 'orange' },
      sha256: { name: 'SHA-256', bits: 256, security: 'Strong', color: 'green' },
      sha512: { name: 'SHA-512', bits: 512, security: 'Very Strong', color: 'blue' }
    };
    return info[type] || info.md5;
  };

  const theme = getThemeColors();
  const algorithmInfo = getHashAlgorithmInfo(state.hashType);

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Hash className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Hash Generator</h2>
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
                { id: 'generator', name: 'Hash Generator', icon: Hash },
                { id: 'history', name: 'History', icon: Save },
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
                onClick={generateHash}
                disabled={!state.inputText || state.isProcessing}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={16} />
                Generate Hash
              </button>
              <button
                onClick={downloadOutput}
                disabled={!state.outputText}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Download Hash
              </button>
              <button
                onClick={clearAll}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">File Upload</h3>
            </div>
            <div className="p-4">
              <label className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer text-center justify-center">
                <Upload size={16} />
                Upload File
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500 mt-2 text-center">
                File content will be hashed
              </div>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Algorithm Info</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Algorithm:</span>
                <span className="font-bold text-gray-800">{algorithmInfo.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Output Size:</span>
                <span className="font-bold text-gray-800">{algorithmInfo.bits} bits</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Security:</span>
                <span className={`font-bold text-${algorithmInfo.color}-600`}>
                  {algorithmInfo.security}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hash Length:</span>
                <span className="font-bold text-gray-800">
                  {state.outputText ? state.outputText.length : 0} chars
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Generator Tab */}
          {activeTab === 'generator' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Algorithm Selector */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex gap-2">
                  {['md5', 'sha1', 'sha256', 'sha512'].map(algorithm => (
                    <button
                      key={algorithm}
                      onClick={() => setState(prev => ({ ...prev, hashType: algorithm }))}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                        state.hashType === algorithm
                          ? `bg-${theme.primary}-600 text-white`
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Shield size={16} />
                      {algorithm.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Salt */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.useSalt}
                      onChange={(e) => setState(prev => ({ ...prev, useSalt: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm font-semibold text-gray-700">Use Salt</label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={state.showInput ? "text" : "password"}
                      value={state.salt}
                      onChange={(e) => setState(prev => ({ ...prev, salt: e.target.value }))}
                      placeholder="Enter salt..."
                      disabled={!state.useSalt}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
                    />
                    <button
                      onClick={generateRandomSalt}
                      disabled={!state.useSalt}
                      className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm disabled:opacity-50"
                    >
                      <Key size={14} />
                    </button>
                  </div>
                </div>

                {/* Iterations */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Iterations</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={state.iterations}
                    onChange={(e) => setState(prev => ({ ...prev, iterations: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-end">
                  <button
                    onClick={() => setState(prev => ({ ...prev, showInput: !prev.showInput }))}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    {state.showInput ? <EyeOff size={16} /> : <Eye size={16} />}
                    {state.showInput ? 'Hide' : 'Show'} Input
                  </button>
                </div>
              </div>

              {/* Input/Output Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-800">
                      Input Text
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(state.inputText)}
                        disabled={!state.inputText}
                        className="p-2 text-gray-600 hover:text-blue-600 transition disabled:opacity-50"
                        title="Copy Input"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={state.inputText}
                      onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
                      placeholder="Enter text to generate hash..."
                      type={state.showInput ? "text" : "password"}
                      className="w-full h-48 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                    />
                    {state.inputText && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {state.inputText.length} chars
                      </div>
                    )}
                  </div>

                  {/* Input Preview */}
                  {state.inputText && !state.showInput && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="text-sm text-yellow-800">
                        <strong>Input hidden</strong> for security. Text length: {state.inputText.length} characters.
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-800">
                      {state.hashType.toUpperCase()} Hash
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(state.outputText)}
                        disabled={!state.outputText}
                        className={`p-2 transition disabled:opacity-50 ${
                          state.copied ? 'text-green-600' : 'text-gray-600 hover:text-blue-600'
                        }`}
                        title={state.copied ? 'Copied!' : 'Copy Hash'}
                      >
                        {state.copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={downloadOutput}
                        disabled={!state.outputText}
                        className="p-2 text-gray-600 hover:text-green-600 transition disabled:opacity-50"
                        title="Download Hash"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={state.outputText}
                      readOnly
                      placeholder="Hash will appear here..."
                      className="w-full h-48 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm bg-gray-50"
                    />
                    {state.isProcessing && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                        <div className="text-blue-600 font-semibold flex items-center gap-2">
                          <Zap size={16} className="animate-pulse" />
                          Generating hash...
                        </div>
                      </div>
                    )}
                    {state.outputText && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {state.outputText.length} chars
                      </div>
                    )}
                  </div>

                  {/* Hash Info */}
                  {state.outputText && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">
                          {state.hashType.toUpperCase()} hash generated successfully!
                        </span>
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Algorithm: {algorithmInfo.name} • Size: {algorithmInfo.bits} bits • Security: {algorithmInfo.security}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                <button
                  onClick={generateHash}
                  disabled={!state.inputText || state.isProcessing}
                  className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                >
                  <Zap size={20} />
                  Generate {state.hashType.toUpperCase()} Hash
                </button>
                
                <button
                  onClick={saveAsPreset}
                  disabled={!state.inputText}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  Save as Preset
                </button>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Hash History</h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold bg-${theme.primary}-100 text-${theme.primary}-800`}>
                          {item.hashType.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            inputText: history.find(h => h.id === item.id)?.input || '',
                            hashType: item.hashType
                          }));
                          setActiveTab('generator');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Use Again
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Input:</div>
                        <div className="font-mono bg-gray-50 p-2 rounded text-xs truncate">
                          {item.input}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Hash:</div>
                        <div className="font-mono bg-gray-50 p-2 rounded text-xs truncate">
                          {item.output}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Length: {item.length} characters
                    </div>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No hash history yet</div>
                    <div className="text-sm">Your generated hashes will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Hash Presets</h3>
                <button
                  onClick={saveAsPreset}
                  disabled={!state.inputText}
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold bg-${theme.primary}-100 text-${theme.primary}-800`}>
                        {preset.hashType}
                      </span>
                      {preset.useSalt && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Salted
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-3 font-mono bg-gray-50 p-2 rounded  truncate">
                      {preset.input}
                    </div>
                    <button
                      onClick={() => loadPreset(preset)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                    >
                      Load Preset
                    </button>
                  </div>
                ))}
                
                {presets.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No presets saved yet</div>
                    <div className="text-sm">Save your frequent hashing tasks as presets</div>
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

                {/* Processing Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Auto Process</h4>
                    <button
                      onClick={() => updateSettings('autoProcess', !settings.autoProcess)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.autoProcess 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Zap size={16} />
                      Auto Process {settings.autoProcess ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Uppercase Output</h4>
                    <button
                      onClick={() => updateSettings('uppercase', !settings.uppercase)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.uppercase 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Lock size={16} />
                      Uppercase {settings.uppercase ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Encoding Settings */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Output Encoding</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'hex', name: 'Hexadecimal', description: 'Standard hex encoding (a-f, 0-9)' },
                      { id: 'base64', name: 'Base64', description: 'Base64 encoding for compact output' }
                    ].map(encoding => (
                      <button
                        key={encoding.id}
                        onClick={() => updateSettings('encoding', encoding.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                          settings.encoding === encoding.id 
                            ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                            : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        <Hash size={16} />
                        <div>
                          <div className="font-semibold">{encoding.name}</div>
                          <div className="text-sm text-gray-500">{encoding.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Hash Algorithm Security</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span>MD5</span>
                      <span className="text-red-600 font-semibold">Weak</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span>SHA-1</span>
                      <span className="text-orange-600 font-semibold">Weak</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span>SHA-256</span>
                      <span className="text-green-600 font-semibold">Strong</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span>SHA-512</span>
                      <span className="text-blue-600 font-semibold">Very Strong</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Note:</strong> For cryptographic security, use SHA-256 or SHA-512 with salt.
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
          <Shield className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Algorithms</div>
          <div className="text-sm text-gray-600">MD5, SHA-1, SHA-256, SHA-512</div>
        </div>
        <div className="text-center p-4">
          <Lock className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Salt Support</div>
          <div className="text-sm text-gray-600">Add salt for enhanced security</div>
        </div>
        <div className="text-center p-4">
          <Key className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">File Hashing</div>
          <div className="text-sm text-gray-600">Hash file contents</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Presets & History</div>
          <div className="text-sm text-gray-600">Save and reuse configurations</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🔐 Hash Generator Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <strong>SHA-256 or SHA-512</strong> for cryptographic security - MD5 and SHA-1 are considered weak</li>
          <li>• Enable <strong>salt</strong> to protect against rainbow table attacks and enhance security</li>
          <li>• Increase <strong>iterations</strong> for key derivation functions (like password hashing)</li>
          <li>• <strong>Upload files</strong> to generate hashes for file integrity verification</li>
          <li>• Use <strong>uppercase output</strong> for consistency in systems that require case-sensitive hashes</li>
          <li>• Save frequent hashing configurations as <strong>presets</strong> for quick access</li>
          <li>• Perfect for <strong>password storage, data integrity checks, and digital signatures</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default HashGenerator;