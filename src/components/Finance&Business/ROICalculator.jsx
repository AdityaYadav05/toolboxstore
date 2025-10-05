import { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, PieChart, Target, Calendar, Download, Upload, Settings, Save, Trash2, Zap, Copy, CheckCircle, AlertTriangle, RotateCcw, Clock, BarChart3, Percent, DollarSign as Dollar } from 'lucide-react';

const ROICalculator = () => {
  const [state, setState] = useState({
    initialInvestment: '',
    finalValue: '',
    investmentPeriod: '',
    additionalContributions: '',
    contributionFrequency: 'yearly',
    roiResult: null,
    isCalculating: false,
    error: null,
    viewMode: 'basic', // 'basic', 'advanced', 'breakdown'
    history: [],
    currentCalculation: null
  });

  const [settings, setSettings] = useState({
    theme: 'blue',
    autoCalculate: true,
    saveToHistory: true,
    showChart: true,
    defaultCurrency: 'USD',
    taxRate: 15,
    inflationRate: 2.5,
    compoundFrequency: 'yearly'
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      name: 'Real Estate Investment',
      data: {
        initialInvestment: '200000',
        finalValue: '350000',
        investmentPeriod: '5',
        additionalContributions: '5000',
        contributionFrequency: 'yearly'
      }
    },
    {
      id: 2,
      name: 'Stock Portfolio',
      data: {
        initialInvestment: '10000',
        finalValue: '25000',
        investmentPeriod: '3',
        additionalContributions: '2000',
        contributionFrequency: 'yearly'
      }
    },
    {
      id: 3,
      name: 'Business Startup',
      data: {
        initialInvestment: '50000',
        finalValue: '150000',
        investmentPeriod: '2',
        additionalContributions: '10000',
        contributionFrequency: 'yearly'
      }
    }
  ]);

  const [activeTab, setActiveTab] = useState('calculator');
  const initialInvestmentRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('roiCalculatorHistory');
    const savedSettings = localStorage.getItem('roiCalculatorSettings');
    const savedPresets = localStorage.getItem('roiCalculatorPresets');
    
    if (savedHistory) setState(prev => ({ ...prev, history: JSON.parse(savedHistory) }));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('roiCalculatorHistory', JSON.stringify(state.history));
    localStorage.setItem('roiCalculatorSettings', JSON.stringify(settings));
    localStorage.setItem('roiCalculatorPresets', JSON.stringify(presets));
  }, [state.history, settings, presets]);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (settings.autoCalculate && hasValidInputs()) {
      calculateROI();
    }
  }, [
    state.initialInvestment,
    state.finalValue,
    state.investmentPeriod,
    state.additionalContributions,
    state.contributionFrequency,
    settings.autoCalculate
  ]);

  // Validate inputs
  const validateInputs = () => {
    const errors = [];

    if (!state.initialInvestment || parseFloat(state.initialInvestment) <= 0) {
      errors.push('Initial investment must be greater than 0');
    }

    if (!state.finalValue || parseFloat(state.finalValue) <= 0) {
      errors.push('Final value must be greater than 0');
    }

    if (!state.investmentPeriod || parseFloat(state.investmentPeriod) <= 0) {
      errors.push('Investment period must be greater than 0');
    }

    if (state.additionalContributions && parseFloat(state.additionalContributions) < 0) {
      errors.push('Additional contributions cannot be negative');
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  };

  // Check if inputs are valid for calculation
  const hasValidInputs = () => {
    return state.initialInvestment && 
           state.finalValue && 
           state.investmentPeriod &&
           parseFloat(state.initialInvestment) > 0 &&
           parseFloat(state.finalValue) > 0 &&
           parseFloat(state.investmentPeriod) > 0;
  };

  // Calculate ROI
  const calculateROI = () => {
    const validation = validateInputs();
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.errors[0],
        roiResult: null
      }));
      return;
    }

    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    // Simulate calculation delay
    setTimeout(() => {
      try {
        const initial = parseFloat(state.initialInvestment);
        const final = parseFloat(state.finalValue);
        const period = parseFloat(state.investmentPeriod);
        const additional = parseFloat(state.additionalContributions) || 0;
        
        // Calculate total contributions
        const frequencyMultiplier = getFrequencyMultiplier(state.contributionFrequency);
        const totalContributions = additional * frequencyMultiplier * period;
        const totalInvestment = initial + totalContributions;

        // Calculate ROI
        const netProfit = final - totalInvestment;
        const roi = (netProfit / totalInvestment) * 100;
        const annualizedROI = (Math.pow(final / totalInvestment, 1 / period) - 1) * 100;

        // Calculate with tax and inflation
        const taxAmount = netProfit * (settings.taxRate / 100);
        const afterTaxProfit = netProfit - taxAmount;
        const afterTaxROI = (afterTaxProfit / totalInvestment) * 100;

        // Adjust for inflation
        const inflationAdjustedFinal = final / Math.pow(1 + settings.inflationRate / 100, period);
        const realNetProfit = inflationAdjustedFinal - totalInvestment;
        const realROI = (realNetProfit / totalInvestment) * 100;

        const result = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          inputs: {
            initialInvestment: initial,
            finalValue: final,
            investmentPeriod: period,
            additionalContributions: additional,
            contributionFrequency: state.contributionFrequency
          },
          metrics: {
            totalInvestment: totalInvestment,
            netProfit: netProfit,
            roi: roi,
            annualizedROI: annualizedROI,
            afterTaxProfit: afterTaxProfit,
            afterTaxROI: afterTaxROI,
            realNetProfit: realNetProfit,
            realROI: realROI,
            taxAmount: taxAmount,
            totalContributions: totalContributions
          },
          breakdown: {
            initialInvestment: initial,
            additionalContributions: totalContributions,
            finalValue: final,
            netProfit: netProfit
          }
        };

        setState(prev => ({
          ...prev,
          roiResult: result,
          isCalculating: false,
          history: settings.saveToHistory ? [result, ...prev.history.slice(0, 49)] : prev.history
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to calculate ROI',
          roiResult: null,
          isCalculating: false
        }));
      }
    }, 500);
  };

  // Get frequency multiplier for additional contributions
  const getFrequencyMultiplier = (frequency) => {
    const multipliers = {
      yearly: 1,
      quarterly: 4,
      monthly: 12,
      weekly: 52,
      daily: 365
    };
    return multipliers[frequency] || 1;
  };

  // Quick calculation examples
  const calculateExample = (exampleData) => {
    setState(prev => ({
      ...prev,
      ...exampleData
    }));
    setTimeout(calculateROI, 100);
  };

  // Handle file upload (calculation data)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result);
        if (content.inputs) {
          setState(prev => ({
            ...prev,
            initialInvestment: content.inputs.initialInvestment?.toString() || '',
            finalValue: content.inputs.finalValue?.toString() || '',
            investmentPeriod: content.inputs.investmentPeriod?.toString() || '',
            additionalContributions: content.inputs.additionalContributions?.toString() || ''
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Invalid file format'
        }));
      }
    };
    reader.readAsText(file);
  };

  // Download results
  const downloadResults = () => {
    if (!state.roiResult) return;

    const data = {
      calculation: state.roiResult,
      timestamp: new Date().toISOString(),
      settings: settings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roi-calculation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (!state.roiResult) return;

    const text = `ROI: ${state.roiResult.metrics.roi.toFixed(2)}% | Annualized: ${state.roiResult.metrics.annualizedROI.toFixed(2)}% | Net Profit: ${formatCurrency(state.roiResult.metrics.netProfit)}`;
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

  // Clear inputs
  const clearInputs = () => {
    setState(prev => ({
      ...prev,
      initialInvestment: '',
      finalValue: '',
      investmentPeriod: '',
      additionalContributions: '',
      roiResult: null,
      error: null
    }));
  };

  // Clear history
  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
  };

  // Load preset
  const loadPreset = (preset) => {
    setState(prev => ({
      ...prev,
      ...preset.data,
      contributionFrequency: preset.data.contributionFrequency || 'yearly'
    }));
    setActiveTab('calculator');
  };

  // Save current as preset
  const saveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name || !hasValidInputs()) return;

    const newPreset = {
      id: Date.now(),
      name,
      data: {
        initialInvestment: state.initialInvestment,
        finalValue: state.finalValue,
        investmentPeriod: state.investmentPeriod,
        additionalContributions: state.additionalContributions,
        contributionFrequency: state.contributionFrequency
      }
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

  const theme = getThemeColors();
  const hasResult = state.roiResult && !state.error;
  const isPositiveROI = hasResult && state.roiResult.metrics.roi >= 0;

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">ROI Calculator</h2>
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
                { id: 'calculator', name: 'Calculator', icon: Calculator },
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
                onClick={calculateROI}
                disabled={!hasValidInputs() || state.isCalculating}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Calculator size={16} />
                Calculate ROI
              </button>
              <button
                onClick={downloadResults}
                disabled={!hasResult}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Download Results
              </button>
              <button
                onClick={clearInputs}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear Inputs
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
                  { mode: 'basic', icon: Calculator, label: 'Basic' },
                  { mode: 'advanced', icon: TrendingUp, label: 'Advanced' },
                  { mode: 'breakdown', icon: PieChart, label: 'Breakdown' }
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
              <h3 className="font-semibold text-gray-800">Import Data</h3>
            </div>
            <div className="p-4">
              <label className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer text-center justify-center">
                <Upload size={16} />
                Import Calculation
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Supports JSON files
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Quick Examples</h3>
            </div>
            <div className="p-4 space-y-2">
              {[
                { name: 'Double Investment', data: { initialInvestment: '10000', finalValue: '20000', investmentPeriod: '5', additionalContributions: '0' }},
                { name: 'Real Estate Flip', data: { initialInvestment: '50000', finalValue: '75000', investmentPeriod: '2', additionalContributions: '5000' }},
                { name: 'Stock Growth', data: { initialInvestment: '5000', finalValue: '8000', investmentPeriod: '3', additionalContributions: '1000' }}
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => calculateExample(example.data)}
                  className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition text-sm text-left"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Input Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Initial Investment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Investment *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      ref={initialInvestmentRef}
                      type="number"
                      value={state.initialInvestment}
                      onChange={(e) => setState(prev => ({ ...prev, initialInvestment: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Final Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Value *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={state.finalValue}
                      onChange={(e) => setState(prev => ({ ...prev, finalValue: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Investment Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Period (Years) *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={state.investmentPeriod}
                      onChange={(e) => setState(prev => ({ ...prev, investmentPeriod: e.target.value }))}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Additional Contributions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Contributions
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={state.additionalContributions}
                      onChange={(e) => setState(prev => ({ ...prev, additionalContributions: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Contribution Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contribution Frequency
                  </label>
                  <select
                    value={state.contributionFrequency}
                    onChange={(e) => setState(prev => ({ ...prev, contributionFrequency: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                {/* Calculate Button */}
                <div className="flex items-end">
                  <button
                    onClick={calculateROI}
                    disabled={!hasValidInputs() || state.isCalculating}
                    className={`w-full px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition font-semibold flex items-center gap-2 disabled:opacity-50`}
                  >
                    {state.isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator size={20} />
                        Calculate ROI
                      </>
                    )}
                  </button>
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
                  {/* Results Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">ROI Calculation Results</h3>
                        <p className="text-gray-600">
                          Calculated at {new Date(state.roiResult.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 copy-button"
                        >
                          <Copy size={16} />
                          Copy Results
                        </button>
                        <button
                          onClick={downloadResults}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Basic View */}
                  {state.viewMode === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Total Investment</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {formatCurrency(state.roiResult.metrics.totalInvestment)}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Net Profit</div>
                        <div className={`text-2xl font-bold ${isPositiveROI ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(state.roiResult.metrics.netProfit)}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">ROI</div>
                        <div className={`text-2xl font-bold ${isPositiveROI ? 'text-green-600' : 'text-red-600'}`}>
                          {state.roiResult.metrics.roi.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced View */}
                  {state.viewMode === 'advanced' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Annualized ROI</div>
                        <div className={`text-xl font-bold ${isPositiveROI ? 'text-green-600' : 'text-red-600'}`}>
                          {state.roiResult.metrics.annualizedROI.toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">After-Tax ROI</div>
                        <div className={`text-xl font-bold ${state.roiResult.metrics.afterTaxROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {state.roiResult.metrics.afterTaxROI.toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Real ROI (Inflation)</div>
                        <div className={`text-xl font-bold ${state.roiResult.metrics.realROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {state.roiResult.metrics.realROI.toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-sm text-gray-600 mb-1">Tax Amount</div>
                        <div className="text-xl font-bold text-red-600">
                          {formatCurrency(state.roiResult.metrics.taxAmount)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Breakdown View */}
                  {state.viewMode === 'breakdown' && (
                    <div className="bg-white border-2 border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800">Investment Breakdown</h4>
                      </div>
                      <div className="p-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Initial Investment:</span>
                            <span className="font-semibold text-gray-800">
                              {formatCurrency(state.roiResult.breakdown.initialInvestment)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Additional Contributions:</span>
                            <span className="font-semibold text-gray-800">
                              {formatCurrency(state.roiResult.breakdown.additionalContributions)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                            <span className="text-gray-800 font-semibold">Total Investment:</span>
                            <span className="font-bold text-gray-800">
                              {formatCurrency(state.roiResult.metrics.totalInvestment)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Final Value:</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(state.roiResult.breakdown.finalValue)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                            <span className="text-gray-800 font-semibold">Net Profit:</span>
                            <span className={`font-bold ${isPositiveROI ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(state.roiResult.breakdown.netProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chart Placeholder */}
                  {settings.showChart && (
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-800">ROI Visualization</h4>
                      </div>
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                          <div>ROI chart would appear here</div>
                          <div className="text-sm">Visualization of investment growth over time</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Results State */}
              {!hasResult && !state.error && !state.isCalculating && (
                <div className="text-center py-12 text-gray-500">
                  <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-semibold mb-2">No ROI Calculation</div>
                  <div>Enter your investment details above to calculate ROI</div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Calculation History</h3>
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
                  const isPositive = item.metrics.roi >= 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            ROI: {item.metrics.roi.toFixed(2)}%
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setState(prev => ({
                              ...prev,
                              initialInvestment: item.inputs.initialInvestment.toString(),
                              finalValue: item.inputs.finalValue.toString(),
                              investmentPeriod: item.inputs.investmentPeriod.toString(),
                              additionalContributions: item.inputs.additionalContributions.toString(),
                              contributionFrequency: item.inputs.contributionFrequency,
                              roiResult: item
                            }));
                            setActiveTab('calculator');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Use Again
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600 mb-1">Initial:</div>
                          <div className="font-semibold text-gray-800">
                            {formatCurrency(item.inputs.initialInvestment)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 mb-1">Final:</div>
                          <div className="font-semibold text-gray-800">
                            {formatCurrency(item.inputs.finalValue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 mb-1">Period:</div>
                          <div className="font-semibold text-gray-800">
                            {item.inputs.investmentPeriod} years
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 mb-1">Profit:</div>
                          <div className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(item.metrics.netProfit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {state.history.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No calculation history yet</div>
                    <div className="text-sm">Your ROI calculations will appear here</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Investment Presets</h3>
                <button
                  onClick={saveAsPreset}
                  disabled={!hasValidInputs()}
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
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Initial:</span>
                        <span className="font-semibold">{formatCurrency(parseFloat(preset.data.initialInvestment))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Final:</span>
                        <span className="font-semibold">{formatCurrency(parseFloat(preset.data.finalValue))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="font-semibold">{preset.data.investmentPeriod} years</span>
                      </div>
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
                    <div className="text-sm">Save your frequent investment scenarios as presets</div>
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

                {/* Calculation Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Auto Calculate</h4>
                    <button
                      onClick={() => updateSettings('autoCalculate', !settings.autoCalculate)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.autoCalculate 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Zap size={16} />
                      Auto Calculate {settings.autoCalculate ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Save to History</h4>
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
                </div>

                {/* Financial Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Tax Rate (%)</h4>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => updateSettings('taxRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Inflation Rate (%)</h4>
                    <input
                      type="number"
                      value={settings.inflationRate}
                      onChange={(e) => updateSettings('inflationRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* ROI Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">About ROI Calculation</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>ROI (Return on Investment)</strong> measures the profitability of an investment 
                      as a percentage of the original investment. It helps compare different investment opportunities.
                    </p>
                    <p>
                      <strong>Formula:</strong> ROI = (Net Profit / Total Investment) × 100%
                    </p>
                    <p>
                      <strong>Annualized ROI</strong> shows the average annual return, making it easier 
                      to compare investments with different time periods.
                    </p>
                    <p>
                      <strong>Real ROI</strong> adjusts for inflation to show the actual purchasing power gained.
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
          <Calculator className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Views</div>
          <div className="text-sm text-gray-600">Basic, advanced & breakdown</div>
        </div>
        <div className="text-center p-4">
          <TrendingUp className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Advanced Metrics</div>
          <div className="text-sm text-gray-600">Annualized, tax & inflation</div>
        </div>
        <div className="text-center p-4">
          <PieChart className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Visual Breakdown</div>
          <div className="text-sm text-gray-600">Investment composition</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Presets & History</div>
          <div className="text-sm text-gray-600">Save & compare scenarios</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 ROI Calculator Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <strong>different view modes</strong> to see basic results, advanced metrics, or detailed breakdowns</li>
          <li>• Enable <strong>auto-calculate</strong> for real-time updates as you modify inputs</li>
          <li>• Consider <strong>additional contributions</strong> for ongoing investments with regular deposits</li>
          <li>• Adjust <strong>tax and inflation rates</strong> for more realistic after-tax and real returns</li>
          <li>• Save <strong>frequent investment scenarios</strong> as presets for quick comparison</li>
          <li>• Perfect for <strong>real estate, stocks, business investments, and portfolio analysis</strong></li>
          <li>• Compare <strong>annualized ROI</strong> across investments with different time horizons</li>
        </ul>
      </div>
    </div>
  );
};

export default ROICalculator;