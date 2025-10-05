import { useState, useEffect, useRef } from 'react';
import { Code, RotateCcw, Download, Upload, Copy, CheckCircle, FileText, Image, Lock, Unlock, Settings, Save, Trash2, Zap, Shield, AlertTriangle } from 'lucide-react';

const Base64Encoder = () => {
  const [state, setState] = useState({
    inputText: '',
    outputText: '',
    operation: 'encode', // 'encode' or 'decode'
    inputType: 'text', // 'text', 'file', 'url'
    isProcessing: false,
    copied: false,
    error: null
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoProcess: true,
    lineBreaks: true,
    urlSafe: false,
    validateInput: true
  });

  const [history, setHistory] = useState([]);
  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'JSON Encoding',
      input: '{"name": "John", "age": 30}',
      operation: 'encode',
      inputType: 'text'
    },
    {
      id: 2,
      name: 'Basic Auth',
      input: 'username:password',
      operation: 'encode',
      inputType: 'text'
    }
  ]);

  const [activeTab, setActiveTab] = useState('encoder');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('base64History');
    const savedSettings = localStorage.getItem('base64Settings');
    const savedPresets = localStorage.getItem('base64Presets');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('base64History', JSON.stringify(history));
    localStorage.setItem('base64Settings', JSON.stringify(settings));
    localStorage.setItem('base64Presets', JSON.stringify(presets));
  }, [history, settings, presets]);

  // Auto-process when input changes
  useEffect(() => {
    if (settings.autoProcess && state.inputText) {
      processBase64();
    }
  }, [state.inputText, state.operation, settings.autoProcess]);

  // Base64 encode function
  const base64Encode = (str) => {
    try {
      if (settings.urlSafe) {
        return btoa(unescape(encodeURIComponent(str)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      }
      return btoa(unescape(encodeURIComponent(str)));
    } catch (error) {
      throw new Error('Failed to encode string to Base64');
    }
  };

  // Base64 decode function
  const base64Decode = (str) => {
    try {
      // Add padding if needed for URL-safe encoding
      let base64 = str;
      if (settings.urlSafe) {
        base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
      }
      
      // Validate Base64 string
      if (settings.validateInput && !isValidBase64(base64)) {
        throw new Error('Invalid Base64 string');
      }
      
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      throw new Error('Failed to decode Base64 string');
    }
  };

  // Validate Base64 string
  const isValidBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  // Process Base64 encoding/decoding
  const processBase64 = () => {
    if (!state.inputText.trim()) {
      setState(prev => ({ ...prev, outputText: '', error: null }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      let result;
      if (state.operation === 'encode') {
        result = base64Encode(state.inputText);
      } else {
        result = base64Decode(state.inputText);
      }

      // Add line breaks for better readability
      if (settings.lineBreaks && state.operation === 'encode' && result.length > 80) {
        result = result.match(/.{1,80}/g).join('\n');
      }

      setState(prev => ({ 
        ...prev, 
        outputText: result, 
        isProcessing: false 
      }));

      // Add to history
      addToHistory(state.inputText, result, state.operation);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        outputText: '', 
        error: error.message,
        isProcessing: false 
      }));
    }
  };

  // Add to history
  const addToHistory = (input, output, operation) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
      output: output.slice(0, 100) + (output.length > 100 ? '...' : ''),
      operation,
      inputType: state.inputType
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 items
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      // For files, we'll encode the ArrayBuffer to Base64
      const arrayBuffer = e.target.result;
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      setState(prev => ({
        ...prev,
        inputText: base64,
        inputType: 'file',
        operation: 'encode'
      }));
    };
    reader.readAsArrayBuffer(file);
  };

  // Download output as file
  const downloadOutput = () => {
    if (!state.outputText) return;

    const blob = new Blob([state.outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base64-${state.operation === 'encode' ? 'encoded' : 'decoded'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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

  // Clear all
  const clearAll = () => {
    setState({
      inputText: '',
      outputText: '',
      operation: 'encode',
      inputType: 'text',
      isProcessing: false,
      copied: false,
      error: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Swap input and output
  const swapInputOutput = () => {
    setState(prev => ({
      ...prev,
      inputText: prev.outputText,
      outputText: prev.inputText,
      operation: prev.operation === 'encode' ? 'decode' : 'encode'
    }));
  };

  // Load preset
  const loadPreset = (preset) => {
    setState(prev => ({
      ...prev,
      inputText: preset.input,
      operation: preset.operation,
      inputType: preset.inputType
    }));
    setActiveTab('encoder');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset = {
      id: Date.now(),
      name,
      input: state.inputText,
      operation: state.operation,
      inputType: state.inputType
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate input size
  const getInputSize = () => {
    return new Blob([state.inputText]).size;
  };

  const theme = getThemeColors();

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Code className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Base64 Encoder/Decoder</h2>
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
                { id: 'encoder', name: 'Encoder/Decoder', icon: Code },
                { id: 'history', name: 'History', icon: FileText },
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
                onClick={processBase64}
                disabled={!state.inputText || state.isProcessing}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={16} />
                Process
              </button>
              <button
                onClick={swapInputOutput}
                disabled={!state.inputText && !state.outputText}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Swap
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
                File will be encoded to Base64
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Statistics</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Input Size:</span>
                <span className="font-bold text-gray-800">
                  {formatFileSize(getInputSize())}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Output Size:</span>
                <span className="font-bold text-gray-800">
                  {formatFileSize(new Blob([state.outputText]).size)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">History Items:</span>
                <span className="font-bold text-gray-800">{history.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Encoder/Decoder Tab */}
          {activeTab === 'encoder' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Operation Selector */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setState(prev => ({ ...prev, operation: 'encode' }))}
                    className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      state.operation === 'encode'
                        ? `bg-${theme.primary}-600 text-white`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Lock size={16} />
                    Encode
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, operation: 'decode' }))}
                    className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      state.operation === 'decode'
                        ? `bg-${theme.primary}-600 text-white`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Unlock size={16} />
                    Decode
                  </button>
                </div>

                <div className="flex gap-2">
                  {['text', 'file'].map(type => (
                    <button
                      key={type}
                      onClick={() => setState(prev => ({ ...prev, inputType: type }))}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 capitalize ${
                        state.inputType === type
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300`
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {type === 'text' ? <FileText size={16} /> : <Image size={16} />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input/Output Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-800">
                      Input ({state.operation === 'encode' ? 'Text to Encode' : 'Base64 to Decode'})
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
                      placeholder={
                        state.operation === 'encode' 
                          ? 'Enter text to encode to Base64...' 
                          : 'Enter Base64 string to decode...'
                      }
                      className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                    />
                    {state.inputText && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {state.inputText.length} chars
                      </div>
                    )}
                  </div>

                  {state.inputType === 'file' && state.inputText && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm text-blue-800">
                        <strong>File encoded:</strong> {formatFileSize(getInputSize())} of Base64 data
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-800">
                      Output ({state.operation === 'encode' ? 'Base64 Result' : 'Decoded Text'})
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(state.outputText)}
                        disabled={!state.outputText}
                        className={`p-2 transition disabled:opacity-50 ${
                          state.copied ? 'text-green-600' : 'text-gray-600 hover:text-blue-600'
                        }`}
                        title={state.copied ? 'Copied!' : 'Copy Output'}
                      >
                        {state.copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={downloadOutput}
                        disabled={!state.outputText}
                        className="p-2 text-gray-600 hover:text-green-600 transition disabled:opacity-50"
                        title="Download Output"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={state.outputText}
                      readOnly
                      placeholder={
                        state.operation === 'encode' 
                          ? 'Base64 encoded result will appear here...' 
                          : 'Decoded text will appear here...'
                      }
                      className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm bg-gray-50"
                    />
                    {state.isProcessing && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                        <div className="text-blue-600 font-semibold">Processing...</div>
                      </div>
                    )}
                    {state.outputText && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {state.outputText.length} chars
                      </div>
                    )}
                  </div>

                  {/* Error Display */}
                  {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle size={16} />
                        <span className="text-sm font-medium">Error: {state.error}</span>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {state.outputText && !state.error && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">
                          Successfully {state.operation === 'encode' ? 'encoded' : 'decoded'}!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                <button
                  onClick={processBase64}
                  disabled={!state.inputText || state.isProcessing}
                  className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                >
                  <Zap size={20} />
                  {state.operation === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
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
                <h3 className="text-xl font-bold text-gray-800">Conversion History</h3>
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
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.operation === 'encode' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.operation === 'encode' ? 'Encode' : 'Decode'}
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
                            operation: item.operation
                          }));
                          setActiveTab('encoder');
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
                        <div className="text-gray-600 mb-1">Output:</div>
                        <div className="font-mono bg-gray-50 p-2 rounded text-xs truncate">
                          {item.output}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No conversion history yet</div>
                    <div className="text-sm">Your Base64 conversions will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Presets</h3>
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
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        preset.operation === 'encode' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {preset.operation}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {preset.inputType}
                      </span>
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
                    <div className="text-sm">Save your frequent conversions as presets</div>
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
                    <h4 className="font-semibold text-gray-800 mb-3">Line Breaks</h4>
                    <button
                      onClick={() => updateSettings('lineBreaks', !settings.lineBreaks)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.lineBreaks 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <FileText size={16} />
                      Line Breaks {settings.lineBreaks ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">URL Safe Encoding</h4>
                    <button
                      onClick={() => updateSettings('urlSafe', !settings.urlSafe)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.urlSafe 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Shield size={16} />
                      URL Safe {settings.urlSafe ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Validate Input</h4>
                    <button
                      onClick={() => updateSettings('validateInput', !settings.validateInput)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.validateInput 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <AlertTriangle size={16} />
                      Validation {settings.validateInput ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">About Base64</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Base64</strong> is a binary-to-text encoding scheme that represents 
                      binary data in an ASCII string format by translating it into a radix-64 representation.
                    </p>
                    <p>
                      <strong>Common Uses:</strong> Data URIs, email attachments, basic authentication, 
                      and storing complex data in JSON or XML.
                    </p>
                    <p>
                      <strong>URL Safe:</strong> Replaces '+' with '-' and '/' with '_' to make Base64 
                      strings safe for URL parameters.
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
          <Lock className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Encode & Decode</div>
          <div className="text-sm text-gray-600">Bidirectional conversion</div>
        </div>
        <div className="text-center p-4">
          <FileText className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">File Support</div>
          <div className="text-sm text-gray-600">Upload and encode files</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Presets & History</div>
          <div className="text-sm text-gray-600">Save frequent conversions</div>
        </div>
        <div className="text-center p-4">
          <Shield className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">URL Safe</div>
          <div className="text-sm text-gray-600">Web-friendly encoding</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🔐 Base64 Encoder/Decoder Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <strong>URL Safe encoding</strong> when including Base64 data in URLs or web parameters</li>
          <li>• Enable <strong>auto-process</strong> for real-time conversion as you type</li>
          <li>• <strong>Upload files</strong> to encode images, documents, or any binary data to Base64</li>
          <li>• Use <strong>line breaks</strong> for better readability of long encoded strings</li>
          <li>• Save frequent conversions as <strong>presets</strong> for quick access to common tasks</li>
          <li>• <strong>Validate input</strong> to ensure proper Base64 format when decoding</li>
          <li>• Perfect for <strong>web development, data storage, and API integrations</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default Base64Encoder;
