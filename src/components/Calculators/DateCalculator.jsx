import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Minus, Zap, Copy, Check, History, Star, Target, RefreshCw, ArrowRight } from 'lucide-react';

const DateCalculator = () => {
  const [calculationType, setCalculationType] = useState('add-subtract');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [daysToAdd, setDaysToAdd] = useState(7);
  const [result, setResult] = useState(null);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Calculation types with descriptions
  const calculationTypes = [
    {
      id: 'add-subtract',
      name: 'Add/Subtract Days',
      description: 'Add or subtract days from a date',
      icon: Plus,
      color: 'blue'
    },
    {
      id: 'difference',
      name: 'Date Difference',
      description: 'Calculate days between two dates',
      icon: Minus,
      color: 'green'
    },
    {
      id: 'weekday',
      name: 'Weekday Calculator',
      description: 'Find specific weekdays between dates',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 'age',
      name: 'Age Calculator',
      description: 'Calculate age from birth date',
      icon: Target,
      color: 'orange'
    }
  ];

  // Common date calculations for quick access
  const commonCalculations = [
    { type: 'add-subtract', days: 7, label: 'Add 1 week' },
    { type: 'add-subtract', days: 30, label: 'Add 1 month' },
    { type: 'add-subtract', days: 365, label: 'Add 1 year' },
    { type: 'difference', label: 'Next week from today' },
    { type: 'difference', label: '30 days from today' },
    { type: 'weekday', label: 'Weekdays this month' }
  ];

  // Common day presets
  const commonDays = [1, 7, 14, 30, 60, 90, 180, 365];

  // Calculate based on type
  const calculateDate = () => {
    const start = new Date(startDate);
    let calculationResult;
    let description = '';

    switch (calculationType) {
      case 'add-subtract':
        const resultDate = new Date(start);
        resultDate.setDate(resultDate.getDate() + parseInt(daysToAdd));
        
        calculationResult = {
          resultDate: resultDate.toISOString().split('T')[0],
          formattedDate: resultDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          daysAdded: parseInt(daysToAdd)
        };
        description = `${daysToAdd} days from ${start.toLocaleDateString()} is ${calculationResult.formattedDate}`;
        break;

      case 'difference':
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        const years = Math.floor(dayDiff / 365);
        const months = Math.floor((dayDiff % 365) / 30);
        const days = dayDiff % 30;
        const weeks = Math.floor(dayDiff / 7);
        const remainingDays = dayDiff % 7;

        calculationResult = {
          totalDays: dayDiff,
          breakdown: {
            years,
            months,
            days,
            weeks,
            remainingDays
          },
          weekdays: calculateWeekdays(start, end),
          weekends: calculateWeekends(start, end)
        };
        description = `${dayDiff} days between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`;
        break;

      case 'weekday':
        const weekEnd = new Date(endDate);
        const weekdays = calculateWeekdays(start, weekEnd);
        const weekends = calculateWeekends(start, weekEnd);
        
        calculationResult = {
          totalDays: Math.ceil((weekEnd.getTime() - start.getTime()) / (1000 * 3600 * 24)),
          weekdays,
          weekends,
          breakdown: getWeekdayBreakdown(start, weekEnd)
        };
        description = `${weekdays} weekdays and ${weekends} weekend days between dates`;
        break;

      case 'age':
        const today = new Date();
        const birthDate = new Date(startDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today > nextBirthday) {
          nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 3600 * 24));

        calculationResult = {
          age,
          nextBirthday: nextBirthday.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          daysUntilBirthday,
          birthDay: birthDate.toLocaleDateString('en-US', { weekday: 'long' }),
          isBirthdayToday: today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth()
        };
        description = `Age: ${age} years`;
        break;

      default:
        return;
    }

    setResult({
      ...calculationResult,
      calculationType: calculationType,
      description: description
    });

    // Add to history
    const historyItem = {
      id: Date.now(),
      type: calculationType,
      startDate: startDate,
      endDate: endDate,
      daysToAdd: daysToAdd,
      result: calculationResult,
      description: description,
      timestamp: new Date().toLocaleTimeString()
    };
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  // Helper functions
  const calculateWeekdays = (start, end) => {
    let weekdays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weekdays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return weekdays;
  };

  const calculateWeekends = (start, end) => {
    let weekends = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return weekends;
  };

  const getWeekdayBreakdown = (start, end) => {
    const breakdown = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0
    };
    
    const current = new Date(start);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    while (current <= end) {
      const dayName = days[current.getDay()];
      breakdown[dayName]++;
      current.setDate(current.getDate() + 1);
    }
    
    return breakdown;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setResult(null);
  };

  const resetCalculator = () => {
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setDaysToAdd(7);
    setResult(null);
    setCalculationType('add-subtract');
  };

  const setQuickCalculation = (calc) => {
    setCalculationType(calc.type);
    if (calc.days) {
      setDaysToAdd(calc.days);
    }
    calculateDate();
  };

  const addToFavorites = (calc) => {
    const fav = { ...calc, id: Date.now() };
    setFavorites(prev => [fav, ...prev.filter(f => 
      !(f.type === calc.type && f.days === calc.days)
    ).slice(0, 4)]);
  };

  const removeFromFavorites = (favId) => {
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateDate();
  }, [startDate, endDate, daysToAdd, calculationType]);

  // Get current calculation type details
  const getCurrentCalculationType = () => {
    return calculationTypes.find(type => type.id === calculationType);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Date Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calculation Type Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Calculation Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {calculationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setCalculationType(type.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      calculationType === type.id
                        ? 'border-blue-500 bg-blue-100 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <IconComponent className={`mx-auto mb-2 ${calculationType === type.id ? 'text-blue-600' : 'text-gray-600'}`} size={24} />
                    <div className={`font-semibold ${calculationType === type.id ? 'text-blue-800' : 'text-gray-700'}`}>
                      {type.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculator Card */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {calculationType === 'age' ? 'Birth Date' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-4 text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <div className="text-sm text-gray-600 mt-2">
                  {formatDate(startDate)}
                </div>
              </div>

              {/* Conditional Inputs */}
              {calculationType === 'add-subtract' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Days to Add/Subtract
                  </label>
                  <input
                    type="number"
                    value={daysToAdd}
                    onChange={(e) => setDaysToAdd(e.target.value)}
                    className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setDaysToAdd(prev => parseInt(prev) - 1)}
                      className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-semibold"
                    >
                      -1 Day
                    </button>
                    <button
                      onClick={() => setDaysToAdd(prev => parseInt(prev) + 1)}
                      className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-semibold"
                    >
                      +1 Day
                    </button>
                  </div>
                </div>
              )}

              {(calculationType === 'difference' || calculationType === 'weekday') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-4 text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <div className="text-sm text-gray-600 mt-2">
                    {formatDate(endDate)}
                  </div>
                </div>
              )}
            </div>

            {/* Common Days Presets */}
            {calculationType === 'add-subtract' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Day Selection
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {commonDays.map(days => (
                    <button
                      key={days}
                      onClick={() => setDaysToAdd(days)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        daysToAdd === days
                          ? 'border-green-500 bg-green-100 text-green-800 font-bold'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                      }`}
                    >
                      {days} day{days !== 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={calculateDate}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Zap size={24} />
                Calculate
              </button>
              <button
                onClick={clearAll}
                disabled={!result}
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
                  <div className="text-3xl font-bold text-gray-800 mb-4">
                    {result.description}
                  </div>
                  
                  {calculationType === 'add-subtract' && (
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {result.formattedDate}
                    </div>
                  )}

                  {calculationType === 'difference' && (
                    <div className="space-y-4">
                      <div className="text-4xl font-bold text-green-600">
                        {result.totalDays} days
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-semibold text-gray-800">{result.breakdown.years}</div>
                          <div className="text-gray-600">years</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-semibold text-gray-800">{result.breakdown.months}</div>
                          <div className="text-gray-600">months</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-semibold text-gray-800">{result.breakdown.weeks}</div>
                          <div className="text-gray-600">weeks</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="font-semibold text-gray-800">{result.breakdown.days}</div>
                          <div className="text-gray-600">days</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {calculationType === 'weekday' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{result.weekdays}</div>
                          <div className="text-gray-600">Weekdays</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{result.weekends}</div>
                          <div className="text-gray-600">Weekend Days</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {calculationType === 'age' && (
                    <div className="space-y-4">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {result.age} years old
                      </div>
                      {result.isBirthdayToday && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                          <div className="font-semibold text-yellow-800">🎉 Happy Birthday! 🎉</div>
                        </div>
                      )}
                      <div className="text-lg text-gray-600">
                        Next birthday: {result.nextBirthday}
                      </div>
                      <div className="text-lg text-gray-600">
                        {result.daysUntilBirthday} days until next birthday
                      </div>
                      <div className="text-lg text-gray-600">
                        Born on a {result.birthDay}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={copyToClipboard}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 mx-auto"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Result'}
                  </button>
                </div>
              </div>

              {/* Additional Details */}
              {calculationType === 'weekday' && result.breakdown && (
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Day Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(result.breakdown).map(([day, count]) => (
                      <div key={day} className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                        <div className="font-semibold text-gray-800">{day}</div>
                        <div className="text-2xl font-bold text-blue-600">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                      <div className="font-semibold text-gray-800 text-sm">
                        {item.description}
                      </div>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {item.type.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Tips */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Date Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Business Days</div>
                <div className="text-gray-600">Typically Monday-Friday excluding holidays</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Leap Years</div>
                <div className="text-gray-600">Adds February 29th every 4 years</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Date Formats</div>
                <div className="text-gray-600">YYYY-MM-DD is international standard</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Time Zones</div>
                <div className="text-gray-600">Consider time zones for exact calculations</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-orange-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setStartDate(new Date().toISOString().split('T')[0])}
                className="w-full p-3 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Set to Today</div>
                <div className="text-sm text-gray-600">Use current date as start</div>
              </button>
              <button
                onClick={() => setEndDate(new Date().toISOString().split('T')[0])}
                className="w-full p-3 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Set End to Today</div>
                <div className="text-sm text-gray-600">Use current date as end</div>
              </button>
              <button
                onClick={() => setDaysToAdd(0)}
                className="w-full p-3 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Reset Days</div>
                <div className="text-sm text-gray-600">Set days to add to zero</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Calendar className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">4 Calculation Types</div>
          <div className="text-sm text-gray-600">Multiple date operations</div>
        </div>
        <div className="text-center p-4">
          <Clock className="mx-auto text-green-600 mb-2" size={32} />
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
        <h4 className="font-bold text-blue-900 mb-2">💡 Date Calculation Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use "Add/Subtract Days" for project deadlines and event planning</li>
          <li>• "Date Difference" is perfect for calculating durations and periods</li>
          <li>• "Weekday Calculator" helps with business day calculations excluding weekends</li>
          <li>• "Age Calculator" automatically handles leap years and birthday calculations</li>
          <li>• Remember that date calculations consider month lengths and leap years automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default DateCalculator;