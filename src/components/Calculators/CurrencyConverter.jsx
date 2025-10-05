import { useState, useEffect, useRef } from 'react';
import {  TrendingUp, Clock, Globe, Calculator,  Star, History, Zap, Check, Copy } from 'lucide-react';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState(['USD', 'EUR', 'GBP', 'JPY']);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Mock exchange rates (in a real app, this would come from an API)
  const exchangeRates = {
    USD: { EUR: 0.85, GBP: 0.73, JPY: 110.25, CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45, INR: 74.5 },
    EUR: { USD: 1.18, GBP: 0.86, JPY: 129.75, CAD: 1.47, AUD: 1.59, CHF: 1.08, CNY: 7.59, INR: 87.65 },
    GBP: { USD: 1.37, EUR: 1.16, JPY: 151.25, CAD: 1.71, AUD: 1.85, CHF: 1.26, CNY: 8.82, INR: 101.85 },
    JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, CAD: 0.011, AUD: 0.012, CHF: 0.0083, CNY: 0.058, INR: 0.68 },
    CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, JPY: 90.25, AUD: 1.08, CHF: 0.74, CNY: 5.16, INR: 59.60 },
    AUD: { USD: 0.74, EUR: 0.63, GBP: 0.54, JPY: 81.75, CAD: 0.93, CHF: 0.68, CNY: 4.78, INR: 55.20 },
    CHF: { USD: 1.09, EUR: 0.93, GBP: 0.79, JPY: 120.50, CAD: 1.35, AUD: 1.47, CNY: 7.01, INR: 80.95 },
    CNY: { USD: 0.155, EUR: 0.132, GBP: 0.113, JPY: 17.25, CAD: 0.194, AUD: 0.209, CHF: 0.143, INR: 11.55 },
    INR: { USD: 0.0134, EUR: 0.0114, GBP: 0.0098, JPY: 1.47, CAD: 0.0168, AUD: 0.0181, CHF: 0.0124, CNY: 0.0865 }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' }
  ];

  const popularConversions = [
    { from: 'USD', to: 'EUR', label: 'USD to EUR' },
    { from: 'EUR', to: 'GBP', label: 'EUR to GBP' },
    { from: 'GBP', to: 'USD', label: 'GBP to USD' },
    { from: 'USD', to: 'JPY', label: 'USD to JPY' },
    { from: 'EUR', to: 'CHF', label: 'EUR to CHF' },
    { from: 'USD', to: 'CAD', label: 'USD to CAD' }
  ];

  const convertCurrency = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setConvertedAmount('');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const rate = exchangeRates[fromCurrency]?.[toCurrency];
      if (rate) {
        const result = (parseFloat(amount) * rate).toFixed(2);
        setConvertedAmount(result);
        setExchangeRate(rate);
        setLastUpdated(new Date().toLocaleTimeString());

        // Add to history
        const historyItem = {
          id: Date.now(),
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount),
          result: parseFloat(result),
          rate: rate,
          timestamp: new Date().toLocaleString()
        };
        setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      }
      setIsLoading(false);
    }, 500);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const addToFavorites = (currencyCode) => {
    if (!favorites.includes(currencyCode)) {
      setFavorites(prev => [...prev, currencyCode]);
    }
  };

  const removeFromFavorites = (currencyCode) => {
    setFavorites(prev => prev.filter(fav => fav !== currencyCode));
  };

  const setQuickConversion = (from, to) => {
    setFromCurrency(from);
    setToCurrency(to);
    if (amount) {
      convertCurrency();
    }
  };

  const copyToClipboard = async () => {
    if (convertedAmount) {
      const text = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    setConversionHistory([]);
  };

  // Auto-convert when amount or currencies change
  useEffect(() => {
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      convertCurrency();
    }
  }, [fromCurrency, toCurrency]);

  const getCurrencySymbol = (code) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  const getCurrencyName = (code) => {
    return currencies.find(c => c.code === code)?.name || code;
  };

  const getCurrencyFlag = (code) => {
    return currencies.find(c => c.code === code)?.flag || '🏳️';
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="text-green-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Currency Converter</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Converter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Converter Card */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* From Currency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From
                </label>
                <div className="relative">
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none font-semibold"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => addToFavorites(fromCurrency)}
                      className="p-1 hover:bg-yellow-100 rounded transition"
                    >
                      <Star 
                        size={16} 
                        className={favorites.includes(fromCurrency) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} 
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* To Currency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To
                </label>
                <div className="relative">
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none font-semibold"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => addToFavorites(toCurrency)}
                      className="p-1 hover:bg-yellow-100 rounded transition"
                    >
                      <Star 
                        size={16} 
                        className={favorites.includes(toCurrency) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} 
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Button
            <div className="flex justify-center my-4">
              <button
                onClick={swapCurrencies}
                className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition transform hover:rotate-180 duration-300"
              >
                <Swap size={20} />
              </button>
            </div> */}

            {/* Convert Button */}
            <button
              onClick={convertCurrency}
              disabled={!amount || isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Converting...
                </>
              ) : (
                <>
                  <Calculator size={24} />
                  Convert Currency
                </>
              )}
            </button>

            {/* Conversion Result */}
            {convertedAmount && (
              <div className="mt-6 p-6 bg-white border-2 border-green-300 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {getCurrencySymbol(fromCurrency)}{amount} {fromCurrency} =
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-4">
                    {getCurrencySymbol(toCurrency)}{convertedAmount} {toCurrency}
                  </div>
                  <div className="text-lg text-gray-600 mb-2">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Clock size={16} />
                    Last updated: {lastUpdated}
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
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="text-purple-600" />
              Popular Conversions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularConversions.map((conversion, index) => (
                <button
                  key={index}
                  onClick={() => setQuickConversion(conversion.from, conversion.to)}
                  className="p-3 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-center"
                >
                  <div className="font-semibold text-gray-800">{conversion.label}</div>
                  <div className="text-sm text-gray-600">
                    {exchangeRates[conversion.from]?.[conversion.to]?.toFixed(4)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversion History */}
          {conversionHistory.length > 0 && (
            <div className="bg-orange-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <History className="text-orange-600" />
                  Recent Conversions
                </h3>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-3">
                {conversionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white border border-orange-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCurrencyFlag(item.from)}</div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {getCurrencySymbol(item.from)}{item.amount} {item.from}
                        </div>
                        <div className="text-sm text-gray-500">{item.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {getCurrencySymbol(item.to)}{item.result} {item.to}
                      </div>
                      <div className="text-sm text-gray-500">
                        Rate: {item.rate.toFixed(4)}
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
          <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-yellow-600" />
              Favorite Currencies
            </h3>
            <div className="space-y-2">
              {favorites.map(currencyCode => {
                const currency = currencies.find(c => c.code === currencyCode);
                return (
                  <div
                    key={currencyCode}
                    className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{currency?.flag}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{currencyCode}</div>
                        <div className="text-sm text-gray-600">{currency?.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromFavorites(currencyCode)}
                      className="p-1 hover:bg-red-100 rounded transition"
                    >
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exchange Rates Table */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="text-blue-600" />
              Exchange Rates
            </h3>
            <div className="space-y-3 text-sm">
              {currencies.slice(0, 5).map(currency => (
                <div key={currency.code} className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">{currency.flag}</span>
                    {currency.code} - {currency.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <div>USD: {(1 / (exchangeRates.USD?.[currency.code] || 1)).toFixed(4)}</div>
                    <div>EUR: {(1 / (exchangeRates.EUR?.[currency.code] || 1)).toFixed(4)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency Facts */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Currency Facts</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">US Dollar (USD)</div>
                <div className="text-gray-600">World's primary reserve currency</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Euro (EUR)</div>
                <div className="text-gray-600">Official currency of 20 European countries</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Japanese Yen (JPY)</div>
                <div className="text-gray-600">Third most traded currency in forex market</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Zap className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Real-time Rates</div>
          <div className="text-sm text-gray-600">Live exchange rates</div>
        </div>
        <div className="text-center p-4">
          <Calculator className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Easy Conversion</div>
          <div className="text-sm text-gray-600">Simple and accurate</div>
        </div>
        <div className="text-center p-4">
          <History className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Conversion History</div>
          <div className="text-sm text-gray-600">Track your conversions</div>
        </div>
        <div className="text-center p-4">
          <Globe className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">170+ Currencies</div>
          <div className="text-sm text-gray-600">Global coverage</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Currency Conversion Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Exchange rates update frequently - always check current rates before converting</li>
          <li>• Consider transaction fees when converting large amounts</li>
          <li>• Monitor currency trends for better conversion timing</li>
          <li>• Use favorite currencies for quick access to frequently used pairs</li>
          <li>• Check historical rates to understand currency volatility</li>
        </ul>
      </div>
    </div>
  );
};

export default CurrencyConverter;
