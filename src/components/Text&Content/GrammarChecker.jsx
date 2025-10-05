import { useState, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Copy, Check, Zap, BookOpen, TrendingUp, Clock, FileText } from 'lucide-react';

const GrammarChecker = () => {
  const [text, setText] = useState('');
  const [issues, setIssues] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const textAreaRef = useRef(null);

  // Mock grammar checking function (in real app, this would call an API)
  const checkGrammar = async (text) => {
    setIsChecking(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock grammar issues detection
    const mockIssues = [];
    const words = text.split(' ');
    let position = 0;

    words.forEach((word, index) => {
      // Mock some common grammar issues
      if (word.toLowerCase() === 'their' && Math.random() > 0.7) {
        mockIssues.push({
          id: index,
          type: 'spelling',
          severity: 'medium',
          message: 'Consider using "there" or "they\'re" depending on context',
          suggestion: 'there',
          position: position,
          length: word.length,
          context: words.slice(Math.max(0, index - 2), Math.min(words.length, index + 3)).join(' ')
        });
      }
      
      if (word.toLowerCase() === 'alot' && Math.random() > 0.6) {
        mockIssues.push({
          id: index + 100,
          type: 'spelling',
          severity: 'high',
          message: '"alot" should be written as two words: "a lot"',
          suggestion: 'a lot',
          position: position,
          length: word.length,
          context: words.slice(Math.max(0, index - 2), Math.min(words.length, index + 3)).join(' ')
        });
      }

      if (word.toLowerCase() === 'effect' && text.includes('affect') && Math.random() > 0.8) {
        mockIssues.push({
          id: index + 200,
          type: 'word_choice',
          severity: 'medium',
          message: 'Consider "affect" (verb) vs "effect" (noun)',
          suggestion: 'affect',
          position: position,
          length: word.length,
          context: words.slice(Math.max(0, index - 2), Math.min(words.length, index + 3)).join(' ')
        });
      }

      if (word.includes(',,') || word.includes('..')) {
        mockIssues.push({
          id: index + 300,
          type: 'punctuation',
          severity: 'low',
          message: 'Double punctuation detected',
          suggestion: word.replace(',,', ',').replace('..', '.'),
          position: position,
          length: word.length,
          context: words.slice(Math.max(0, index - 2), Math.min(words.length, index + 3)).join(' ')
        });
      }

      position += word.length + 1; // +1 for space
    });

    // Check for common issues in the entire text
    if (text.includes(' i ') && Math.random() > 0.5) {
      mockIssues.push({
        id: 999,
        type: 'capitalization',
        severity: 'medium',
        message: 'The pronoun "I" should always be capitalized',
        suggestion: 'I',
        position: text.indexOf(' i '),
        length: 1,
        context: '...' + text.substring(Math.max(0, text.indexOf(' i ') - 20), Math.min(text.length, text.indexOf(' i ') + 20)) + '...'
      });
    }

    if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?') && text.length > 10) {
      mockIssues.push({
        id: 1000,
        type: 'punctuation',
        severity: 'low',
        message: 'Consider adding ending punctuation',
        suggestion: '.',
        position: text.length,
        length: 0,
        context: 'End of text'
      });
    }

    setIssues(mockIssues);
    
    // Calculate stats
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;
    const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    setStats({
      wordCount,
      charCount,
      sentenceCount,
      readingTime,
      issueCount: mockIssues.length,
      accuracy: Math.max(70, 100 - (mockIssues.length * 2))
    });

    setIsChecking(false);
  };

  const applySuggestion = (issueId, suggestion) => {
    const issue = issues.find(issue => issue.id === issueId);
    if (!issue) return;

    const newText = text.substring(0, issue.position) + suggestion + text.substring(issue.position + issue.length);
    setText(newText);
    
    // Remove the fixed issue
    setIssues(issues.filter(issue => issue.id !== issueId));
  };

  const copyToClipboard = async () => {
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearText = () => {
    setText('');
    setIssues([]);
    setStats(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'yellow';
      default: return 'gray';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle className="text-red-500" size={20} />;
      case 'medium': return <AlertCircle className="text-orange-500" size={20} />;
      case 'low': return <AlertCircle className="text-yellow-500" size={20} />;
      default: return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getIssueTypeColor = (type) => {
    switch (type) {
      case 'spelling': return 'bg-red-100 text-red-800';
      case 'grammar': return 'bg-blue-100 text-blue-800';
      case 'punctuation': return 'bg-purple-100 text-purple-800';
      case 'word_choice': return 'bg-green-100 text-green-800';
      case 'capitalization': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Writing suggestions
  const writingSuggestions = [
    {
      title: "Use Active Voice",
      description: "Active voice makes your writing more direct and lively.",
      example: "Change 'The ball was thrown by John' to 'John threw the ball'"
    },
    {
      title: "Avoid Redundancy",
      description: "Remove unnecessary words that don't add meaning.",
      example: "Change 'advance planning' to 'planning'"
    },
    {
      title: "Vary Sentence Length",
      description: "Mix short and long sentences to create rhythm.",
      example: "Short for impact. Longer for explanation."
    },
    {
      title: "Use Strong Verbs",
      description: "Replace weak verb phrases with stronger single verbs.",
      example: "Change 'make a decision' to 'decide'"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <CheckCircle className="text-green-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Advanced Grammar Checker</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Text Input and Issues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Input Area */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Check Your Text</h3>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!text}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={clearText}
                  disabled={!text}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                ref={textAreaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your text here to check for grammar, spelling, and punctuation errors..."
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-sans text-lg leading-relaxed"
              />
              
              {isChecking && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="font-semibold">Checking grammar...</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => checkGrammar(text)}
              disabled={!text.trim() || isChecking}
              className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <Zap size={24} />
              Check Grammar & Spelling
            </button>
          </div>

          {/* Issues List */}
          {issues.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="text-orange-500" />
                  Found {issues.length} Issue{issues.length !== 1 ? 's' : ''}
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getIssueTypeColor(issue.type)}`}>
                            {issue.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`text-sm font-medium text-${getSeverityColor(issue.type)}-600`}>
                            {issue.severity.toUpperCase()} SEVERITY
                          </span>
                        </div>
                        <p className="text-gray-800 mb-2">{issue.message}</p>
                        <div className="bg-gray-100 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-600 font-mono">{issue.context}</p>
                        </div>
                        {issue.suggestion && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => applySuggestion(issue.id, issue.suggestion)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition"
                            >
                              Apply: "{issue.suggestion}"
                            </button>
                            <button
                              onClick={() => setIssues(issues.filter(i => i.id !== issue.id))}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition"
                            >
                              Ignore
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <FileText className="mx-auto text-blue-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.wordCount}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <AlertCircle className="mx-auto text-purple-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.issueCount}</div>
                <div className="text-sm text-gray-600">Issues</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <Clock className="mx-auto text-orange-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.readingTime}m</div>
                <div className="text-sm text-gray-600">Read Time</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Suggestions and Tools */}
        <div className="space-y-6">
          {/* Writing Suggestions */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="text-green-600" />
              Writing Tips
            </h3>
            <div className="space-y-4">
              {writingSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-700">
                    {suggestion.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setText(prev => prev.toUpperCase())}
                disabled={!text}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition font-semibold"
              >
                UPPERCASE
              </button>
              <button
                onClick={() => setText(prev => prev.toLowerCase())}
                disabled={!text}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition font-semibold"
              >
                lowercase
              </button>
              <button
                onClick={() => setText(prev => prev.charAt(0).toUpperCase() + prev.slice(1).toLowerCase())}
                disabled={!text}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition font-semibold"
              >
                Capitalize Sentence
              </button>
              <button
                onClick={() => setText(prev => prev.replace(/\s+/g, ' ').trim())}
                disabled={!text}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white rounded-lg transition font-semibold"
              >
                Remove Extra Spaces
              </button>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-red-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Common Mistakes</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-red-700 font-semibold">Your vs You're</span>
                <span className="text-gray-600">Possessive vs contraction</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-red-700 font-semibold">There/Their/They're</span>
                <span className="text-gray-600">Place/possession/contraction</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-red-700 font-semibold">Its vs It's</span>
                <span className="text-gray-600">Possessive vs contraction</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-red-700 font-semibold">Effect vs Affect</span>
                <span className="text-gray-600">Noun vs verb</span>
              </div>
            </div>
          </div>

          {/* Sample Texts */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Try Sample Text</h3>
            <div className="space-y-2">
              <button
                onClick={() => setText("Their going to the store to buy some groceries. I think their out of milk and eggs. Its important to remember you're shopping list.")}
                className="w-full px-4 py-2 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Common Errors</div>
                <div className="text-sm text-gray-600">Tests their/there/they're, its/it's</div>
              </button>
              <button
                onClick={() => setText("The quick brown fox jumps over the lazy dog. This sentence contains all the letters in the English alphabet. It's often used for typing practice and testing keyboards.")}
                className="w-full px-4 py-2 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Pangram</div>
                <div className="text-sm text-gray-600">Contains all alphabet letters</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Grammar Checking Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Review all suggestions before applying changes</li>
          <li>• Consider context when accepting word choice recommendations</li>
          <li>• Use the writing tips to improve your overall writing style</li>
          <li>• Check for consistent tense and point of view</li>
          <li>• Remember that grammar checkers may not catch all context-specific errors</li>
        </ul>
      </div>
    </div>
  );
};

export default GrammarChecker;