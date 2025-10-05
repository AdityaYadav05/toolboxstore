import { useState, useEffect } from 'react';
import { Calculator, Percent, Target, TrendingUp, TrendingDown, Zap, Copy, Check, History, Star, RefreshCw, BarChart3 } from 'lucide-react';

const PercentageCalculator = () => {
  const [calculationType, setCalculationType] = useState('percentage-of');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [result, setResult] = useState('');
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Calculation types with descriptions
  const calculationTypes = [
    {
      id: 'percentage-of',
      name: 'Percentage of',
      description: 'What is X% of Y?',
      formula: '(X/100) * Y',
      example: 'What is 20% of 150?'
    },
    {
      id: 'percentage-change',
      name: 'Percentage Change',
      description: 'X is what % of Y?',
      formula: '(X/Y) * 100',
      example: '50 is what % of 200?'
    },
    {
      id: 'percentage-increase',
      name: 'Percentage Increase',
      description: 'Increase X by Y%',
      formula: 'X * (1 + Y/100)',
      example: 'Increase 100 by 15%'
    },
    {
      id: 'percentage-decrease',
      name: 'Percentage Decrease',
      description: 'Decrease X by Y%',
      formula: 'X * (1 - Y/100)',
      example: 'Decrease 200 by 25%'
    },
    {
      id: 'percentage-difference',
      name: 'Percentage Difference',
      description: 'X to Y percentage change',
      formula: '((Y - X)/X) * 100',
      example: 'From 80 to 100 is what % increase?'
    },
    {
      id: 'find-percentage',
      name: 'Find Percentage',
      description: 'X out of Y as percentage',
      formula: '(X/Y) * 100',
      example: '25 out of 50 as percentage'
    }
  ];

  // Common percentage calculations for quick access
  const commonCalculations = [
    { type: 'percentage-of', input1: 20, input2: 150, label: '20% of 150' },
    { type: 'percentage-change', input1: 50, input2: 200, label: '50 is what % of 200?' },
    { type: 'percentage-increase', input1: 100, input2: 15, label: 'Increase 100 by 15%' },
    { type: 'percentage-decrease', input1: 200, input2: 25, label: 'Decrease 200 by 25%' },
    { type: 'percentage-difference', input1: 80, input2: 100, label: '80 to 100 change' },
    { type: 'find-percentage', input1: 25, input2: 50, label: '25 out of 50' }
  ];

  // Common percentages for quick selection
  const commonPercentages = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

  // Calculate based on type
  const calculatePercentage = () => {
    const num1 = parseFloat(input1);
    const num2 = parseFloat(input2);

    if (isNaN(num1) || (input2 !== '' && isNaN(num2))) {
      setResult('');
      return;
    }

    let calculationResult;
    let description = '';

    switch (calculationType) {
      case 'percentage-of':
        // What is X% of Y?
        calculationResult = (num1 / 100) * num2;
        description = `${num1}% of ${num2} is ${calculationResult.toFixed(2)}`;
        break;

      case 'percentage-change':
        // X is what % of Y?
        calculationResult = (num1 / num2) * 100;
        description = `${num1} is ${calculationResult.toFixed(2)}% of ${num2}`;
        break;

      case 'percentage-increase':
        // Increase X by Y%
        calculationResult = num1 * (1 + num2 / 100);
        description = `${num1} increased by ${num2}% is ${calculationResult.toFixed(2)}`;
        break;

      case 'percentage-decrease':
        // Decrease X by Y%
        calculationResult = num1 * (1 - num2 / 100);
        description = `${num1} decreased by ${num2}% is ${calculationResult.toFixed(2)}`;
        break;

      case 'percentage-difference':
        // From X to Y percentage change
        calculationResult = ((num2 - num1) / Math.abs(num1)) * 100;
        const direction = calculationResult >= 0 ? 'increase' : 'decrease';
        description = `From ${num1} to ${num2} is ${Math.abs(calculationResult).toFixed(2)}% ${direction}`;
        break;

      case 'find-percentage':
        // X out of Y as percentage
        calculationResult = (num1 / num2) * 100;
        description = `${num1} out of ${num2} is ${calculationResult.toFixed(2)}%`;
        break;

      default:
        return;
    }

    setResult({
      value: calculationResult,
      description: description,
      calculationType: calculationType
    });

    // Add to history
    const historyItem = {
      id: Date.now(),
      type: calculationType,
      input1: num1,
      input2: num2,
      result: calculationResult,
      description: description,
      timestamp: new Date().toLocaleTimeString()
    };
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInput1('');
    setInput2('');
    setResult('');
  };

  const resetCalculator = () => {
    setInput1('');
    setInput2('');
    setResult('');
    setCalculationType('percentage-of');
  };

  const setQuickCalculation = (calc) => {
    setCalculationType(calc.type);
    setInput1(calc.input1.toString());
    setInput2(calc.input2.toString());
  };

  const addToFavorites = (calc) => {
    const fav = { ...calc, id: Date.now() };
    setFavorites(prev => [fav, ...prev.filter(f => 
      !(f.type === calc.type && f.input1 === calc.input1 && f.input2 === calc.input2)
    ).slice(0, 4)]);
  };

  const removeFromFavorites = (favId) => {
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (input1 !== '' && (calculationType === 'percentage-change' || input2 !== '')) {
      calculatePercentage();
    }
  }, [input1, input2, calculationType]);

  // Get current calculation type details
  const getCurrentCalculationType = () => {
    return calculationTypes.find(type => type.id === calculationType);
  };

  // Get input labels based on calculation type
  const getInputLabels = () => {
    switch (calculationType) {
      case 'percentage-of':
        return { label1: 'Percentage (%)', label2: 'Number' };
      case 'percentage-change':
        return { label1: 'Part', label2: 'Whole' };
      case 'percentage-increase':
        return { label1: 'Number', label2: 'Increase Percentage (%)' };
      case 'percentage-decrease':
        return { label1: 'Number', label2: 'Decrease Percentage (%)' };
      case 'percentage-difference':
        return { label1: 'From', label2: 'To' };
      case 'find-percentage':
        return { label1: 'Part', label2: 'Whole' };
      default:
        return { label1: 'Input 1', label2: 'Input 2' };
    }
  };

  const inputLabels = getInputLabels();

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Percent className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Percentage Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calculation Type Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Calculation Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {calculationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setCalculationType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    calculationType === type.id
                      ? 'border-blue-500 bg-blue-100 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{type.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                  <div className="text-xs text-gray-500 mt-2 font-mono">{type.formula}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Card */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Input 1 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {inputLabels.label1}
                </label>
                <input
                  type="number"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Input 2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {inputLabels.label2}
                </label>
                <input
                  type="number"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  disabled={calculationType === 'percentage-change' && input1 === ''}
                />
              </div>
            </div>

            {/* Common Percentages */}
            {(calculationType === 'percentage-of' || calculationType === 'percentage-increase' || calculationType === 'percentage-decrease') && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Percentage Selection
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {commonPercentages.map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => setInput1(percentage.toString())}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        input1 === percentage.toString()
                          ? 'border-green-500 bg-green-100 text-green-800 font-bold'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                      }`}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={calculatePercentage}
                disabled={input1 === '' || (calculationType !== 'percentage-change' && input2 === '')}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Zap size={24} />
                Calculate
              </button>
              <button
                onClick={clearAll}
                disabled={input1 === '' && input2 === ''}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition font-semibold"
              >
                Clear
              </button>
              <button
                onClick={resetCalculator}
                className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-semibold"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* Result Card */}
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    Result
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-4">
                    {formatNumber(result.value.toFixed(2))}
                  </div>
                  <div className="text-lg text-gray-600 mb-2">
                    {result.description}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {getCurrentCalculationType()?.formula}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 mx-auto"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Result'}
                  </button>
                </div>
              </div>

              {/* Calculation Explanation */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calculator className="text-blue-600" />
                  Calculation Explanation
                </h3>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="font-mono text-sm text-gray-700">
                    {calculationType === 'percentage-of' && (
                      <>({input1} ÷ 100) × {input2} = {result.value.toFixed(2)}</>
                    )}
                    {calculationType === 'percentage-change' && (
                      <>({input1} ÷ {input2}) × 100 = {result.value.toFixed(2)}%</>
                    )}
                    {calculationType === 'percentage-increase' && (
                      <>{input1} × (1 + {input2} ÷ 100) = {result.value.toFixed(2)}</>
                    )}
                    {calculationType === 'percentage-decrease' && (
                      <>{input1} × (1 - {input2} ÷ 100) = {result.value.toFixed(2)}</>
                    )}
                    {calculationType === 'percentage-difference' && (
                      <>(({input2} - {input1}) ÷ {input1}) × 100 = {result.value.toFixed(2)}%</>
                    )}
                    {calculationType === 'find-percentage' && (
                      <>({input1} ÷ {input2}) × 100 = {result.value.toFixed(2)}%</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common Calculations */}
          <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="text-yellow-600" />
              Common Calculations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonCalculations.map((calc, index) => (
                <button
                  key={index}
                  onClick={() => setQuickCalculation(calc)}
                  className="p-3 bg-white hover:bg-yellow-100 border border-yellow-200 rounded-lg transition text-left group"
                >
                  <div className="font-semibold text-gray-800">{calc.label}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {calculationTypes.find(t => t.id === calc.type)?.description}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(calc);
                    }}
                    className="mt-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star size={14} className="text-gray-400 hover:text-yellow-500" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Favorites */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-purple-600" />
              Favorite Calculations
            </h3>
            <div className="space-y-3">
              {favorites.length > 0 ? (
                favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg group"
                  >
                    <button
                      onClick={() => setQuickCalculation(fav)}
                      className="flex-1 text-left"
                    >
                      <div className="font-semibold text-gray-800">{fav.label}</div>
                      <div className="text-sm text-gray-600">
                        {calculationTypes.find(t => t.id === fav.type)?.name}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromFavorites(fav.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star size={16} className="text-purple-500 fill-purple-500" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No favorites yet. Click the star on common calculations to add them here.
                </div>
              )}
            </div>
          </div>

          {/* Calculation History */}
          {calculationHistory.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <History className="text-blue-600" />
                  Recent Calculations
                </h3>
                <button
                  onClick={() => setCalculationHistory([])}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-3">
                {calculationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-blue-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">
                        {formatNumber(item.result.toFixed(2))}
                      </div>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {item.description}
                    </div>
                    <div className="text-xs text-gray-500 capitalize mt-1">
                      {item.type.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Percentage Tips */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Percentage Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Quick 10%</div>
                <div className="text-gray-600">Move decimal one place left</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Quick 50%</div>
                <div className="text-gray-600">Divide by 2</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Quick 25%</div>
                <div className="text-gray-600">Divide by 4</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Percentage Points</div>
                <div className="text-gray-600">Different from percent change</div>
              </div>
            </div>
          </div>

          {/* Current Calculation Info */}
          <div className="bg-orange-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Current Calculation</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Type</div>
                <div className="text-gray-600">{getCurrentCalculationType()?.name}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Formula</div>
                <div className="text-gray-600 font-mono">{getCurrentCalculationType()?.formula}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Example</div>
                <div className="text-gray-600">{getCurrentCalculationType()?.example}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <BarChart3 className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">6 Calculation Types</div>
          <div className="text-sm text-gray-600">Multiple percentage operations</div>
        </div>
        <div className="text-center p-4">
          <TrendingUp className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Real-time Results</div>
          <div className="text-sm text-gray-600">Instant calculations</div>
        </div>
        <div className="text-center p-4">
          <History className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Calculation History</div>
          <div className="text-sm text-gray-600">Track your work</div>
        </div>
        <div className="text-center p-4">
          <Star className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Favorites</div>
          <div className="text-sm text-gray-600">Save common calculations</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Percentage Calculation Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use "Percentage of" to calculate discounts, tips, or commissions</li>
          <li>• "Percentage Change" shows growth or decline between two values</li>
          <li>• "Percentage Increase/Decrease" helps with markup and markdown calculations</li>
          <li>• Remember that percentage points are different from percent change</li>
          <li>• Use the formula display to understand how each calculation works</li>
        </ul>
      </div>
    </div>
  );
};

export default PercentageCalculator;