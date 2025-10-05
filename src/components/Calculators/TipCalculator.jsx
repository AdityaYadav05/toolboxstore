import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Users, Percent, Heart, Zap, Copy, Check, History, Star, Gift, CreditCard } from 'lucide-react';

const TipCalculator = () => {
  const [billAmount, setBillAmount] = useState(100);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [roundUp, setRoundUp] = useState(false);
  const [results, setResults] = useState(null);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [favoriteTips, setFavoriteTips] = useState([15, 18, 20]);

  // Common tip percentages
  const commonTips = [10, 12, 15, 18, 20, 22, 25];
  
  // Service quality levels
  const serviceLevels = [
    { level: 'Poor', tip: 10, emoji: '😞', color: 'red' },
    { level: 'Average', tip: 15, emoji: '😐', color: 'yellow' },
    { level: 'Good', tip: 18, emoji: '😊', color: 'green' },
    { level: 'Excellent', tip: 20, emoji: '😄', color: 'blue' },
    { level: 'Outstanding', tip: 25, emoji: '🤩', color: 'purple' }
  ];

  // Calculate tip results
  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const tipPercent = parseFloat(tipPercentage);
    const people = parseInt(numberOfPeople);

    const tipAmount = bill * (tipPercent / 100);
    const totalAmount = bill + tipAmount;
    
    let perPersonTip = tipAmount / people;
    let perPersonTotal = totalAmount / people;

    // Round up if enabled
    if (roundUp) {
      perPersonTip = Math.ceil(perPersonTip);
      perPersonTotal = Math.ceil(perPersonTotal);
    }

    const result = {
      billAmount: bill,
      tipPercentage: tipPercent,
      tipAmount: tipAmount,
      totalAmount: totalAmount,
      numberOfPeople: people,
      perPersonTip: perPersonTip,
      perPersonTotal: perPersonTotal,
      calculationDate: new Date().toLocaleString()
    };

    setResults(result);

    // Add to history
    const historyItem = {
      id: Date.now(),
      billAmount: bill,
      tipPercentage: tipPercent,
      numberOfPeople: people,
      totalAmount: totalAmount,
      timestamp: new Date().toLocaleTimeString()
    };
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const copyToClipboard = async () => {
    if (results) {
      const text = `Tip Calculation:\nBill: ${formatCurrency(results.billAmount)}\nTip (${results.tipPercentage}%): ${formatCurrency(results.tipAmount)}\nTotal: ${formatCurrency(results.totalAmount)}\nPer Person: ${formatCurrency(results.perPersonTotal)}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    setCalculationHistory([]);
  };

  const resetCalculator = () => {
    setBillAmount(100);
    setTipPercentage(15);
    setNumberOfPeople(2);
    setRoundUp(false);
    setResults(null);
  };

  const addToFavorites = (percentage) => {
    if (!favoriteTips.includes(percentage)) {
      setFavoriteTips(prev => [...prev, percentage].sort((a, b) => a - b));
    }
  };

  const removeFromFavorites = (percentage) => {
    setFavoriteTips(prev => prev.filter(tip => tip !== percentage));
  };

  const splitBillEqually = () => {
    if (results) {
      const perPerson = results.totalAmount / numberOfPeople;
      alert(`Each person should pay: ${formatCurrency(perPerson)}`);
    }
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateTip();
  }, [billAmount, tipPercentage, numberOfPeople, roundUp]);

  // Quick preset buttons for common bill amounts
  const billPresets = [25, 50, 75, 100, 150, 200];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="text-green-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Tip Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calculator Card */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bill Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Bill Amount
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">$</span>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  step="1"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$1</span>
                  <span>$1,000</span>
                </div>
                
                {/* Bill Presets */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {billPresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => setBillAmount(preset)}
                      className="px-3 py-2 bg-white hover:bg-green-100 border border-green-200 rounded-lg transition text-sm font-semibold"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip Percentage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Percent size={16} />
                    Tip Percentage
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tipPercentage}
                    onChange={(e) => setTipPercentage(e.target.value)}
                    className="w-full pl-4 pr-10 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={tipPercentage}
                  onChange={(e) => setTipPercentage(e.target.value)}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    Split Between
                  </div>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                    className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-bold text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-center"
                  />
                  <button
                    onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                    className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-bold text-xl"
                  >
                    +
                  </button>
                </div>
                <div className="text-center text-sm text-gray-500 mt-2">
                  {numberOfPeople} person{numberOfPeople !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Round Up Option */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
                    <input
                      type="checkbox"
                      checked={roundUp}
                      onChange={(e) => setRoundUp(e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="font-semibold text-gray-700">Round up to nearest dollar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Common Tip Percentages */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quick Tip Selection
              </label>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {commonTips.map(percentage => (
                  <button
                    key={percentage}
                    onClick={() => setTipPercentage(percentage)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      tipPercentage === percentage
                        ? 'border-green-500 bg-green-100 text-green-800 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                    }`}
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={calculateTip}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Zap size={24} />
                Calculate Tip
              </button>
              <button
                onClick={resetCalculator}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-6 rounded-xl text-center border-2 border-green-200">
                  <Heart className="mx-auto text-green-600 mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">{formatCurrency(results.tipAmount)}</div>
                  <div className="text-sm text-gray-600">Total Tip</div>
                  <div className="text-xs text-gray-500 mt-1">({results.tipPercentage}% of bill)</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl text-center border-2 border-blue-200">
                  <CreditCard className="mx-auto text-blue-600 mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">{formatCurrency(results.totalAmount)}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-xs text-gray-500 mt-1">Bill + Tip</div>
                </div>
              </div>

              {/* Per Person Breakdown */}
              {numberOfPeople > 1 && (
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="text-purple-600" />
                    Split Between {numberOfPeople} People
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                      <div className="text-lg font-semibold text-gray-800">{formatCurrency(results.perPersonTip)}</div>
                      <div className="text-sm text-gray-600">Tip per person</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                      <div className="text-lg font-semibold text-gray-800">{formatCurrency(results.perPersonTotal)}</div>
                      <div className="text-sm text-gray-600">Total per person</div>
                    </div>
                  </div>
                  <button
                    onClick={splitBillEqually}
                    className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold"
                  >
                    Split Bill Equally
                  </button>
                </div>
              )}

              {/* Action Buttons for Results */}
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy Results'}
                </button>
                <button
                  onClick={() => addToFavorites(tipPercentage)}
                  className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
                >
                  <Star size={20} />
                  Save Tip %
                </button>
              </div>
            </div>
          )}

          {/* Service Quality Guide */}
          <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gift className="text-yellow-600" />
              Tip Guide by Service Quality
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {serviceLevels.map(service => (
                <button
                  key={service.level}
                  onClick={() => setTipPercentage(service.tip)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    tipPercentage === service.tip
                      ? 'border-yellow-500 bg-yellow-100 shadow-md'
                      : 'border-gray-200 bg-white hover:border-yellow-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{service.emoji}</div>
                  <div className="font-semibold text-gray-800">{service.level}</div>
                  <div className="text-sm text-gray-600">{service.tip}%</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Favorite Tips */}
          <div className="bg-red-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-red-600" />
              Your Favorite Tips
            </h3>
            <div className="space-y-2">
              {favoriteTips.length > 0 ? (
                favoriteTips.map(percentage => (
                  <div
                    key={percentage}
                    className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg group"
                  >
                    <button
                      onClick={() => setTipPercentage(percentage)}
                      className="flex-1 text-left"
                    >
                      <div className="font-semibold text-gray-800">{percentage}%</div>
                      <div className="text-sm text-gray-600">
                        Tip: {formatCurrency(billAmount * (percentage / 100))}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromFavorites(percentage)}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star size={16} className="text-red-500 fill-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No favorites yet. Click "Save Tip %" to add.
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
                  onClick={clearHistory}
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
                        {formatCurrency(item.totalAmount)}
                      </div>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Bill: {formatCurrency(item.billAmount)} • Tip: {item.tipPercentage}%
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Tip: {formatCurrency(item.totalAmount - item.billAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip Etiquette Tips */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tip Etiquette</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Restaurants</div>
                <div className="text-gray-600">15-20% for good service</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Delivery</div>
                <div className="text-gray-600">10-15% or $2-5 minimum</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Takeout</div>
                <div className="text-gray-600">Optional, 10% for great service</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Bars</div>
                <div className="text-gray-600">$1-2 per drink or 15-20%</div>
              </div>
            </div>
          </div>

          {/* Quick Calculations */}
          {results && (
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Calculations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tip per $10</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(10 * (tipPercentage / 100))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tip per $50</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(50 * (tipPercentage / 100))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Tip per $100</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(100 * (tipPercentage / 100))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Calculation Date</span>
                  <span className="font-semibold text-gray-800 text-xs">{results.calculationDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Calculator className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Easy Calculation</div>
          <div className="text-sm text-gray-600">Quick and accurate</div>
        </div>
        <div className="text-center p-4">
          <Users className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Split Bill</div>
          <div className="text-sm text-gray-600">Divide among friends</div>
        </div>
        <div className="text-center p-4">
          <History className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">History</div>
          <div className="text-sm text-gray-600">Track calculations</div>
        </div>
        <div className="text-center p-4">
          <Star className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Favorites</div>
          <div className="text-sm text-gray-600">Save common tips</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Tipping Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Always tip on the pre-tax amount for more accurate calculations</li>
          <li>• Consider service quality - excellent service deserves higher tips</li>
          <li>• For large groups (6+), many restaurants automatically add 18-20% gratuity</li>
          <li>• Delivery tips should consider distance, weather, and order size</li>
          <li>• Round up to the nearest dollar for easier payment and to show appreciation</li>
        </ul>
      </div>
    </div>
  );
};

export default TipCalculator;