import { useState, useRef } from 'react';
import { Copy, Check, Type, ArrowLeftRight, RotateCcw, Zap, Sparkles, FileText, Hash, ArrowUpDown } from 'lucide-react';

const TextCaseConverter = () => {
  const [inputText, setInputText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [activeCase, setActiveCase] = useState('sentence');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const textAreaRef = useRef(null);

  // Case conversion functions
  const caseConverters = {
    sentence: (text) => {
      return text.replace(/(^\w|\.\s+\w)/g, match => match.toUpperCase());
    },
    lower: (text) => text.toLowerCase(),
    upper: (text) => text.toUpperCase(),
    title: (text) => {
      return text.replace(/\w\S*/g, (word) => {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
      });
    },
    camel: (text) => {
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    },
    pascal: (text) => {
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      }).replace(/\s+/g, '');
    },
    snake: (text) => {
      return text.toLowerCase().replace(/\s+/g, '_');
    },
    kebab: (text) => {
      return text.toLowerCase().replace(/\s+/g, '-');
    },
    constant: (text) => {
      return text.toUpperCase().replace(/\s+/g, '_');
    },
    capital: (text) => {
      return text.toUpperCase();
    },
    alternating: (text) => {
      return text.split('').map((char, index) => {
        return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
      }).join('');
    },
    inverse: (text) => {
      return text.split('').map(char => {
        if (char === char.toUpperCase()) {
          return char.toLowerCase();
        } else {
          return char.toUpperCase();
        }
      }).join('');
    },
    dot: (text) => {
      return text.toLowerCase().replace(/\s+/g, '.');
    },
    slug: (text) => {
      return text.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }
  };

  // Case descriptions and examples
  const caseTypes = [
    {
      id: 'sentence',
      name: 'Sentence Case',
      description: 'Capitalizes the first letter of each sentence',
      example: 'This is a sentence. And this is another one.',
      icon: '📝'
    },
    {
      id: 'lower',
      name: 'Lower Case',
      description: 'Converts all text to lowercase',
      example: 'this is all in lowercase',
      icon: '🔤'
    },
    {
      id: 'upper',
      name: 'Upper Case',
      description: 'CONVERTS ALL TEXT TO UPPERCASE',
      example: 'THIS IS ALL IN UPPERCASE',
      icon: '🔼'
    },
    {
      id: 'title',
      name: 'Title Case',
      description: 'Capitalizes the First Letter of Each Word',
      example: 'This Is Title Case Format',
      icon: '🏷️'
    },
    {
      id: 'camel',
      name: 'Camel Case',
      description: 'joinsWordsWithoutSpacesAndCapitalizes',
      example: 'camelCaseExample',
      icon: '🐫'
    },
    {
      id: 'pascal',
      name: 'Pascal Case',
      description: 'CapitalizesEveryWordIncludingTheFirst',
      example: 'PascalCaseExample',
      icon: '🔷'
    },
    {
      id: 'snake',
      name: 'Snake Case',
      description: 'separates_words_with_underscores',
      example: 'snake_case_example',
      icon: '🐍'
    },
    {
      id: 'kebab',
      name: 'Kebab Case',
      description: 'separates-words-with-hyphens',
      example: 'kebab-case-example',
      icon: '🍢'
    },
    {
      id: 'constant',
      name: 'Constant Case',
      description: 'CONSTANT_CASE_WITH_UNDERSCORES',
      example: 'CONSTANT_CASE_EXAMPLE',
      icon: '🔣'
    },
    {
      id: 'capital',
      name: 'All Caps',
      description: 'EVERY LETTER IS CAPITALIZED',
      example: 'ALL CAPS TEXT',
      icon: '💪'
    },
    {
      id: 'alternating',
      name: 'Alternating Case',
      description: 'AlTeRnAtEs BeTwEeN uPpEr AnD lOwEr CaSe',
      example: 'aLtErNaTiNg cAsE eXaMpLe',
      icon: '🔄'
    },
    {
      id: 'inverse',
      name: 'Inverse Case',
      description: 'sWAPS THE CASE OF EACH CHARACTER',
      example: 'iNVERSE cASE eXAMPLE',
      icon: '🔄'
    },
    {
      id: 'dot',
      name: 'Dot Case',
      description: 'separates.words.with.dots',
      example: 'dot.case.example',
      icon: '⏺️'
    },
    {
      id: 'slug',
      name: 'Slug Case',
      description: 'creates-url-friendly-slugs',
      example: 'slug-case-example',
      icon: '🔗'
    }
  ];

  const convertText = (caseType) => {
    if (!inputText.trim()) return;

    const converter = caseConverters[caseType];
    if (converter) {
      const result = converter(inputText);
      setConvertedText(result);
      setActiveCase(caseType);

      // Update history
      setHistory(prev => [{
        id: Date.now(),
        from: inputText.substring(0, 30) + (inputText.length > 30 ? '...' : ''),
        to: result.substring(0, 30) + (result.length > 30 ? '...' : ''),
        case: caseType,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);

      // Calculate stats
      calculateStats(inputText, result);
    }
  };

  const calculateStats = (original, converted) => {
    const wordsOriginal = original.trim() ? original.trim().split(/\s+/).length : 0;
    const wordsConverted = converted.trim() ? converted.trim().split(/\s+/).length : 0;
    const charsOriginal = original.length;
    const charsConverted = converted.length;
    const linesOriginal = original.split('\n').length;
    const linesConverted = converted.split('\n').length;

    setStats({
      words: { original: wordsOriginal, converted: wordsConverted },
      characters: { original: charsOriginal, converted: charsConverted },
      lines: { original: linesOriginal, converted: linesConverted }
    });
  };

  const copyToClipboard = async (text = convertedText) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInputText('');
    setConvertedText('');
    setStats(null);
    setActiveCase('sentence');
  };

  const swapText = () => {
    setInputText(convertedText);
    setConvertedText(inputText);
  };

  const quickConvert = (caseType) => {
    convertText(caseType);
  };

  // Sample texts for quick testing
  const sampleTexts = [
    {
      name: "Simple Sentence",
      text: "hello world this is a test sentence for case conversion"
    },
    {
      name: "Multiple Sentences",
      text: "this is the first sentence. this is the second one! and this is the third?"
    },
    {
      name: "Programming Variable",
      text: "user account information manager"
    },
    {
      name: "URL Slug",
      text: "My Awesome Blog Post Title 2024"
    },
    {
      name: "Code Constant",
      text: "maximum retry attempts count"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Type className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Text Case Converter</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Area */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Input Text</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(inputText)}
                  disabled={!inputText}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  Copy Input
                </button>
                <button
                  onClick={clearAll}
                  disabled={!inputText && !convertedText}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <textarea
              ref={textAreaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here to convert between different case styles..."
              className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-sans text-lg leading-relaxed"
            />

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={swapText}
                disabled={!convertedText}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition flex items-center gap-2"
              >
                <ArrowLeftRight size={16} />
                Swap Text
              </button>
              <button
                onClick={() => setInputText('')}
                disabled={!inputText}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg transition flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Clear Input
              </button>
            </div>
          </div>

          {/* Output Area */}
          {convertedText && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Zap className="text-yellow-600" />
                  Converted Text
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({caseTypes.find(c => c.id === activeCase)?.name})
                  </span>
                </h3>
                <button
                  onClick={() => copyToClipboard()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Output'}
                </button>
              </div>
              
              <div className="bg-white p-4 border-2 border-green-300 rounded-lg min-h-32 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-gray-800">
                  {convertedText}
                </pre>
              </div>

              {/* Quick Convert Buttons */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Quick Convert To:</h4>
                <div className="flex gap-2 flex-wrap">
                  {['upper', 'lower', 'title', 'sentence'].map(caseType => (
                    <button
                      key={caseType}
                      onClick={() => quickConvert(caseType)}
                      className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition text-sm font-semibold"
                    >
                      {caseTypes.find(c => c.id === caseType)?.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <FileText className="mx-auto text-blue-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.words.converted}</div>
                <div className="text-sm text-gray-600">Words</div>
                <div className="text-xs text-gray-500">Was: {stats.words.original}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Type className="mx-auto text-green-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.characters.converted}</div>
                <div className="text-sm text-gray-600">Characters</div>
                <div className="text-xs text-gray-500">Was: {stats.characters.original}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Hash className="mx-auto text-purple-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.lines.converted}</div>
                <div className="text-sm text-gray-600">Lines</div>
                <div className="text-xs text-gray-500">Was: {stats.lines.original}</div>
              </div>
            </div>
          )}

          {/* Sample Texts */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Try Sample Texts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleTexts.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(sample.text)}
                  className="p-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition text-left"
                >
                  <div className="font-semibold text-gray-800">{sample.name}</div>
                  <div className="text-sm text-gray-600 mt-1 truncate">{sample.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Case Types */}
        <div className="space-y-6">
          {/* Case Types Grid */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-600" />
              Conversion Types
            </h3>
            <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto">
              {caseTypes.map((caseType) => (
                <button
                  key={caseType.id}
                  onClick={() => convertText(caseType.id)}
                  disabled={!inputText.trim()}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    activeCase === caseType.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{caseType.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{caseType.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{caseType.description}</div>
                      <div className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded">
                        {caseType.example}
                      </div>
                    </div>
                    <ArrowUpDown 
                      size={16} 
                      className={`flex-shrink-0 ${
                        activeCase === caseType.id ? 'text-blue-600' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversion History */}
          {history.length > 0 && (
            <div className="bg-orange-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Conversions</h3>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-gray-700 capitalize">
                        {item.case} Case
                      </span>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">→</span>
                        <span className="truncate">{item.from}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">⇒</span>
                        <span className="truncate">{item.to}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Use Cases */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Common Use Cases</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800">Programming</div>
                <div className="text-gray-600 mt-1">
                  Use camelCase for variables, PascalCase for classes, CONSTANT_CASE for constants
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800">URLs & Files</div>
                <div className="text-gray-600 mt-1">
                  Use kebab-case for URLs and file names, snake_case for database fields
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800">Writing</div>
                <div className="text-gray-600 mt-1">
                  Use Sentence case for normal text, Title Case for headings
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Case Conversion Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use Sentence Case for normal paragraphs and articles</li>
          <li>• Camel Case and Pascal Case are ideal for programming variables and classes</li>
          <li>• Snake Case and Kebab Case work well for URLs, file names, and database fields</li>
          <li>• Constant Case is perfect for configuration values and constants</li>
          <li>• Use the swap feature to quickly toggle between original and converted text</li>
        </ul>
      </div>
    </div>
  );
};

export default TextCaseConverter;