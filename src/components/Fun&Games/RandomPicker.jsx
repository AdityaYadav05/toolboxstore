import { useState, useEffect, useRef } from 'react';
import { Shuffle, RotateCcw, Plus, Trash2, Settings, Save, Download, Upload, List, Star, Zap, Crown, Award, Users, Clock, PieChart } from 'lucide-react';

const RandomPicker = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Pizza', color: 'blue', weight: 1 },
    { id: 2, name: 'Burgers', color: 'green', weight: 1 },
    { id: 3, name: 'Sushi', color: 'purple', weight: 1 },
    { id: 4, name: 'Tacos', color: 'orange', weight: 1 },
    { id: 5, name: 'Pasta', color: 'red', weight: 1 }
  ]);

  const [settings, setSettings] = useState({
    theme: 'blue',
    animation: true,
    sound: true,
    displayCount: 5,
    selectionMode: 'single', // 'single', 'multiple', 'team'
    teams: 2,
    itemsPerTeam: 1
  });

  const [state, setState] = useState({
    isPicking: false,
    selectedItems: [],
    history: [],
    currentPick: null,
    isEditing: false,
    editItem: null
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Restaurants',
      items: [
        { id: 1, name: 'Italian Place', color: 'blue', weight: 1 },
        { id: 2, name: 'Mexican Grill', color: 'green', weight: 1 },
        { id: 3, name: 'Sushi Bar', color: 'purple', weight: 1 },
        { id: 4, name: 'Burger Joint', color: 'orange', weight: 1 }
      ]
    },
    {
      id: 2,
      name: 'Movie Night',
      items: [
        { id: 1, name: 'Action', color: 'blue', weight: 1 },
        { id: 2, name: 'Comedy', color: 'green', weight: 1 },
        { id: 3, name: 'Drama', color: 'purple', weight: 1 },
        { id: 4, name: 'Sci-Fi', color: 'orange', weight: 1 }
      ]
    },
    {
      id: 3,
      name: 'Weekend Activities',
      items: [
        { id: 1, name: 'Hiking', color: 'blue', weight: 1 },
        { id: 2, name: 'Movies', color: 'green', weight: 1 },
        { id: 3, name: 'Gaming', color: 'purple', weight: 1 },
        { id: 4, name: 'Shopping', color: 'orange', weight: 1 }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('picker');
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState('blue');
  const animationRef = useRef(null);

  const colorOptions = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'yellow', 'teal'];

  // Initialize from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('randomPickerItems');
    const savedSettings = localStorage.getItem('randomPickerSettings');
    const savedHistory = localStorage.getItem('randomPickerHistory');
    const savedPresets = localStorage.getItem('randomPickerPresets');
    
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedHistory) setState(prev => ({ ...prev, history: JSON.parse(savedHistory) }));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('randomPickerItems', JSON.stringify(items));
    localStorage.setItem('randomPickerSettings', JSON.stringify(settings));
    localStorage.setItem('randomPickerHistory', JSON.stringify(state.history));
    localStorage.setItem('randomPickerPresets', JSON.stringify(presets));
  }, [items, settings, state.history, presets]);

  // Add new item
  const addItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem = {
      id: Date.now(),
      name: newItemName.trim(),
      color: newItemColor,
      weight: 1
    };
    
    setItems(prev => [...prev, newItem]);
    setNewItemName('');
  };

  // Remove item
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Update item
  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Start random picking animation
  const startPicking = () => {
    if (items.length === 0) return;
    
    setState(prev => ({ ...prev, isPicking: true, currentPick: null }));
    
    let iterations = 0;
    const maxIterations = 30;
    const speed = 50;
    
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    animationRef.current = setInterval(() => {
      iterations++;
      const randomIndex = Math.floor(Math.random() * items.length);
      setState(prev => ({ ...prev, currentPick: items[randomIndex] }));
      
      if (iterations >= maxIterations) {
        clearInterval(animationRef.current);
        finishPicking();
      }
    }, speed);
  };

  // Finish picking and select final item(s)
  const finishPicking = () => {
    let selectedItems = [];
    
    if (settings.selectionMode === 'single') {
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const item of items) {
        random -= item.weight;
        if (random <= 0) {
          selectedItems = [item];
          break;
        }
      }
    } else if (settings.selectionMode === 'multiple') {
      const availableItems = [...items];
      for (let i = 0; i < Math.min(settings.displayCount, availableItems.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        selectedItems.push(availableItems[randomIndex]);
        availableItems.splice(randomIndex, 1);
      }
    } else if (settings.selectionMode === 'team') {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      selectedItems = Array.from({ length: settings.teams }, (_, teamIndex) => ({
        team: teamIndex + 1,
        items: shuffled.slice(
          teamIndex * settings.itemsPerTeam,
          (teamIndex + 1) * settings.itemsPerTeam
        )
      }));
    }
    
    setState(prev => ({
      ...prev,
      isPicking: false,
      selectedItems,
      currentPick: Array.isArray(selectedItems) ? selectedItems[0] : selectedItems,
      history: [{ 
        id: Date.now(), 
        items: selectedItems, 
        timestamp: new Date().toISOString(),
        mode: settings.selectionMode 
      }, ...prev.history.slice(0, 49)]
    }));
  };

  // Load preset
  const loadPreset = (preset) => {
    setItems(preset.items);
    setActiveTab('picker');
  };

  // Save current list as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;
    
    const newPreset = {
      id: Date.now(),
      name,
      items: [...items]
    };
    
    setPresets(prev => [newPreset, ...prev]);
  };

  // Remove preset
  const removePreset = (id) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // Export data
  const exportData = () => {
    const data = {
      items,
      settings,
      presets,
      history: state.history
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-picker-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.items) setItems(data.items);
        if (data.settings) setSettings(data.settings);
        if (data.presets) setPresets(data.presets);
        if (data.history) setState(prev => ({ ...prev, history: data.history }));
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Clear history
  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
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

  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Shuffle className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Random Picker</h2>
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
                { id: 'picker', name: 'Random Picker', icon: Shuffle },
                { id: 'items', name: 'Manage Items', icon: List },
                { id: 'presets', name: 'Presets', icon: Save },
                { id: 'history', name: 'History', icon: Clock },
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
                onClick={startPicking}
                disabled={items.length === 0 || state.isPicking}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle size={16} />
                Pick Random
              </button>
              <button
                onClick={exportData}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                Export Data
              </button>
              <label className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Statistics</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-bold text-gray-800">{items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">History Entries:</span>
                <span className="font-bold text-gray-800">{state.history.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Presets:</span>
                <span className="font-bold text-gray-800">{presets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Weight:</span>
                <span className="font-bold text-gray-800">{totalWeight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Random Picker Tab */}
          {activeTab === 'picker' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Random Picker</h3>
                <p className="text-gray-600">Click the button below to pick random items from your list</p>
              </div>

              {/* Picker Display */}
              <div className="flex justify-center mb-8">
                <div className={`w-64 h-64 rounded-2xl border-4 border-dashed border-${theme.primary}-300 bg-${theme.primary}-50 flex items-center justify-center p-8`}>
                  {state.isPicking ? (
                    <div className="text-center">
                      <div className="text-4xl mb-4">{state.currentPick?.emoji || '🎲'}</div>
                      <div className={`text-xl font-bold text-${theme.primary}-600`}>
                        {state.currentPick?.name || 'Picking...'}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">Randomizing...</div>
                    </div>
                  ) : state.selectedItems.length > 0 ? (
                    <div className="text-center">
                      {settings.selectionMode === 'team' ? (
                        <div className="space-y-4">
                          {state.selectedItems.map((team, index) => (
                            <div key={index} className="border-2 border-gray-200 rounded-lg p-3">
                              <div className="font-bold text-gray-800">Team {team.team}</div>
                              <div className="text-sm text-gray-600">
                                {team.items.map(item => item.name).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="text-4xl mb-4">
                            {state.selectedItems[0]?.emoji || '🎉'}
                          </div>
                          <div className={`text-xl font-bold text-${theme.primary}-600 mb-2`}>
                            {state.selectedItems.map(item => item.name).join(', ')}
                          </div>
                          {state.selectedItems.length > 1 && (
                            <div className="text-sm text-gray-500">
                              {state.selectedItems.length} items selected
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-4">🎯</div>
                      <div>Ready to pick!</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pick Button */}
              <div className="text-center">
                <button
                  onClick={startPicking}
                  disabled={items.length === 0 || state.isPicking}
                  className={`px-8 py-4 bg-${theme.primary}-600 text-white rounded-xl hover:bg-${theme.primary}-700 transition text-lg font-semibold flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Shuffle size={24} />
                  {state.isPicking ? 'Picking...' : 'Pick Random Item'}
                </button>
                {items.length === 0 && (
                  <p className="text-red-500 mt-2">Add some items first!</p>
                )}
              </div>
            </div>
          )}

          {/* Manage Items Tab */}
          {activeTab === 'items' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Manage Items</h3>
                <span className="text-gray-600">{items.length} items</span>
              </div>

              {/* Add Item Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Add New Item</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name..."
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                  />
                  <select
                    value={newItemColor}
                    onChange={(e) => setNewItemColor(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {colorOptions.map(color => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className={`w-4 h-4 rounded-full bg-${item.color}-500 flex-shrink-0`}></div>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Weight:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={item.weight}
                        onChange={(e) => updateItem(item.id, 'weight', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <select
                      value={item.color}
                      onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <List size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No items added yet</div>
                    <div className="text-sm">Use the form above to add your first item</div>
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
                    <div className="text-sm text-gray-600 mb-3">
                      {preset.items.length} items
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.items.slice(0, 4).map((item, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 bg-${item.color}-100 text-${item.color}-800 rounded text-xs`}
                        >
                          {item.name}
                        </span>
                      ))}
                      {preset.items.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{preset.items.length - 4} more
                        </span>
                      )}
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
                    <div className="text-sm">Save your current list as a preset for quick access</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Pick History</h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.history.map((record, index) => (
                  <div
                    key={record.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">
                        Pick #{state.history.length - index}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2 capitalize">
                      Mode: {record.mode}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.mode === 'team' ? (
                        record.items.map((team, teamIndex) => (
                          <div key={teamIndex} className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Team {team.team}
                            </span>
                            <span className="text-sm">
                              {team.items.map(item => item.name).join(', ')}
                            </span>
                          </div>
                        ))
                      ) : (
                        record.items.map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className={`px-3 py-1 bg-${item.color}-100 text-${item.color}-800 rounded-full text-sm`}
                          >
                            {item.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
                
                {state.history.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No history yet</div>
                    <div className="text-sm">Your random picks will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Settings</h3>
              
              <div className="space-y-6">
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

                {/* Selection Mode */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Selection Mode</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'single', name: 'Single Item', icon: Star, description: 'Pick one random item' },
                      { id: 'multiple', name: 'Multiple Items', icon: Zap, description: 'Pick multiple items at once' },
                      { id: 'team', name: 'Team Division', icon: Users, description: 'Divide items into teams' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSettings(prev => ({ ...prev, selectionMode: mode.id }))}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                          settings.selectionMode === mode.id 
                            ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                            : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        <mode.icon size={16} />
                        <div>
                          <div className="font-semibold">{mode.name}</div>
                          <div className="text-sm text-gray-500">{mode.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Settings */}
                {settings.selectionMode === 'team' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Teams
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={settings.teams}
                        onChange={(e) => setSettings(prev => ({ ...prev, teams: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Items per Team
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={settings.itemsPerTeam}
                        onChange={(e) => setSettings(prev => ({ ...prev, itemsPerTeam: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Multiple Items Settings */}
                {settings.selectionMode === 'multiple' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Items to Pick
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.displayCount}
                      onChange={(e) => setSettings(prev => ({ ...prev, displayCount: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Other Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Sound</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.sound 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      Sound {settings.sound ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Animations</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, animation: !prev.animation }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.animation 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Zap size={16} />
                      Animations {settings.animation ? 'Enabled' : 'Disabled'}
                    </button>
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
          <Shuffle className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Smart Randomization</div>
          <div className="text-sm text-gray-600">Weighted and fair picks</div>
        </div>
        <div className="text-center p-4">
          <Users className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Modes</div>
          <div className="text-sm text-gray-600">Single, multiple, or team picks</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Presets</div>
          <div className="text-sm text-gray-600">Save and load item lists</div>
        </div>
        <div className="text-center p-4">
          <PieChart className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Statistics</div>
          <div className="text-sm text-gray-600">Track your pick history</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Random Picker Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <strong>weights</strong> to make some items more likely to be picked than others</li>
          <li>• Save frequently used item lists as <strong>presets</strong> for quick access</li>
          <li>• Try <strong>team division mode</strong> for fair team selection in games</li>
          <li>• Export your data to <strong>backup</strong> your items and settings</li>
          <li>• Use <strong>multiple selection mode</strong> when you need to pick several items at once</li>
        </ul>
      </div>
    </div>
  );
};

export default RandomPicker;