import { useState, useEffect } from 'react';
import { Globe, Clock, MapPin, Search, Copy, Check, History, Star, Zap, RefreshCw, Sunrise, Sunset } from 'lucide-react';

const TimeZoneConverter = () => {
  const [fromTimeZone, setFromTimeZone] = useState('America/New_York');
  const [toTimeZone, setToTimeZone] = useState('Europe/London');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [convertedTime, setConvertedTime] = useState(null);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Popular time zones with additional info
  const timeZones = [
    { id: 'America/New_York', name: 'New York', offset: '-05:00', country: 'US', emoji: '🇺🇸' },
    { id: 'America/Los_Angeles', name: 'Los Angeles', offset: '-08:00', country: 'US', emoji: '🇺🇸' },
    { id: 'America/Chicago', name: 'Chicago', offset: '-06:00', country: 'US', emoji: '🇺🇸' },
    { id: 'Europe/London', name: 'London', offset: '+00:00', country: 'UK', emoji: '🇬🇧' },
    { id: 'Europe/Paris', name: 'Paris', offset: '+01:00', country: 'France', emoji: '🇫🇷' },
    { id: 'Europe/Berlin', name: 'Berlin', offset: '+01:00', country: 'Germany', emoji: '🇩🇪' },
    { id: 'Asia/Tokyo', name: 'Tokyo', offset: '+09:00', country: 'Japan', emoji: '🇯🇵' },
    { id: 'Asia/Shanghai', name: 'Shanghai', offset: '+08:00', country: 'China', emoji: '🇨🇳' },
    { id: 'Asia/Dubai', name: 'Dubai', offset: '+04:00', country: 'UAE', emoji: '🇦🇪' },
    { id: 'Asia/Kolkata', name: 'Mumbai', offset: '+05:30', country: 'India', emoji: '🇮🇳' },
    { id: 'Australia/Sydney', name: 'Sydney', offset: '+10:00', country: 'Australia', emoji: '🇦🇺' },
    { id: 'Pacific/Auckland', name: 'Auckland', offset: '+12:00', country: 'New Zealand', emoji: '🇳🇿' },
    { id: 'America/Toronto', name: 'Toronto', offset: '-05:00', country: 'Canada', emoji: '🇨🇦' },
    { id: 'America/Sao_Paulo', name: 'São Paulo', offset: '-03:00', country: 'Brazil', emoji: '🇧🇷' },
    { id: 'Africa/Johannesburg', name: 'Johannesburg', offset: '+02:00', country: 'South Africa', emoji: '🇿🇦' },
    { id: 'Asia/Singapore', name: 'Singapore', offset: '+08:00', country: 'Singapore', emoji: '🇸🇬' }
  ];

  // Common time zone pairs for quick access
  const commonConversions = [
    { from: 'America/New_York', to: 'Europe/London', label: 'NY to London' },
    { from: 'America/Los_Angeles', to: 'Asia/Tokyo', label: 'LA to Tokyo' },
    { from: 'Europe/London', to: 'Asia/Singapore', label: 'London to Singapore' },
    { from: 'America/New_York', to: 'Asia/Kolkata', label: 'NY to Mumbai' },
    { from: 'Europe/Paris', to: 'America/Chicago', label: 'Paris to Chicago' },
    { from: 'Asia/Tokyo', to: 'Australia/Sydney', label: 'Tokyo to Sydney' }
  ];

  // Calculate time zone conversion
  const convertTimeZone = () => {
    const fromTZ = timeZones.find(tz => tz.id === fromTimeZone);
    const toTZ = timeZones.find(tz => tz.id === toTimeZone);
    
    if (!fromTZ || !toTZ) return;

    const inputDate = new Date(dateTime);
    
    // Format times in respective time zones
    const fromTime = formatTimeInTimeZone(inputDate, fromTZ.id);
    const toTime = formatTimeInTimeZone(inputDate, toTZ.id);
    
    // Calculate time difference
    const fromOffset = getTimezoneOffset(fromTZ.id, inputDate);
    const toOffset = getTimezoneOffset(toTZ.id, inputDate);
    const hourDifference = (toOffset - fromOffset) / (60 * 60 * 1000);

    // Get additional time info
    const fromSunInfo = calculateSunTimes(inputDate, fromTZ.id);
    const toSunInfo = calculateSunTimes(inputDate, toTZ.id);

    const result = {
      fromTime: fromTime,
      toTime: toTime,
      fromTimezone: fromTZ,
      toTimezone: toTZ,
      hourDifference: hourDifference,
      fromSunInfo: fromSunInfo,
      toSunInfo: toSunInfo,
      isAhead: hourDifference > 0,
      sameDay: isSameDay(inputDate, fromTZ.id, toTZ.id),
      calculationDate: new Date().toLocaleString()
    };

    setConvertedTime(result);

    // Add to history
    const historyItem = {
      id: Date.now(),
      from: fromTZ.id,
      to: toTZ.id,
      fromTime: fromTime.time12,
      toTime: toTime.time12,
      hourDifference: hourDifference,
      timestamp: new Date().toLocaleTimeString()
    };
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  // Helper function to format time in specific timezone
  const formatTimeInTimeZone = (date, timeZone) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const parts = formatter.formatToParts(date);
    const time12 = `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value} ${parts.find(p => p.type === 'dayPeriod').value}`;
    const time24 = date.toLocaleTimeString('en-US', { timeZone, hour12: false });
    const dateFormatted = `${parts.find(p => p.type === 'weekday').value}, ${parts.find(p => p.type === 'month').value} ${parts.find(p => p.type === 'day').value}, ${parts.find(p => p.type === 'year').value}`;

    return { time12, time24, date: dateFormatted };
  };

  // Get timezone offset
  const getTimezoneOffset = (timeZone, date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      timeZoneName: 'longOffset'
    });
    const parts = formatter.formatToParts(date);
    const offsetString = parts.find(p => p.type === 'timeZoneName').value;
    
    // Parse offset string like "GMT-5" or "GMT+1"
    const match = offsetString.match(/GMT([+-])(\d+)/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const hours = parseInt(match[2]);
      return sign * hours * 60 * 60 * 1000;
    }
    return 0;
  };

  // Check if it's the same day in both timezones
  const isSameDay = (date, fromTZ, toTZ) => {
    const fromDate = new Date(date.toLocaleString('en-US', { timeZone: fromTZ }));
    const toDate = new Date(date.toLocaleString('en-US', { timeZone: toTZ }));
    return fromDate.toDateString() === toDate.toDateString();
  };

  // Calculate sunrise and sunset times (mock implementation)
  const calculateSunTimes = (date, timeZone) => {
    // This is a simplified mock - in a real app, you'd use a proper sunrise/sunset API
    const baseDate = new Date(date);
    const hour = baseDate.getHours();
    
    // Mock sunrise between 5-7 AM, sunset between 6-8 PM based on timezone
    const tzIndex = timeZones.findIndex(tz => tz.id === timeZone);
    const sunriseHour = 6 + (tzIndex % 3); // 6-8 AM
    const sunsetHour = 18 + (tzIndex % 3); // 6-8 PM
    
    return {
      sunrise: `${sunriseHour}:00 AM`,
      sunset: `${sunsetHour - 12}:00 PM`,
      isDaytime: hour >= sunriseHour && hour < sunsetHour
    };
  };

  const copyToClipboard = async () => {
    if (convertedTime) {
      const text = `${convertedTime.fromTime.time12} ${convertedTime.fromTimezone.name} = ${convertedTime.toTime.time12} ${convertedTime.toTimezone.name}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    setCalculationHistory([]);
  };

  const resetConverter = () => {
    setFromTimeZone('America/New_York');
    setToTimeZone('Europe/London');
    setDateTime(new Date().toISOString().slice(0, 16));
    setConvertedTime(null);
  };

  const swapTimeZones = () => {
    setFromTimeZone(toTimeZone);
    setToTimeZone(fromTimeZone);
  };

  const setQuickConversion = (conversion) => {
    setFromTimeZone(conversion.from);
    setToTimeZone(conversion.to);
  };

  const addToFavorites = (conversion) => {
    const fav = { ...conversion, id: Date.now() };
    setFavorites(prev => [fav, ...prev.filter(f => 
      !(f.from === conversion.from && f.to === conversion.to)
    ).slice(0, 4)]);
  };

  const removeFromFavorites = (favId) => {
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  // Auto-convert when inputs change
  useEffect(() => {
    convertTimeZone();
  }, [fromTimeZone, toTimeZone, dateTime]);

  // Filter time zones based on search
  const filteredTimeZones = timeZones.filter(tz =>
    tz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current time in a timezone
  const getCurrentTime = (timeZoneId) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timeZoneId,
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Globe className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Time Zone Converter</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Converter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Converter Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Date and Time Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date & Time to Convert
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-4 py-4 text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <div className="text-sm text-gray-600 mt-2">
                  Current local time: {new Date().toLocaleString()}
                </div>
              </div>

              {/* From Time Zone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From Time Zone
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search time zones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg mb-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={fromTimeZone}
                  onChange={(e) => setFromTimeZone(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none font-semibold h-48"
                  size={4}
                >
                  {filteredTimeZones.map(tz => (
                    <option key={tz.id} value={tz.id}>
                      {tz.emoji} {tz.name} ({tz.country}) - {tz.offset} - Current: {getCurrentTime(tz.id)}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Time Zone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To Time Zone
                </label>
                <select
                  value={toTimeZone}
                  onChange={(e) => setToTimeZone(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none font-semibold h-48"
                  size={4}
                >
                  {timeZones.map(tz => (
                    <option key={tz.id} value={tz.id}>
                      {tz.emoji} {tz.name} ({tz.country}) - {tz.offset} - Current: {getCurrentTime(tz.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={swapTimeZones}
                className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition transform hover:rotate-180 duration-300"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={convertTimeZone}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Zap size={24} />
                Convert Time
              </button>
              <button
                onClick={resetConverter}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {convertedTime && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {convertedTime.fromTime.time12}
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    {convertedTime.fromTimezone.emoji} {convertedTime.fromTimezone.name} → {convertedTime.toTimezone.emoji} {convertedTime.toTimezone.name}
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {convertedTime.toTime.time12}
                  </div>
                  <div className="text-lg text-gray-600">
                    {convertedTime.toTime.date}
                  </div>
                  
                  {/* Time Difference */}
                  <div className={`mt-4 p-3 rounded-lg ${
                    convertedTime.hourDifference === 0 ? 'bg-gray-100' : 
                    convertedTime.isAhead ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    <div className={`font-semibold ${
                      convertedTime.hourDifference === 0 ? 'text-gray-800' : 
                      convertedTime.isAhead ? 'text-blue-800' : 'text-orange-800'
                    }`}>
                      {convertedTime.hourDifference === 0 ? 'Same time' : 
                       `${Math.abs(convertedTime.hourDifference)} hours ${convertedTime.isAhead ? 'ahead' : 'behind'}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {convertedTime.sameDay ? 'Same day' : 'Different day'}
                    </div>
                  </div>

                  <button
                    onClick={copyToClipboard}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 mx-auto"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Result'}
                  </button>
                </div>
              </div>

              {/* Additional Time Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Time Zone Info */}
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    {convertedTime.fromTimezone.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">24-hour time:</span>
                      <span className="font-semibold">{convertedTime.fromTime.time24}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Date:</span>
                      <span className="font-semibold">{convertedTime.fromTime.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Offset:</span>
                      <span className="font-semibold">{convertedTime.fromTimezone.offset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 flex items-center gap-1">
                        <Sunrise size={16} />
                        Sunrise:
                      </span>
                      <span className="font-semibold">{convertedTime.fromSunInfo.sunrise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 flex items-center gap-1">
                        <Sunset size={16} />
                        Sunset:
                      </span>
                      <span className="font-semibold">{convertedTime.fromSunInfo.sunset}</span>
                    </div>
                    <div className={`p-2 rounded text-center ${
                      convertedTime.fromSunInfo.isDaytime ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {convertedTime.fromSunInfo.isDaytime ? '☀️ Daytime' : '🌙 Nighttime'}
                    </div>
                  </div>
                </div>

                {/* To Time Zone Info */}
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="text-purple-600" />
                    {convertedTime.toTimezone.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">24-hour time:</span>
                      <span className="font-semibold">{convertedTime.toTime.time24}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Date:</span>
                      <span className="font-semibold">{convertedTime.toTime.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Offset:</span>
                      <span className="font-semibold">{convertedTime.toTimezone.offset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 flex items-center gap-1">
                        <Sunrise size={16} />
                        Sunrise:
                      </span>
                      <span className="font-semibold">{convertedTime.toSunInfo.sunrise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 flex items-center gap-1">
                        <Sunset size={16} />
                        Sunset:
                      </span>
                      <span className="font-semibold">{convertedTime.toSunInfo.sunset}</span>
                    </div>
                    <div className={`p-2 rounded text-center ${
                      convertedTime.toSunInfo.isDaytime ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {convertedTime.toSunInfo.isDaytime ? '☀️ Daytime' : '🌙 Nighttime'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common Conversions */}
          <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-yellow-600" />
              Common Conversions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonConversions.map((conversion, index) => (
                <button
                  key={index}
                  onClick={() => setQuickConversion(conversion)}
                  className="p-3 bg-white hover:bg-yellow-100 border border-yellow-200 rounded-lg transition text-left group"
                >
                  <div className="font-semibold text-gray-800">{conversion.label}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {timeZones.find(tz => tz.id === conversion.from)?.emoji} → {timeZones.find(tz => tz.id === conversion.to)?.emoji}
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
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Favorites */}
          <div className="bg-red-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-red-600" />
              Favorite Conversions
            </h3>
            <div className="space-y-3">
              {favorites.length > 0 ? (
                favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg group"
                  >
                    <button
                      onClick={() => setQuickConversion(fav)}
                      className="flex-1 text-left"
                    >
                      <div className="font-semibold text-gray-800">{fav.label}</div>
                      <div className="text-sm text-gray-600">
                        {timeZones.find(tz => tz.id === fav.from)?.name} → {timeZones.find(tz => tz.id === fav.to)?.name}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromFavorites(fav.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star size={16} className="text-red-500 fill-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No favorites yet. Click the star on common conversions to add them here.
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
                  Recent Conversions
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
                      <div className="font-semibold text-gray-800 text-sm">
                        {item.fromTime} → {item.toTime}
                      </div>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {timeZones.find(tz => tz.id === item.from)?.name} to {timeZones.find(tz => tz.id === item.to)?.name}
                    </div>
                    <div className={`text-xs ${
                      item.hourDifference === 0 ? 'text-gray-600' : 
                      item.hourDifference > 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {item.hourDifference === 0 ? 'Same time' : 
                       `${Math.abs(item.hourDifference)}h ${item.hourDifference > 0 ? 'ahead' : 'behind'}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Zone Tips */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Time Zone Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Business Hours</div>
                <div className="text-gray-600">Consider time zones for international calls</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Daylight Saving</div>
                <div className="text-gray-600">Some regions observe DST changes</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Meeting Planning</div>
                <div className="text-gray-600">Find overlapping business hours</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Travel Planning</div>
                <div className="text-gray-600">Account for jet lag and time differences</div>
              </div>
            </div>
          </div>

          {/* World Clocks */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">World Clocks</h3>
            <div className="space-y-3">
              {timeZones.slice(0, 4).map(tz => (
                <div key={tz.id} className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tz.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{tz.name}</div>
                      <div className="text-xs text-gray-600">{tz.offset}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {getCurrentTime(tz.id)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Globe className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">16+ Time Zones</div>
          <div className="text-sm text-gray-600">Global coverage</div>
        </div>
        <div className="text-center p-4">
          <Clock className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Real-time</div>
          <div className="text-sm text-gray-600">Live conversions</div>
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
        <h4 className="font-bold text-blue-900 mb-2">💡 Time Zone Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Consider daylight saving time changes when scheduling future meetings</li>
          <li>• Use the sunrise/sunset information to avoid calling during nighttime hours</li>
          <li>• The time difference display helps quickly understand the relationship between timezones</li>
          <li>• Save frequently used timezone pairs as favorites for quick access</li>
          <li>• Use the world clocks section to monitor multiple timezones simultaneously</li>
        </ul>
      </div>
    </div>
  );
};

export default TimeZoneConverter;