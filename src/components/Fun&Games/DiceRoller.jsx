import { useState, useEffect, useRef } from 'react';
import { Dice5, RotateCcw, Plus, Trash2, Settings, Save, Download, Upload, History, Zap, Trophy, Users, Clock, PieChart, Dice1, Dice2, Dice3, Dice4, Dice5 as Dice5Icon, Dice6 } from 'lucide-react';

const DiceRoller = () => {
  const [diceSets, setDiceSets] = useState([
    {
      id: 1,
      name: 'Standard Set',
      dice: [
        { id: 1, type: 'd6', value: 1, rolling: false },
        { id: 2, type: 'd6', value: 1, rolling: false }
      ]
    }
  ]);

  const [settings, setSettings] = useState({
    theme: 'blue',
    animation: true,
    sound: true,
    animationSpeed: 'medium', // 'slow', 'medium', 'fast'
    displayMode: 'individual', // 'individual', 'sum', 'both'
    historyLimit: 50
  });

  const [state, setState] = useState({
    activeSet: 0,
    isRolling: false,
    rollHistory: [],
    currentRoll: null,
    totalRolls: 0
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'D&D Basic',
      dice: [
        { id: 1, type: 'd4', value: 1, rolling: false },
        { id: 2, type: 'd6', value: 1, rolling: false },
        { id: 3, type: 'd8', value: 1, rolling: false },
        { id: 4, type: 'd10', value: 1, rolling: false },
        { id: 5, type: 'd12', value: 1, rolling: false },
        { id: 6, type: 'd20', value: 1, rolling: false }
      ]
    },
    {
      id: 2,
      name: '2d6 Set',
      dice: [
        { id: 1, type: 'd6', value: 1, rolling: false },
        { id: 2, type: 'd6', value: 1, rolling: false }
      ]
    },
    {
      id: 3,
      name: 'Percentile',
      dice: [
        { id: 1, type: 'd10', value: 1, rolling: false },
        { id: 2, type: 'd10', value: 1, rolling: false }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('roller');
  const [newSetName, setNewSetName] = useState('');
  const animationRefs = useRef({});

  const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
  const diceFaces = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
    d100: 100
  };

  const animationSpeeds = {
    slow: 1500,
    medium: 800,
    fast: 400
  };

  // Initialize from localStorage
  useEffect(() => {
    const savedDiceSets = localStorage.getItem('diceRollerSets');
    const savedSettings = localStorage.getItem('diceRollerSettings');
    const savedHistory = localStorage.getItem('diceRollerHistory');
    const savedPresets = localStorage.getItem('diceRollerPresets');
    const savedState = localStorage.getItem('diceRollerState');
    
    if (savedDiceSets) setDiceSets(JSON.parse(savedDiceSets));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedHistory) setState(prev => ({ ...prev, rollHistory: JSON.parse(savedHistory) }));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setState(prev => ({ ...prev, ...parsedState }));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('diceRollerSets', JSON.stringify(diceSets));
    localStorage.setItem('diceRollerSettings', JSON.stringify(settings));
    localStorage.setItem('diceRollerHistory', JSON.stringify(state.rollHistory));
    localStorage.setItem('diceRollerPresets', JSON.stringify(presets));
    localStorage.setItem('diceRollerState', JSON.stringify({
      activeSet: state.activeSet,
      totalRolls: state.totalRolls
    }));
  }, [diceSets, settings, state.rollHistory, presets, state.activeSet, state.totalRolls]);

  // Add new dice set
  const addDiceSet = () => {
    if (!newSetName.trim()) return;
    
    const newSet = {
      id: Date.now(),
      name: newSetName.trim(),
      dice: [{ id: Date.now() + 1, type: 'd6', value: 1, rolling: false }]
    };
    
    setDiceSets(prev => [...prev, newSet]);
    setNewSetName('');
  };

  // Remove dice set
  const removeDiceSet = (id) => {
    setDiceSets(prev => prev.filter(set => set.id !== id));
    if (state.activeSet >= diceSets.length - 1) {
      setState(prev => ({ ...prev, activeSet: Math.max(0, diceSets.length - 2) }));
    }
  };

  // Add die to current set
  const addDie = (type = 'd6') => {
    const newDie = {
      id: Date.now(),
      type,
      value: 1,
      rolling: false
    };
    
    setDiceSets(prev => prev.map((set, index) => 
      index === state.activeSet 
        ? { ...set, dice: [...set.dice, newDie] }
        : set
    ));
  };

  // Remove die from current set
  const removeDie = (dieId) => {
    setDiceSets(prev => prev.map((set, index) => 
      index === state.activeSet 
        ? { ...set, dice: set.dice.filter(die => die.id !== dieId) }
        : set
    ));
  };

  // Update die type
  const updateDieType = (dieId, newType) => {
    setDiceSets(prev => prev.map((set, index) => 
      index === state.activeSet 
        ? { 
            ...set, 
            dice: set.dice.map(die => 
              die.id === dieId ? { ...die, type: newType, value: 1 } : die
            )
          }
        : set
    ));
  };

  // Roll all dice
  const rollAllDice = () => {
    if (state.isRolling) return;
    
    const currentSet = diceSets[state.activeSet];
    if (!currentSet || currentSet.dice.length === 0) return;

    setState(prev => ({ ...prev, isRolling: true }));

    // Start rolling animation for each die
    currentSet.dice.forEach(die => {
      startDieAnimation(die.id);
    });

    // Stop rolling after animation duration
    setTimeout(() => {
      finishRoll();
    }, animationSpeeds[settings.animationSpeed]);
  };

  // Start individual die animation
  const startDieAnimation = (dieId) => {
    const currentSet = diceSets[state.activeSet];
    const die = currentSet.dice.find(d => d.id === dieId);
    if (!die) return;

    let iterations = 0;
    const maxIterations = 20;
    const speed = animationSpeeds[settings.animationSpeed] / maxIterations;

    // Clear any existing animation for this die
    if (animationRefs.current[dieId]) {
      clearInterval(animationRefs.current[dieId]);
    }

    animationRefs.current[dieId] = setInterval(() => {
      iterations++;
      const randomValue = Math.floor(Math.random() * diceFaces[die.type]) + 1;
      
      setDiceSets(prev => prev.map((set, index) => 
        index === state.activeSet 
          ? {
              ...set,
              dice: set.dice.map(d => 
                d.id === dieId ? { ...d, value: randomValue, rolling: true } : d
              )
            }
          : set
      ));

      if (iterations >= maxIterations) {
        clearInterval(animationRefs.current[dieId]);
      }
    }, speed);
  };

  // Finish roll and calculate results
  const finishRoll = () => {
    const currentSet = diceSets[state.activeSet];
    const finalValues = currentSet.dice.map(die => ({
      type: die.type,
      value: Math.floor(Math.random() * diceFaces[die.type]) + 1
    }));

    const sum = finalValues.reduce((total, die) => total + die.value, 0);
    const maxPossible = currentSet.dice.reduce((total, die) => total + diceFaces[die.type], 0);

    // Update dice with final values
    setDiceSets(prev => prev.map((set, index) => 
      index === state.activeSet 
        ? {
            ...set,
            dice: set.dice.map((die, i) => ({
              ...die,
              value: finalValues[i].value,
              rolling: false
            }))
          }
        : set
    ));

    const rollRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      diceSet: currentSet.name,
      dice: finalValues,
      total: sum,
      maxPossible,
      displayMode: settings.displayMode
    };

    setState(prev => ({
      ...prev,
      isRolling: false,
      currentRoll: rollRecord,
      rollHistory: [rollRecord, ...prev.rollHistory.slice(0, settings.historyLimit - 1)],
      totalRolls: prev.totalRolls + 1
    }));

    // Clear all animation intervals
    Object.values(animationRefs.current).forEach(interval => {
      clearInterval(interval);
    });
    animationRefs.current = {};
  };

  // Roll single die
  const rollSingleDie = (dieId) => {
    if (state.isRolling) return;
    
    startDieAnimation(dieId);
    
    setTimeout(() => {
      const currentSet = diceSets[state.activeSet];
      const die = currentSet.dice.find(d => d.id === dieId);
      if (!die) return;

      const finalValue = Math.floor(Math.random() * diceFaces[die.type]) + 1;
      
      setDiceSets(prev => prev.map((set, index) => 
        index === state.activeSet 
          ? {
              ...set,
              dice: set.dice.map(d => 
                d.id === dieId ? { ...d, value: finalValue, rolling: false } : d
              )
            }
          : set
      ));

      if (animationRefs.current[dieId]) {
        clearInterval(animationRefs.current[dieId]);
        delete animationRefs.current[dieId];
      }
    }, animationSpeeds[settings.animationSpeed]);
  };

  // Load preset
  const loadPreset = (preset) => {
    const newSet = {
      id: Date.now(),
      name: `${preset.name} (Copy)`,
      dice: preset.dice.map(die => ({ ...die, id: Date.now() + Math.random() }))
    };
    
    setDiceSets(prev => [...prev, newSet]);
    setState(prev => ({ ...prev, activeSet: prev.activeSet + 1 }));
    setActiveTab('roller');
  };

  // Save current set as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;
    
    const currentSet = diceSets[state.activeSet];
    const newPreset = {
      id: Date.now(),
      name,
      dice: currentSet.dice.map(die => ({ ...die, id: Date.now() + Math.random() }))
    };
    
    setPresets(prev => [newPreset, ...prev]);
  };

  // Remove preset
  const removePreset = (id) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // Clear history
  const clearHistory = () => {
    setState(prev => ({ ...prev, rollHistory: [] }));
  };

  // Export data
  const exportData = () => {
    const data = {
      diceSets,
      settings,
      presets,
      rollHistory: state.rollHistory,
      totalRolls: state.totalRolls
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dice-roller-data.json';
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
        if (data.diceSets) setDiceSets(data.diceSets);
        if (data.settings) setSettings(data.settings);
        if (data.presets) setPresets(data.presets);
        if (data.rollHistory) setState(prev => ({ ...prev, rollHistory: data.rollHistory }));
        if (data.totalRolls) setState(prev => ({ ...prev, totalRolls: data.totalRolls }));
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
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

  // Get dice icon component
  const getDiceIcon = (type) => {
    const icons = {
      d4: Dice1,
      d6: Dice2,
      d8: Dice3,
      d10: Dice4,
      d12: Dice5Icon,
      d20: Dice5,
      d100: Dice5
    };
    return icons[type] || Dice5;
  };

  // Format dice value for display
  const formatDiceValue = (type, value) => {
    if (type === 'd100') {
      return value === 100 ? '00' : value.toString().padStart(2, '0');
    }
    return value;
  };

  const theme = getThemeColors();
  const currentSet = diceSets[state.activeSet];
  const currentDice = currentSet?.dice || [];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Dice5 className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Dice Roller</h2>
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
                { id: 'roller', name: 'Dice Roller', icon: Dice5 },
                { id: 'sets', name: 'Dice Sets', icon: Users },
                { id: 'presets', name: 'Presets', icon: Save },
                { id: 'history', name: 'Roll History', icon: History },
                { id: 'stats', name: 'Statistics', icon: PieChart },
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
                onClick={rollAllDice}
                disabled={state.isRolling || !currentSet || currentDice.length === 0}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Dice5 size={16} />
                Roll All Dice
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

          {/* Current Set Info */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Current Set</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Set Name:</span>
                <span className="font-bold text-gray-800">{currentSet?.name || 'None'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dice Count:</span>
                <span className="font-bold text-gray-800">{currentDice.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Rolls:</span>
                <span className="font-bold text-gray-800">{state.totalRolls}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Dice Roller Tab */}
          {activeTab === 'roller' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Dice Roller</h3>
                <p className="text-gray-600">Click individual dice to roll them, or roll all at once</p>
              </div>

              {/* Dice Set Selector */}
              {diceSets.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Dice Set
                  </label>
                  <select
                    value={state.activeSet}
                    onChange={(e) => setState(prev => ({ ...prev, activeSet: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {diceSets.map((set, index) => (
                      <option key={set.id} value={index}>
                        {set.name} ({set.dice.length} dice)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dice Display */}
              <div className="flex justify-center mb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentDice.map((die) => {
                    const DiceIcon = getDiceIcon(die.type);
                    return (
                      <div key={die.id} className="text-center">
                        <button
                          onClick={() => rollSingleDie(die.id)}
                          disabled={state.isRolling}
                          className={`
                            relative w-20 h-20 rounded-xl text-2xl font-bold transition-all duration-300
                            flex flex-col items-center justify-center shadow-lg border-2
                            ${die.rolling 
                              ? `bg-${theme.primary}-200 border-${theme.primary}-400 animate-pulse` 
                              : `bg-white border-${theme.primary}-300 hover:border-${theme.primary}-500`
                            }
                            ${state.isRolling ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
                          `}
                        >
                          <DiceIcon size={24} className={`text-${theme.primary}-600 mb-1`} />
                          <div className={`font-mono font-bold ${die.rolling ? 'text-gray-600' : `text-${theme.primary}-700`}`}>
                            {formatDiceValue(die.type, die.value)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{die.type}</div>
                        </button>
                        <button
                          onClick={() => removeDie(die.id)}
                          className="mt-2 p-1 text-gray-400 hover:text-red-600 transition text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                  
                  {currentDice.length === 0 && (
                    <div className="col-span-4 text-center py-12 text-gray-500">
                      <Dice5 size={48} className="mx-auto mb-4 opacity-50" />
                      <div>No dice in current set</div>
                      <div className="text-sm">Add some dice to get started</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Roll Results */}
              {state.currentRoll && (
                <div className={`bg-${theme.primary}-50 border-2 border-${theme.primary}-200 rounded-lg p-4 mb-6`}>
                  <h4 className="font-semibold text-gray-800 mb-2">Last Roll Results</h4>
                  <div className="flex flex-wrap gap-4">
                    {state.currentRoll.dice.map((die, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm text-gray-600">{die.type}</div>
                        <div className={`text-xl font-bold text-${theme.primary}-700`}>
                          {formatDiceValue(die.type, die.value)}
                        </div>
                      </div>
                    ))}
                    <div className="text-center ml-auto">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-2xl font-bold text-green-600">
                        {state.currentRoll.total}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={rollAllDice}
                  disabled={state.isRolling || currentDice.length === 0}
                  className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-xl hover:bg-${theme.primary}-700 transition text-lg font-semibold flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Dice5 size={24} />
                  {state.isRolling ? 'Rolling...' : `Roll All Dice (${currentDice.length})`}
                </button>
                
                <div className="flex gap-2">
                  {diceTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => addDie(type)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Add {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dice Sets Tab */}
          {activeTab === 'sets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Dice Sets</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    placeholder="New set name..."
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && addDiceSet()}
                  />
                  <button
                    onClick={addDiceSet}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Set
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diceSets.map((set, index) => (
                  <div
                    key={set.id}
                    className={`border-2 rounded-lg p-4 transition ${
                      index === state.activeSet 
                        ? `border-${theme.primary}-500 bg-${theme.primary}-50` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800">{set.name}</h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setState(prev => ({ ...prev, activeSet: index }))}
                          className="p-1 text-blue-600 hover:text-blue-800 transition"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => removeDiceSet(set.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {set.dice.length} dice
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {set.dice.slice(0, 6).map((die, dieIndex) => {
                        const DiceIcon = getDiceIcon(die.type);
                        return (
                          <div
                            key={dieIndex}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                          >
                            <DiceIcon size={12} />
                            <span>{die.type}</span>
                          </div>
                        );
                      })}
                      {set.dice.length > 6 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          +{set.dice.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {diceSets.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No dice sets created yet</div>
                    <div className="text-sm">Create your first dice set above</div>
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
                  disabled={!currentSet}
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
                    <div className="text-sm text-gray-600 mb-3">
                      {preset.dice.length} dice
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.dice.slice(0, 4).map((die, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {die.type}
                        </span>
                      ))}
                      {preset.dice.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{preset.dice.length - 4} more
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
                    <div className="text-sm">Save your current dice set as a preset</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Roll History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Roll History</h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.rollHistory.map((roll, index) => (
                  <div
                    key={roll.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">
                        Roll #{state.rollHistory.length - index}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(roll.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Set: {roll.diceSet}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {roll.dice.map((die, dieIndex) => (
                        <div key={dieIndex} className="text-center">
                          <div className="text-xs text-gray-500">{die.type}</div>
                          <div className="font-bold text-gray-800">{die.value}</div>
                        </div>
                      ))}
                      <div className="text-center ml-auto">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="font-bold text-green-600 text-lg">{roll.total}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {state.rollHistory.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <History size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No roll history yet</div>
                    <div className="text-sm">Your dice rolls will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <PieChart className="text-blue-600" />
                Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{state.totalRolls}</div>
                  <div className="text-lg font-semibold text-blue-800">Total Rolls</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">{state.rollHistory.length}</div>
                  <div className="text-lg font-semibold text-green-800">History Entries</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{diceSets.length}</div>
                  <div className="text-lg font-semibold text-purple-800">Dice Sets</div>
                </div>
                
                <div className="text-center p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {currentDice.reduce((total, die) => total + diceFaces[die.type], 0)}
                  </div>
                  <div className="text-lg font-semibold text-orange-800">Max Roll Possible</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">Recent Activity</h4>
                {state.rollHistory.slice(0, 5).map((roll, index) => (
                  <div key={roll.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="text-sm text-gray-600">
                      {roll.diceSet} - {roll.dice.length} dice
                    </div>
                    <div className="font-semibold text-gray-800">{roll.total}</div>
                  </div>
                ))}
                {state.rollHistory.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No recent activity
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

                {/* Animation Settings */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Animation Speed</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'slow', name: 'Slow', description: 'Longer rolling animation' },
                      { id: 'medium', name: 'Medium', description: 'Balanced animation speed' },
                      { id: 'fast', name: 'Fast', description: 'Quick rolling animation' }
                    ].map(speed => (
                      <button
                        key={speed.id}
                        onClick={() => setSettings(prev => ({ ...prev, animationSpeed: speed.id }))}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                          settings.animationSpeed === speed.id 
                            ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                            : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        <Zap size={16} />
                        <div>
                          <div className="font-semibold">{speed.name}</div>
                          <div className="text-sm text-gray-500">{speed.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Settings */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Display Mode</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'individual', name: 'Individual', description: 'Show individual die results' },
                      { id: 'sum', name: 'Sum Only', description: 'Show only the total sum' },
                      { id: 'both', name: 'Both', description: 'Show individual and total' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setSettings(prev => ({ ...prev, displayMode: mode.id }))}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                          settings.displayMode === mode.id 
                            ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                            : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        <Dice5 size={16} />
                        <div>
                          <div className="font-semibold">{mode.name}</div>
                          <div className="text-sm text-gray-500">{mode.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

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

                {/* History Settings */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    History Limit: {settings.historyLimit} rolls
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={settings.historyLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, historyLimit: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10</span>
                    <span>100</span>
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
          <Dice5 className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Dice Types</div>
          <div className="text-sm text-gray-600">d4 to d100 supported</div>
        </div>
        <div className="text-center p-4">
          <Users className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Dice Sets</div>
          <div className="text-sm text-gray-600">Save custom combinations</div>
        </div>
        <div className="text-center p-4">
          <Trophy className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Roll History</div>
          <div className="text-sm text-gray-600">Track your rolls</div>
        </div>
        <div className="text-center p-4">
          <Settings className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Customizable</div>
          <div className="text-sm text-gray-600">Themes and settings</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🎲 Dice Roller Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>Click individual dice</strong> to roll them one at a time</li>
          <li>• Use <strong>Roll All Dice</strong> to roll your entire set simultaneously</li>
          <li>• Create <strong>custom dice sets</strong> for different games and scenarios</li>
          <li>• Save frequently used combinations as <strong>presets</strong> for quick access</li>
          <li>• Adjust <strong>animation speed</strong> in settings for your preferred experience</li>
          <li>• Perfect for <strong>D&D, board games, and decision making</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default DiceRoller;
