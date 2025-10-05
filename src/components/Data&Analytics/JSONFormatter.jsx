import { useState, useEffect, useRef } from 'react';
import { Code, CheckCircle, AlertTriangle, Copy, Download, Upload, Settings, Save, Trash2, Zap, Eye, EyeOff, Search, ChevronRight, ChevronDown, RotateCcw } from 'lucide-react';

const JSONFormatter = () => {
  const [state, setState] = useState({
    inputText: '',
    outputText: '',
    isProcessing: false,
    isValid: true,
    error: null,
    viewMode: 'formatted', // 'formatted', 'minified', 'tree'
    expandedPaths: new Set(),
    searchTerm: '',
    selectedPath: null
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    indentSize: 2,
    autoFormat: true,
    validateOnType: true,
    syntaxHighlighting: true,
    lineNumbers: true,
    quoteKeys: true
  });

  const [history, setHistory] = useState([]);
  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Sample User Data',
      input: `{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "profile": {
        "age": 30,
        "city": "New York"
      }
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "profile": {
        "age": 25,
        "city": "Los Angeles"
      }
    }
  ],
  "total": 2
}`
    },
    {
      id: 2,
      name: 'API Response',
      input: `{"status":200,"data":{"products":[{"id":"1","name":"Laptop","price":999.99,"inStock":true},{"id":"2","name":"Mouse","price":29.99,"inStock":false}],"pagination":{"page":1,"totalPages":5}},"message":"Success"}`
    }
  ]);

  const [activeTab, setActiveTab] = useState('formatter');
  const textareaRef = useRef(null);
  const outputRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('jsonFormatterHistory');
    const savedSettings = localStorage.getItem('jsonFormatterSettings');
    const savedPresets = localStorage.getItem('jsonFormatterPresets');
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('jsonFormatterHistory', JSON.stringify(history));
    localStorage.setItem('jsonFormatterSettings', JSON.stringify(settings));
    localStorage.setItem('jsonFormatterPresets', JSON.stringify(presets));
  }, [history, settings, presets]);

  // Auto-format when input changes
  useEffect(() => {
    if (settings.autoFormat && state.inputText.trim()) {
      processJSON();
    }
  }, [state.inputText, settings.autoFormat]);

  // Validate JSON
  const validateJSON = (jsonString) => {
    try {
      if (!jsonString.trim()) {
        return { isValid: true, error: null, parsed: null };
      }
      
      const parsed = JSON.parse(jsonString);
      return { isValid: true, error: null, parsed };
    } catch (error) {
      return { 
        isValid: false, 
        error: error.message,
        parsed: null
      };
    }
  };

  // Format JSON with proper indentation
  const formatJSON = (jsonString, indentSize = 2) => {
    const validation = validateJSON(jsonString);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return JSON.stringify(validation.parsed, null, indentSize);
  };

  // Minify JSON
  const minifyJSON = (jsonString) => {
    const validation = validateJSON(jsonString);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return JSON.stringify(validation.parsed);
  };

  // Process JSON based on current view mode
  const processJSON = () => {
    if (!state.inputText.trim()) {
      setState(prev => ({ 
        ...prev, 
        outputText: '', 
        isValid: true, 
        error: null 
      }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      let result;
      switch (state.viewMode) {
        case 'formatted':
          result = formatJSON(state.inputText, settings.indentSize);
          break;
        case 'minified':
          result = minifyJSON(state.inputText);
          break;
        case 'tree':
          result = state.inputText; // Tree view handled separately in render
          break;
        default:
          result = formatJSON(state.inputText, settings.indentSize);
      }

      const validation = validateJSON(state.inputText);
      
      setState(prev => ({ 
        ...prev, 
        outputText: result,
        isValid: validation.isValid,
        error: validation.error,
        isProcessing: false
      }));

      // Add to history if valid
      if (validation.isValid) {
        addToHistory(state.inputText, result, state.viewMode);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        outputText: '',
        isValid: false,
        error: error.message,
        isProcessing: false
      }));
    }
  };

  // Add to history
  const addToHistory = (input, output, viewMode) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: input.slice(0, 200) + (input.length > 200 ? '...' : ''),
      output: output.slice(0, 200) + (output.length > 200 ? '...' : ''),
      viewMode,
      isValid: true
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 items
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

  // Download output as file
  const downloadOutput = () => {
    if (!state.outputText) return;

    const blob = new Blob([state.outputText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show temporary success feedback
      const originalText = document.querySelector('.copy-button')?.textContent;
      const button = document.querySelector('.copy-button');
      if (button) {
        button.innerHTML = '<CheckCircle size={16} /> Copied!';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      }
    });
  };

  // Clear all
  const clearAll = () => {
    setState(prev => ({
      ...prev,
      inputText: '',
      outputText: '',
      isValid: true,
      error: null,
      searchTerm: '',
      selectedPath: null
    }));
  };

  // Toggle path expansion in tree view
  const togglePath = (path) => {
    setState(prev => {
      const newExpandedPaths = new Set(prev.expandedPaths);
      if (newExpandedPaths.has(path)) {
        newExpandedPaths.delete(path);
      } else {
        newExpandedPaths.add(path);
      }
      return { ...prev, expandedPaths: newExpandedPaths };
    });
  };

  // Load preset
  const loadPreset = (preset) => {
    setState(prev => ({
      ...prev,
      inputText: preset.input,
      viewMode: 'formatted'
    }));
    setActiveTab('formatter');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset = {
      id: Date.now(),
      name,
      input: state.inputText
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

  // Render JSON tree view
  const renderJSONTree = (obj, path = '') => {
    if (obj === null) {
      return <span className="text-purple-600">null</span>;
    }

    if (typeof obj === 'boolean') {
      return <span className="text-red-600">{obj.toString()}</span>;
    }

    if (typeof obj === 'number') {
      return <span className="text-green-600">{obj}</span>;
    }

    if (typeof obj === 'string') {
      return <span className="text-orange-600">"{obj}"</span>;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }

      const isExpanded = state.expandedPaths.has(path);

      return (
        <div className="ml-4">
          <button
            onClick={() => togglePath(path)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-1"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>[{obj.length}]</span>
          </button>
          {isExpanded && (
            <div className="border-l-2 border-gray-200 pl-4">
              {obj.map((item, index) => (
                <div key={index} className="flex items-start gap-2 py-1">
                  <span className="text-gray-500 text-sm">{index}:</span>
                  {renderJSONTree(item, `${path}[${index}]`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return <span className="text-gray-500">{'{}'}</span>;
      }

      const isExpanded = state.expandedPaths.has(path);

      return (
        <div className="ml-4">
          <button
            onClick={() => togglePath(path)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-1"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>{'{'}{keys.length} key{keys.length !== 1 ? 's' : ''}{'}'}</span>
          </button>
          {isExpanded && (
            <div className="border-l-2 border-gray-200 pl-4">
              {keys.map(key => (
                <div key={key} className="flex items-start gap-2 py-1">
                  <span className="text-blue-600 text-sm">"{key}":</span>
                  {renderJSONTree(obj[key], path ? `${path}.${key}` : key)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(obj)}</span>;
  };

  // Get tree view data
  const getTreeViewData = () => {
    if (!state.inputText.trim() || !state.isValid) return null;
    
    try {
      return JSON.parse(state.inputText);
    } catch {
      return null;
    }
  };

  // Count JSON statistics
  const getJSONStats = () => {
    if (!state.inputText.trim() || !state.isValid) {
      return { keys: 0, objects: 0, arrays: 0, values: 0, size: 0 };
    }

    try {
      const parsed = JSON.parse(state.inputText);
      let keys = 0;
      let objects = 0;
      let arrays = 0;
      let values = 0;

      const countStats = (obj) => {
        if (Array.isArray(obj)) {
          arrays++;
          obj.forEach(item => countStats(item));
        } else if (obj && typeof obj === 'object') {
          objects++;
          keys += Object.keys(obj).length;
          Object.values(obj).forEach(value => countStats(value));
        } else {
          values++;
        }
      };

      countStats(parsed);
      const size = new Blob([state.inputText]).size;

      return { keys, objects, arrays, values, size };
    } catch {
      return { keys: 0, objects: 0, arrays: 0, values: 0, size: 0 };
    }
  };

  const theme = getThemeColors();
  const treeData = getTreeViewData();
  const stats = getJSONStats();

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Code className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">JSON Formatter & Validator</h2>
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
                { id: 'formatter', name: 'Formatter', icon: Code },
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
                onClick={processJSON}
                disabled={!state.inputText || state.isProcessing}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Zap size={16} />
                Format JSON
              </button>
              <button
                onClick={downloadOutput}
                disabled={!state.outputText}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Download
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
                Upload JSON File
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Supports .json files
              </div>
            </div>
          </div>

          {/* JSON Statistics */}
          {state.inputText && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">JSON Statistics</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-bold text-gray-800">
                    {(stats.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Keys:</span>
                  <span className="font-bold text-gray-800">{stats.keys}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Objects:</span>
                  <span className="font-bold text-gray-800">{stats.objects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Arrays:</span>
                  <span className="font-bold text-gray-800">{stats.arrays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Values:</span>
                  <span className="font-bold text-gray-800">{stats.values}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Formatter Tab */}
          {activeTab === 'formatter' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* View Mode Selector */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex gap-2">
                  {['formatted', 'minified', 'tree'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setState(prev => ({ ...prev, viewMode: mode }))}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 capitalize ${
                        state.viewMode === mode
                          ? `bg-${theme.primary}-600 text-white`
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {mode === 'tree' ? <Eye size={16} /> : <Code size={16} />}
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Indentation Selector */}
                {state.viewMode === 'formatted' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Indent:</span>
                    <select
                      value={settings.indentSize}
                      onChange={(e) => updateSettings('indentSize', parseInt(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    >
                      {[2, 4, 6, 8].map(size => (
                        <option key={size} value={size}>
                          {size} spaces
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Input/Output Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-800">
                      Input JSON
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
                      placeholder="Paste your JSON here..."
                      className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                    />
                    {state.inputText && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {state.inputText.length} chars
                      </div>
                    )}
                  </div>

                  {/* Validation Status */}
                  {state.inputText && (
                    <div className={`p-3 rounded-lg ${
                      state.isValid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {state.isValid ? (
                          <>
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-green-800 text-sm font-medium">Valid JSON</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={16} className="text-red-600" />
                            <span className="text-red-800 text-sm font-medium">
                              Invalid JSON: {state.error}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Output Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-gray-800">
                      {state.viewMode === 'tree' ? 'Tree View' : 'Formatted JSON'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(state.outputText)}
                        disabled={!state.outputText}
                        className="p-2 text-gray-600 hover:text-blue-600 transition disabled:opacity-50 copy-button"
                        title="Copy Output"
                      >
                        <Copy size={16} />
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
                    <div className={`w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm overflow-auto ${
                      state.viewMode === 'tree' ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      {state.isProcessing ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <Zap size={20} className="animate-pulse mr-2" />
                          Processing...
                        </div>
                      ) : state.viewMode === 'tree' && treeData ? (
                        <div className="text-sm">
                          {renderJSONTree(treeData)}
                        </div>
                      ) : (
                        <pre ref={outputRef} className="whitespace-pre-wrap">
                          {state.outputText}
                        </pre>
                      )}
                    </div>
                    
                    {state.outputText && state.viewMode !== 'tree' && (
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {state.outputText.length} chars
                      </div>
                    )}
                  </div>

                  {/* Tree View Instructions */}
                  {state.viewMode === 'tree' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm text-blue-800">
                        <strong>Tree View:</strong> Click on arrows to expand/collapse objects and arrays. 
                        Colors indicate different data types.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                <button
                  onClick={processJSON}
                  disabled={!state.inputText || state.isProcessing}
                  className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                >
                  <Zap size={20} />
                  Process JSON
                </button>
                
                <button
                  onClick={saveAsPreset}
                  disabled={!state.inputText || !state.isValid}
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
                <h3 className="text-xl font-bold text-gray-800">Formatting History</h3>
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
                          item.isValid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.viewMode}
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
                            viewMode: item.viewMode
                          }));
                          setActiveTab('formatter');
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
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No formatting history yet</div>
                    <div className="text-sm">Your JSON formatting sessions will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">JSON Presets</h3>
                <button
                  onClick={saveAsPreset}
                  disabled={!state.inputText || !state.isValid}
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
                    <div className="text-sm text-gray-600 mb-3 font-mono bg-gray-50 p-2 rounded  max-h-20 overflow-hidden">
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
                    <div className="text-sm">Save your frequent JSON samples as presets</div>
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

                {/* Formatting Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Auto Format</h4>
                    <button
                      onClick={() => updateSettings('autoFormat', !settings.autoFormat)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.autoFormat 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Zap size={16} />
                      Auto Format {settings.autoFormat ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Syntax Highlighting</h4>
                    <button
                      onClick={() => updateSettings('syntaxHighlighting', !settings.syntaxHighlighting)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.syntaxHighlighting 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Eye size={16} />
                      Highlighting {settings.syntaxHighlighting ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Line Numbers</h4>
                    <button
                      onClick={() => updateSettings('lineNumbers', !settings.lineNumbers)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.lineNumbers 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Code size={16} />
                      Line Numbers {settings.lineNumbers ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Validate on Type</h4>
                    <button
                      onClick={() => updateSettings('validateOnType', !settings.validateOnType)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.validateOnType 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <CheckCircle size={16} />
                      Live Validation {settings.validateOnType ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                {/* JSON Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">About JSON</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>JSON (JavaScript Object Notation)</strong> is a lightweight data-interchange 
                      format that is easy for humans to read and write and easy for machines to parse and generate.
                    </p>
                    <p>
                      <strong>Common Uses:</strong> Configuration files, API responses, data storage, 
                      and data exchange between servers and web applications.
                    </p>
                    <p>
                      <strong>Key Features:</strong> Human-readable, language-independent, 
                      supports nested structures, and widely supported across programming languages.
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
          <Code className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Format & Minify</div>
          <div className="text-sm text-gray-600">Pretty print and compress JSON</div>
        </div>
        <div className="text-center p-4">
          <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Validate</div>
          <div className="text-sm text-gray-600">Check JSON syntax and structure</div>
        </div>
        <div className="text-center p-4">
          <Eye className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Tree View</div>
          <div className="text-sm text-gray-600">Visualize JSON structure</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Presets & History</div>
          <div className="text-sm text-gray-600">Save and reuse JSON samples</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 JSON Formatter Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <strong>Tree View</strong> to visually explore complex JSON structures with nested objects and arrays</li>
          <li>• Enable <strong>auto-format</strong> for real-time formatting and validation as you type or paste</li>
          <li>• <strong>Upload JSON files</strong> directly to format and validate large datasets</li>
          <li>• Switch between <strong>formatted and minified</strong> views for development vs production use</li>
          <li>• Save frequent JSON samples as <strong>presets</strong> for quick testing and development</li>
          <li>• Use <strong>different indentation sizes</strong> based on your project's coding standards</li>
          <li>• Perfect for <strong>API development, configuration files, and data analysis</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default JSONFormatter;
