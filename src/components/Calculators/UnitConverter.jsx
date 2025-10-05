import { useState, useEffect } from 'react';
import { Calculator, Ruler, Scale, Thermometer, Zap, Clock, Droplets, Navigation, RefreshCw, Copy, Check, Star, History } from 'lucide-react';

const UnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [conversionRate, setConversionRate] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Unit conversion data
  const unitCategories = {
    length: {
      name: 'Length',
      icon: Ruler,
      units: {
        meter: { name: 'Meter', symbol: 'm', factor: 1 },
        kilometer: { name: 'Kilometer', symbol: 'km', factor: 1000 },
        centimeter: { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
        millimeter: { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
        mile: { name: 'Mile', symbol: 'mi', factor: 1609.34 },
        yard: { name: 'Yard', symbol: 'yd', factor: 0.9144 },
        foot: { name: 'Foot', symbol: 'ft', factor: 0.3048 },
        inch: { name: 'Inch', symbol: 'in', factor: 0.0254 }
      }
    },
    weight: {
      name: 'Weight',
      icon: Scale,
      units: {
        kilogram: { name: 'Kilogram', symbol: 'kg', factor: 1 },
        gram: { name: 'Gram', symbol: 'g', factor: 0.001 },
        milligram: { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
        pound: { name: 'Pound', symbol: 'lb', factor: 0.453592 },
        ounce: { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
        ton: { name: 'Ton', symbol: 't', factor: 1000 }
      }
    },
    temperature: {
      name: 'Temperature',
      icon: Thermometer,
      units: {
        celsius: { name: 'Celsius', symbol: '°C', isTemperature: true },
        fahrenheit: { name: 'Fahrenheit', symbol: '°F', isTemperature: true },
        kelvin: { name: 'Kelvin', symbol: 'K', isTemperature: true }
      }
    },
    time: {
      name: 'Time',
      icon: Clock,
      units: {
        second: { name: 'Second', symbol: 's', factor: 1 },
        minute: { name: 'Minute', symbol: 'min', factor: 60 },
        hour: { name: 'Hour', symbol: 'hr', factor: 3600 },
        day: { name: 'Day', symbol: 'day', factor: 86400 },
        week: { name: 'Week', symbol: 'week', factor: 604800 },
        month: { name: 'Month', symbol: 'month', factor: 2592000 },
        year: { name: 'Year', symbol: 'year', factor: 31536000 }
      }
    },
    volume: {
      name: 'Volume',
      icon: Droplets,
      units: {
        liter: { name: 'Liter', symbol: 'L', factor: 1 },
        milliliter: { name: 'Milliliter', symbol: 'mL', factor: 0.001 },
        gallon: { name: 'Gallon', symbol: 'gal', factor: 3.78541 },
        quart: { name: 'Quart', symbol: 'qt', factor: 0.946353 },
        pint: { name: 'Pint', symbol: 'pt', factor: 0.473176 },
        cup: { name: 'Cup', symbol: 'cup', factor: 0.24 }
      }
    },
    speed: {
      name: 'Speed',
      icon: Zap,
      units: {
        'm/s': { name: 'Meters per Second', symbol: 'm/s', factor: 1 },
        'km/h': { name: 'Kilometers per Hour', symbol: 'km/h', factor: 0.277778 },
        'mph': { name: 'Miles per Hour', symbol: 'mph', factor: 0.44704 },
        'knot': { name: 'Knot', symbol: 'kn', factor: 0.514444 },
        'ft/s': { name: 'Feet per Second', symbol: 'ft/s', factor: 0.3048 }
      }
    },
    area: {
      name: 'Area',
      icon: Navigation,
      units: {
        'square-meter': { name: 'Square Meter', symbol: 'm²', factor: 1 },
        'square-kilometer': { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
        'square-mile': { name: 'Square Mile', symbol: 'mi²', factor: 2589988.11 },
        'square-foot': { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
        'square-inch': { name: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
        hectare: { name: 'Hectare', symbol: 'ha', factor: 10000 },
        acre: { name: 'Acre', symbol: 'ac', factor: 4046.86 }
      }
    }
  };

  // Temperature conversion functions
  const temperatureConversions = {
    celsius: {
      fahrenheit: (c) => (c * 9/5) + 32,
      kelvin: (c) => c + 273.15
    },
    fahrenheit: {
      celsius: (f) => (f - 32) * 5/9,
      kelvin: (f) => (f - 32) * 5/9 + 273.15
    },
    kelvin: {
      celsius: (k) => k - 273.15,
      fahrenheit: (k) => (k - 273.15) * 9/5 + 32
    }
  };

  // Popular conversions for quick access
  const popularConversions = [
    { category: 'length', from: 'meter', to: 'foot', label: 'Meters to Feet' },
    { category: 'weight', from: 'kilogram', to: 'pound', label: 'Kg to Pounds' },
    { category: 'temperature', from: 'celsius', to: 'fahrenheit', label: '°C to °F' },
    { category: 'length', from: 'kilometer', to: 'mile', label: 'Km to Miles' },
    { category: 'volume', from: 'liter', to: 'gallon', label: 'Liters to Gallons' },
    { category: 'speed', from: 'km/h', to: 'mph', label: 'km/h to mph' }
  ];

  // Initialize default units when category changes
  useEffect(() => {
    const units = Object.keys(unitCategories[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
  }, [category]);

  // Convert units
  const convertUnits = () => {
    if (!inputValue || isNaN(inputValue) || !fromUnit || !toUnit) {
      setOutputValue('');
      return;
    }

    const value = parseFloat(inputValue);
    const categoryData = unitCategories[category];
    const fromUnitData = categoryData.units[fromUnit];
    const toUnitData = categoryData.units[toUnit];

    let result;
    let rate;

    if (fromUnitData.isTemperature && toUnitData.isTemperature) {
      // Temperature conversion
      result = temperatureConversions[fromUnit][toUnit](value);
      rate = temperatureConversions[fromUnit][toUnit](1);
    } else {
      // Standard unit conversion
      const valueInBase = value * fromUnitData.factor;
      result = valueInBase / toUnitData.factor;
      rate = fromUnitData.factor / toUnitData.factor;
    }

    setOutputValue(result.toFixed(6));
    setConversionRate(rate);

    // Add to history
    const historyItem = {
      id: Date.now(),
      category: category,
      from: fromUnit,
      to: toUnit,
      input: value,
      output: result,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  // Auto-convert when input or units change
  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      convertUnits();
    }
  }, [inputValue, fromUnit, toUnit]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const copyToClipboard = async () => {
    if (outputValue) {
      const text = `${inputValue} ${unitCategories[category].units[fromUnit].symbol} = ${outputValue} ${unitCategories[category].units[toUnit].symbol}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInputValue('');
    setOutputValue('');
  };

  const setQuickConversion = (conv) => {
    setCategory(conv.category);
    setFromUnit(conv.from);
    setToUnit(conv.to);
  };

  const addToFavorites = (conv) => {
    const fav = { ...conv, id: Date.now() };
    setFavorites(prev => [fav, ...prev.filter(f => !(f.category === conv.category && f.from === conv.from && f.to === conv.to)).slice(0, 4)]);
  };

  const removeFromFavorites = (favId) => {
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  const getCategoryIcon = (cat) => {
    const IconComponent = unitCategories[cat].icon;
    return <IconComponent size={20} />;
  };

  const getUnitSymbol = (unit) => {
    return unitCategories[category].units[unit]?.symbol || '';
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Unit Converter</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Converter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Converter Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Conversion Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(unitCategories).map(([key, categoryData]) => {
                  const IconComponent = categoryData.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        category === key
                          ? 'border-blue-500 bg-blue-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <IconComponent className={`mx-auto mb-2 ${category === key ? 'text-blue-600' : 'text-gray-600'}`} size={24} />
                      <div className={`font-semibold ${category === key ? 'text-blue-800' : 'text-gray-700'}`}>
                        {categoryData.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversion Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Input Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* From Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From Unit
                </label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none font-semibold"
                >
                  {Object.entries(unitCategories[category].units).map(([key, unit]) => (
                    <option key={key} value={key}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To Unit
                </label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none font-semibold"
                >
                  {Object.entries(unitCategories[category].units).map(([key, unit]) => (
                    <option key={key} value={key}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={swapUnits}
                className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition transform hover:rotate-180 duration-300"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={convertUnits}
                disabled={!inputValue}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Calculator size={24} />
                Convert
              </button>
              <button
                onClick={clearAll}
                disabled={!inputValue}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition font-semibold"
              >
                Clear
              </button>
            </div>

            {/* Conversion Result */}
            {outputValue && (
              <div className="mt-6 p-6 bg-white border-2 border-green-300 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {inputValue} {getUnitSymbol(fromUnit)} =
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-4">
                    {outputValue} {getUnitSymbol(toUnit)}
                  </div>
                  <div className="text-lg text-gray-600 mb-2">
                    1 {getUnitSymbol(fromUnit)} = {conversionRate.toFixed(6)} {getUnitSymbol(toUnit)}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 mx-auto"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Result'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Popular Conversions */}
          <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="text-yellow-600" />
              Popular Conversions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularConversions.map((conversion, index) => (
                <button
                  key={index}
                  onClick={() => setQuickConversion(conversion)}
                  className="p-3 bg-white hover:bg-yellow-100 border border-yellow-200 rounded-lg transition text-center group"
                >
                  <div className="font-semibold text-gray-800">{conversion.label}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {unitCategories[conversion.category].units[conversion.from].symbol} → {unitCategories[conversion.category].units[conversion.to].symbol}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(conversion);
                    }}
                    className="mt-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star size={14} className="text-gray-400 hover:text-yellow-500" />
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Conversion History */}
          {history.length > 0 && (
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <History className="text-green-600" />
                  Recent Conversions
                </h3>
                <button
                  onClick={() => setHistory([])}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {item.input} {unitCategories[item.category].units[item.from].symbol}
                        </div>
                        <div className="text-sm text-gray-500">{item.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {item.output.toFixed(4)} {unitCategories[item.category].units[item.to].symbol}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {unitCategories[item.category].name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Favorites */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-purple-600" />
              Favorite Conversions
            </h3>
            <div className="space-y-3">
              {favorites.length > 0 ? (
                favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg group"
                  >
                    <button
                      onClick={() => setQuickConversion(fav)}
                      className="flex-1 text-left"
                    >
                      <div className="font-semibold text-gray-800">{fav.label}</div>
                      <div className="text-sm text-gray-600">
                        {unitCategories[fav.category].units[fav.from].symbol} → {unitCategories[fav.category].units[fav.to].symbol}
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
                  No favorites yet. Click the star on popular conversions to add them here.
                </div>
              )}
            </div>
          </div>

          {/* Conversion Tips */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Conversion Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Length Conversions</div>
                <div className="text-gray-600">1 meter = 3.28084 feet</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Weight Conversions</div>
                <div className="text-gray-600">1 kilogram = 2.20462 pounds</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Temperature</div>
                <div className="text-gray-600">°C to °F: (C × 9/5) + 32</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Volume</div>
                <div className="text-gray-600">1 liter = 0.264172 gallons</div>
              </div>
            </div>
          </div>

          {/* Category Info */}
          <div className="bg-orange-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {unitCategories[category].name} Units
            </h3>
            <div className="space-y-2 text-sm">
              {Object.entries(unitCategories[category].units).map(([key, unit]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium text-gray-700">{unit.name}</span>
                  <span className="text-gray-600">{unit.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Ruler className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">7 Categories</div>
          <div className="text-sm text-gray-600">Length, weight, temperature, etc.</div>
        </div>
        <div className="text-center p-4">
          <Zap className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Real-time</div>
          <div className="text-sm text-gray-600">Instant conversions</div>
        </div>
        <div className="text-center p-4">
          <History className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">History</div>
          <div className="text-sm text-gray-600">Track conversions</div>
        </div>
        <div className="text-center p-4">
          <Star className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Favorites</div>
          <div className="text-sm text-gray-600">Save common conversions</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Unit Conversion Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Temperature conversions use different formulas than other units</li>
          <li>• Use favorites for frequently used conversions</li>
          <li>• The swap button quickly reverses your conversion</li>
          <li>• All conversions are calculated with high precision</li>
          <li>• Check the conversion rate to understand the relationship between units</li>
        </ul>
      </div>
    </div>
  );
};

export default UnitConverter;
