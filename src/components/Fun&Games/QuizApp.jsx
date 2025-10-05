import { useState, useEffect, useRef } from 'react';
import { HelpCircle, Trophy, RotateCcw, Plus, Trash2, Settings, Save, Download, Upload, Book, Clock, Star, Zap, Award, CheckCircle, XCircle, Timer } from 'lucide-react';

const QuizApp = () => {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'General Knowledge',
      description: 'Test your general knowledge with this quiz',
      category: 'General',
      difficulty: 'medium',
      questions: [
        {
          id: 1,
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          explanation: 'Paris is the capital and most populous city of France.'
        },
        {
          id: 2,
          question: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1,
          explanation: 'Mars is often called the Red Planet due to its reddish appearance.'
        }
      ]
    }
  ]);

  const [settings, setSettings] = useState({
    theme: 'blue',
    animations: true,
    sound: true,
    timer: true,
    showResults: true,
    questionsPerQuiz: 5,
    timePerQuestion: 30
  });

  const [state, setState] = useState({
    activeQuiz: 0,
    currentQuestion: 0,
    userAnswers: [],
    score: 0,
    quizStatus: 'idle', // 'idle', 'playing', 'finished'
    timeRemaining: 0,
    showExplanation: false,
    selectedAnswer: null
  });

  const [presets, setPresets] = useState([
    {
      id: 1,
      title: 'Science Basics',
      category: 'Science',
      difficulty: 'easy',
      questions: [
        {
          id: 1,
          question: 'What is H2O?',
          options: ['Salt', 'Water', 'Oxygen', 'Hydrogen'],
          correctAnswer: 1,
          explanation: 'H2O is the chemical formula for water.'
        },
        {
          id: 2,
          question: 'How many planets are in our solar system?',
          options: ['7', '8', '9', '10'],
          correctAnswer: 1,
          explanation: 'There are 8 planets in our solar system.'
        }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('quizzes');
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'medium'
  });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });
  const timerRef = useRef(null);

  const categories = ['General', 'Science', 'History', 'Geography', 'Math', 'Technology', 'Sports', 'Entertainment'];
  const difficulties = [
    { id: 'easy', name: 'Easy', color: 'green' },
    { id: 'medium', name: 'Medium', color: 'yellow' },
    { id: 'hard', name: 'Hard', color: 'red' }
  ];

  // Initialize from localStorage
  useEffect(() => {
    const savedQuizzes = localStorage.getItem('quizAppQuizzes');
    const savedSettings = localStorage.getItem('quizAppSettings');
    const savedPresets = localStorage.getItem('quizAppPresets');
    
    if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPresets) setPresets(JSON.parse(savedPresets));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('quizAppQuizzes', JSON.stringify(quizzes));
    localStorage.setItem('quizAppSettings', JSON.stringify(settings));
    localStorage.setItem('quizAppPresets', JSON.stringify(presets));
  }, [quizzes, settings, presets]);

  // Timer effect
  useEffect(() => {
    if (state.quizStatus === 'playing' && settings.timer && state.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            handleTimeUp();
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.quizStatus, state.timeRemaining, settings.timer]);

  // Add new quiz
  const addQuiz = () => {
    if (!newQuiz.title.trim()) return;
    
    const quiz = {
      id: Date.now(),
      title: newQuiz.title,
      description: newQuiz.description,
      category: newQuiz.category,
      difficulty: newQuiz.difficulty,
      questions: []
    };
    
    setQuizzes(prev => [...prev, quiz]);
    setNewQuiz({
      title: '',
      description: '',
      category: 'General',
      difficulty: 'medium'
    });
    setActiveTab('quizzes');
  };

  // Remove quiz
  const removeQuiz = (id) => {
    setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
  };

  // Add question to quiz
  const addQuestion = (quizId) => {
    if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) return;
    
    const question = {
      id: Date.now(),
      question: newQuestion.question,
      options: [...newQuestion.options],
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation
    };
    
    setQuizzes(prev => prev.map(quiz =>
      quiz.id === quizId
        ? { ...quiz, questions: [...quiz.questions, question] }
        : quiz
    ));
    
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  // Remove question
  const removeQuestion = (quizId, questionId) => {
    setQuizzes(prev => prev.map(quiz =>
      quiz.id === quizId
        ? { ...quiz, questions: quiz.questions.filter(q => q.id !== questionId) }
        : quiz
    ));
  };

  // Start quiz
  const startQuiz = (quizIndex) => {
    const quiz = quizzes[quizIndex];
    if (!quiz || quiz.questions.length === 0) return;
    
    setState({
      activeQuiz: quizIndex,
      currentQuestion: 0,
      userAnswers: [],
      score: 0,
      quizStatus: 'playing',
      timeRemaining: settings.timePerQuestion,
      showExplanation: false,
      selectedAnswer: null
    });
    setActiveTab('play');
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (state.quizStatus !== 'playing' || state.showExplanation) return;
    
    const currentQuiz = quizzes[state.activeQuiz];
    const currentQ = currentQuiz.questions[state.currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    
    setState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      showExplanation: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      userAnswers: [...prev.userAnswers, {
        questionId: currentQ.id,
        selectedAnswer: answerIndex,
        isCorrect,
        timeUsed: settings.timePerQuestion - prev.timeRemaining
      }]
    }));

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    if (state.quizStatus !== 'playing' || state.showExplanation) return;
    
    const currentQuiz = quizzes[state.activeQuiz];
    const currentQ = currentQuiz.questions[state.currentQuestion];
    
    setState(prev => ({
      ...prev,
      selectedAnswer: null,
      showExplanation: true,
      userAnswers: [...prev.userAnswers, {
        questionId: currentQ.id,
        selectedAnswer: null,
        isCorrect: false,
        timeUsed: settings.timePerQuestion,
        timeUp: true
      }]
    }));

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    const currentQuiz = quizzes[state.activeQuiz];
    
    if (state.currentQuestion >= currentQuiz.questions.length - 1) {
      // End of quiz
      setState(prev => ({
        ...prev,
        quizStatus: 'finished',
        showExplanation: false
      }));
    } else {
      // Next question
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        showExplanation: false,
        selectedAnswer: null,
        timeRemaining: settings.timePerQuestion
      }));
    }
  };

  // Restart quiz
  const restartQuiz = () => {
    setState({
      activeQuiz: 0,
      currentQuestion: 0,
      userAnswers: [],
      score: 0,
      quizStatus: 'idle',
      timeRemaining: 0,
      showExplanation: false,
      selectedAnswer: null
    });
    setActiveTab('quizzes');
  };

  // Load preset
  const loadPreset = (preset) => {
    const newQuiz = {
      id: Date.now(),
      title: `${preset.title} (Copy)`,
      description: `Imported from preset: ${preset.title}`,
      category: preset.category,
      difficulty: preset.difficulty,
      questions: preset.questions.map(q => ({ ...q, id: Date.now() + Math.random() }))
    };
    
    setQuizzes(prev => [...prev, newQuiz]);
    setActiveTab('quizzes');
  };

  // Save current quiz as preset
  const saveAsPreset = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    const name = prompt('Enter preset name:', quiz.title);
    if (!name) return;
    
    const newPreset = {
      id: Date.now(),
      title: name,
      category: quiz.category,
      difficulty: quiz.difficulty,
      questions: quiz.questions.map(q => ({ ...q, id: Date.now() + Math.random() }))
    };
    
    setPresets(prev => [newPreset, ...prev]);
  };

  // Remove preset
  const removePreset = (id) => {
    setPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // Export data
  const exportData = () => {
    const data = {
      quizzes,
      settings,
      presets
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-app-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.quizzes) setQuizzes(data.quizzes);
        if (data.settings) setSettings(data.settings);
        if (data.presets) setPresets(data.presets);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
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

  // Calculate score and stats
  const getQuizStats = () => {
    const currentQuiz = quizzes[state.activeQuiz];
    if (!currentQuiz) return null;
    
    const totalQuestions = currentQuiz.questions.length;
    const correctAnswers = state.userAnswers.filter(ans => ans.isCorrect).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageTime = state.userAnswers.reduce((sum, ans) => sum + ans.timeUsed, 0) / totalQuestions;
    
    return {
      totalQuestions,
      correctAnswers,
      accuracy: Math.round(accuracy),
      averageTime: Math.round(averageTime)
    };
  };

  const theme = getThemeColors();
  const currentQuiz = quizzes[state.activeQuiz];
  const currentQuestion = currentQuiz?.questions[state.currentQuestion];
  const stats = getQuizStats();

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <HelpCircle className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Quiz App</h2>
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
                { id: 'quizzes', name: 'My Quizzes', icon: Book },
                { id: 'play', name: 'Play Quiz', icon: HelpCircle },
                { id: 'presets', name: 'Presets', icon: Save },
                { id: 'stats', name: 'Statistics', icon: Trophy },
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
                onClick={exportData}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Download size={16} />
                Export Data
              </button>
              <label className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              {state.quizStatus === 'playing' && (
                <button
                  onClick={restartQuiz}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  End Quiz
                </button>
              )}
            </div>
          </div>

          {/* Quiz Info */}
          {state.quizStatus === 'playing' && currentQuiz && (
            <div className="bg-white border-2 border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Quiz Info</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-bold text-gray-800">
                    {state.currentQuestion + 1} / {currentQuiz.questions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Score:</span>
                  <span className="font-bold text-green-600">{state.score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <span className={`font-bold ${
                    state.timeRemaining < 10 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {state.timeRemaining}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* My Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">My Quizzes</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="New quiz title..."
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && addQuiz()}
                  />
                  <button
                    onClick={addQuiz}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Quiz
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{quiz.title}</h4>
                        <p className="text-sm text-gray-600">{quiz.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startQuiz(index)}
                          disabled={quiz.questions.length === 0}
                          className="p-1 text-green-600 hover:text-green-800 transition disabled:opacity-50"
                          title="Start Quiz"
                        >
                          <HelpCircle size={16} />
                        </button>
                        <button
                          onClick={() => saveAsPreset(quiz.id)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition"
                          title="Save as Preset"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => removeQuiz(quiz.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition"
                          title="Delete Quiz"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 bg-${quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'medium' ? 'yellow' : 'red'}-100 text-${quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'medium' ? 'yellow' : 'red'}-800 rounded text-xs capitalize`}>
                        {quiz.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {quiz.category}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {quiz.questions.length} questions
                      </span>
                    </div>

                    {/* Add Question Form */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <h5 className="font-semibold text-gray-800 mb-2">Add New Question</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="Enter question..."
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                        />
                        {newQuestion.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${quiz.id}`}
                              checked={newQuestion.correctAnswer === optIndex}
                              onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: optIndex }))}
                              className="text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options];
                                newOptions[optIndex] = e.target.value;
                                setNewQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                            />
                          </div>
                        ))}
                        <input
                          type="text"
                          value={newQuestion.explanation}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                          placeholder="Explanation (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                        />
                        <button
                          onClick={() => addQuestion(quiz.id)}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {quiz.questions.map((question, qIndex) => (
                        <div key={question.id} className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {qIndex + 1}. {question.question}
                            </div>
                            <div className="text-xs text-gray-500">
                              Correct: {question.options[question.correctAnswer]}
                            </div>
                          </div>
                          <button
                            onClick={() => removeQuestion(quiz.id, question.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {quiz.questions.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-4">
                          No questions added yet
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {quizzes.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <Book size={48} className="mx-auto mb-4 opacity-50" />
                    <div>No quizzes created yet</div>
                    <div className="text-sm">Create your first quiz above</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Play Quiz Tab */}
          {activeTab === 'play' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {state.quizStatus === 'idle' && (
                <div className="text-center py-12">
                  <HelpCircle size={64} className="mx-auto mb-6 text-gray-400" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Select a Quiz to Start</h3>
                  <p className="text-gray-600 mb-8">Choose from your created quizzes or load a preset to begin</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {quizzes.map((quiz, index) => (
                      <button
                        key={quiz.id}
                        onClick={() => startQuiz(index)}
                        disabled={quiz.questions.length === 0}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <h4 className="font-semibold text-gray-800">{quiz.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 bg-${quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'medium' ? 'yellow' : 'red'}-100 text-${quiz.difficulty === 'easy' ? 'green' : quiz.difficulty === 'medium' ? 'yellow' : 'red'}-800 rounded text-xs`}>
                            {quiz.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {quiz.questions.length} questions
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {state.quizStatus === 'playing' && currentQuestion && (
                <div className="max-w-2xl mx-auto">
                  {/* Progress and Timer */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Question {state.currentQuestion + 1} of {currentQuiz.questions.length}
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-${theme.primary}-500 transition-all duration-300`}
                          style={{ width: `${((state.currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    {settings.timer && (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                        state.timeRemaining < 10 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        <Timer size={16} />
                        <span className="font-mono font-bold">{state.timeRemaining}s</span>
                      </div>
                    )}
                  </div>

                  {/* Question */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{currentQuestion.question}</h3>
                    
                    {/* Options */}
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        let optionStyle = 'bg-white border-2 border-gray-300 hover:border-gray-400';
                        let textStyle = 'text-gray-800';
                        
                        if (state.showExplanation) {
                          if (index === currentQuestion.correctAnswer) {
                            optionStyle = 'bg-green-100 border-2 border-green-500';
                            textStyle = 'text-green-800';
                          } else if (index === state.selectedAnswer && index !== currentQuestion.correctAnswer) {
                            optionStyle = 'bg-red-100 border-2 border-red-500';
                            textStyle = 'text-red-800';
                          }
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={state.showExplanation}
                            className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${optionStyle} ${textStyle} ${
                              !state.showExplanation ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
                            } disabled:opacity-100`}
                          >
                            <div className="flex items-center gap-3">
                              {state.showExplanation && (
                                <>
                                  {index === currentQuestion.correctAnswer && (
                                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                                  )}
                                  {index === state.selectedAnswer && index !== currentQuestion.correctAnswer && (
                                    <XCircle size={20} className="text-red-600 flex-shrink-0" />
                                  )}
                                </>
                              )}
                              <span className="font-medium">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {state.showExplanation && currentQuestion.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Explanation</h4>
                        <p className="text-blue-700">{currentQuestion.explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  {state.showExplanation && (
                    <div className="text-center">
                      <button
                        onClick={nextQuestion}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        {state.currentQuestion >= currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {state.quizStatus === 'finished' && stats && (
                <div className="max-w-2xl mx-auto text-center">
                  <Award size={64} className="mx-auto mb-6 text-yellow-500" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{stats.correctAnswers}</div>
                      <div className="text-sm text-blue-800">Correct</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                      <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
                      <div className="text-sm text-green-800">Accuracy</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</div>
                      <div className="text-sm text-purple-800">Total</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">{stats.averageTime}s</div>
                      <div className="text-sm text-orange-800">Avg Time</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Detailed Results</h4>
                    <div className="space-y-3 text-left">
                      {state.userAnswers.map((userAnswer, index) => {
                        const question = currentQuiz.questions[index];
                        return (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                Q{index + 1}: {question.question}
                              </div>
                              <div className="text-sm text-gray-600">
                                Your answer: {userAnswer.selectedAnswer !== null ? question.options[userAnswer.selectedAnswer] : 'Time Up'}
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              userAnswer.isCorrect 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {userAnswer.isCorrect ? 'Correct' : 'Incorrect'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={restartQuiz}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Back to Quizzes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Quiz Presets</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{preset.title}</h4>
                        <p className="text-sm text-gray-600">{preset.category}</p>
                      </div>
                      <button
                        onClick={() => removePreset(preset.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 bg-${preset.difficulty === 'easy' ? 'green' : preset.difficulty === 'medium' ? 'yellow' : 'red'}-100 text-${preset.difficulty === 'easy' ? 'green' : preset.difficulty === 'medium' ? 'yellow' : 'red'}-800 rounded text-xs`}>
                        {preset.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {preset.questions.length} questions
                      </span>
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
                    <div className="text-sm">Save your quizzes as presets for quick access</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Quiz Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{quizzes.length}</div>
                  <div className="text-lg font-semibold text-blue-800">Total Quizzes</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
                  </div>
                  <div className="text-lg font-semibold text-green-800">Total Questions</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{presets.length}</div>
                  <div className="text-lg font-semibold text-purple-800">Presets</div>
                </div>
                
                <div className="text-center p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {categories.length}
                  </div>
                  <div className="text-lg font-semibold text-orange-800">Categories</div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">Quiz Distribution by Category</h4>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryQuizzes = quizzes.filter(quiz => quiz.category === category);
                    if (categoryQuizzes.length === 0) return null;
                    
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-gray-700">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${(categoryQuizzes.length / quizzes.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">
                            {categoryQuizzes.length}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                        onClick={() => setSettings(prev => ({ ...prev, theme: color }))}
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

                {/* Quiz Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time per Question: {settings.timePerQuestion} seconds
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={settings.timePerQuestion}
                      onChange={(e) => setSettings(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10s</span>
                      <span>120s</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Questions per Quiz: {settings.questionsPerQuiz}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={settings.questionsPerQuiz}
                      onChange={(e) => setSettings(prev => ({ ...prev, questionsPerQuiz: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>

                {/* Toggle Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Timer</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, timer: !prev.timer }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.timer 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Clock size={16} />
                      Timer {settings.timer ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Show Results</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showResults: !prev.showResults }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.showResults 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Star size={16} />
                      Results {settings.showResults ? 'Shown' : 'Hidden'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Sound</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.sound 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Zap size={16} />
                      Sound {settings.sound ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Animations</h4>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, animations: !prev.animations }))}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.animations 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Zap size={16} />
                      Animations {settings.animations ? 'Enabled' : 'Disabled'}
                    </button>
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
          <HelpCircle className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Create Quizzes</div>
          <div className="text-sm text-gray-600">Build custom quizzes</div>
        </div>
        <div className="text-center p-4">
          <Clock className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Timed Quizzes</div>
          <div className="text-sm text-gray-600">Challenge with timers</div>
        </div>
        <div className="text-center p-4">
          <Trophy className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Track Progress</div>
          <div className="text-sm text-gray-600">Monitor your scores</div>
        </div>
        <div className="text-center p-4">
          <Settings className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Customizable</div>
          <div className="text-sm text-gray-600">Themes and settings</div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🎯 Quiz App Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>Create custom quizzes</strong> by adding questions with multiple choice options</li>
          <li>• Use <strong>presets</strong> to save and quickly load your favorite quiz configurations</li>
          <li>• Enable the <strong>timer</strong> for an added challenge and to practice quick thinking</li>
          <li>• Review <strong>detailed explanations</strong> to learn from both correct and incorrect answers</li>
          <li>• Track your <strong>progress and statistics</strong> to see improvement over time</li>
          <li>• Perfect for <strong>education, training, or fun trivia nights</strong> with friends</li>
        </ul>
      </div>
    </div>
  );
};

export default QuizApp;
