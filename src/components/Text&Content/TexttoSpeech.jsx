import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, Square, Download, FileText, Settings, RotateCw } from 'lucide-react';

const TextToSpeech = () => {
  const [text, setText] = useState('Hello! Welcome to Text to Speech. Type or paste your text here and click play to hear it spoken aloud.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  const speak = () => {
    if (!text.trim()) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
    };

    utterance.onboundary = (event) => {
      const percentage = (event.charIndex / text.length) * 100;
      setProgress(percentage);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const reset = () => {
    stop();
    setRate(1);
    setPitch(1);
    setVolume(1);
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  const estimatedTime = Math.ceil((wordCount / (rate * 150)) * 60);

  const voicesByLanguage = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {});

  const presetTexts = [
    { name: 'Welcome', text: 'Welcome to our text to speech converter. This tool allows you to convert any written text into natural sounding speech.' },
    { name: 'News', text: 'Breaking news: Technology continues to advance at a rapid pace, bringing new innovations and possibilities to our daily lives.' },
    { name: 'Quote', text: 'The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle.' },
    { name: 'Tutorial', text: 'To use this feature, simply type or paste your text, select your preferred voice, adjust the speed and pitch settings, then click play to hear your text spoken aloud.' }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Volume2 className="text-indigo-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Text to Speech Converter</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText size={24} />
                Your Text
              </h3>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{wordCount}</span> words • 
                <span className="font-semibold ml-1">{charCount}</span> chars
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 p-4 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              placeholder="Enter your text here..."
            />

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Estimated time: {estimatedTime}s</span>
              <button
                onClick={() => setText('')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Samples</h3>
            <div className="grid grid-cols-2 gap-2">
              {presetTexts.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setText(preset.text)}
                  className="p-3 bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-lg font-semibold text-sm transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Playback Controls</h3>
            
            {progress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center">{Math.round(progress)}% complete</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {!isPlaying && !isPaused ? (
                <button
                  onClick={speak}
                  disabled={!text.trim()}
                  className="col-span-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Play size={24} />
                  Play
                </button>
              ) : (
                <>
                  {isPlaying && (
                    <button
                      onClick={pause}
                      className="px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Pause size={24} />
                      Pause
                    </button>
                  )}
                  {isPaused && (
                    <button
                      onClick={speak}
                      className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Play size={24} />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={stop}
                    className={`${isPlaying || isPaused ? 'col-span-2' : 'col-span-3'} px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg flex items-center justify-center gap-2`}
                  >
                    <Square size={24} />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={24} />
              Voice Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Voice
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice);
                  }}
                  className="w-full p-3 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                >
                  {Object.entries(voicesByLanguage).map(([lang, langVoices]) => (
                    <optgroup key={lang} label={`${lang.toUpperCase()} Voices`}>
                      {langVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} {voice.lang}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedVoice && (
                  <p className="text-xs text-gray-600 mt-1">
                    Language: {selectedVoice.lang} • {selectedVoice.localService ? 'Local' : 'Online'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Audio Settings</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Speed
                  </label>
                  <span className="text-sm font-bold text-indigo-600">{rate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Pitch
                  </label>
                  <span className="text-sm font-bold text-purple-600">{pitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Lower</span>
                  <span>Higher</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Volume
                  </label>
                  <span className="text-sm font-bold text-pink-600">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Quiet</span>
                  <span>Loud</span>
                </div>
              </div>

              <button
                onClick={reset}
                className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                <RotateCw size={20} />
                Reset to Defaults
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Speed Presets</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRate(0.75)}
                className={`p-3 rounded-lg font-semibold transition ${
                  rate === 0.75
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                Slow
              </button>
              <button
                onClick={() => setRate(1)}
                className={`p-3 rounded-lg font-semibold transition ${
                  rate === 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setRate(1.5)}
                className={`p-3 rounded-lg font-semibold transition ${
                  rate === 1.5
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                Fast
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg">
            <h4 className="font-bold text-indigo-900 mb-2">💡 Pro Tips:</h4>
            <ul className="space-y-1 text-sm text-indigo-800">
              <li>• Use punctuation for natural pauses and intonation</li>
              <li>• Adjust speed for different content types (faster for casual, slower for technical)</li>
              <li>• Test different voices to find the best fit for your content</li>
              <li>• Break long texts into paragraphs for better pacing</li>
              <li>• Use normal pitch (1.0) for most natural sound</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-bold text-purple-900 mb-2">🎯 Use Cases:</h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Accessibility for visually impaired users</li>
              <li>• Proofreading by listening to your writing</li>
              <li>• Learning pronunciation of text</li>
              <li>• Multitasking while consuming content</li>
              <li>• Creating audio versions of written content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;


