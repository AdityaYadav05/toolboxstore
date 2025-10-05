import { useState, useEffect } from 'react';
import { Square, Trophy, RotateCcw, Star, Settings, Volume2, VolumeX, Clock, Zap, Heart, Sparkles, Award } from 'lucide-react';

const MemoryCardGame = () => {
  const [game, setGame] = useState({
    cards: [],
    flippedCards: [],
    matchedCards: [],
    moves: 0,
    score: 0,
    gameStatus: 'waiting', // 'waiting', 'playing', 'finished'
    timeElapsed: 0,
    isProcessing: false
  });

  const [settings, setSettings] = useState({
    soundEnabled: true,
    animations: true,
    theme: 'blue',
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    cardSet: 'animals'
  });

  const [stats, setStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    bestTime: 0,
    totalMatches: 0
  });

  const [activeTab, setActiveTab] = useState('game');

  // Card sets
  const cardSets = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    fruits: ['🍎', '🍌', '🍒', '🍇', '🍓', '🍊', '🍋', '🍉'],
    sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🎯'],
    travel: ['🚗', '✈️', '🚂', '🚢', '🏠', '🏕️', '🏖️', '🗺️'],
    food: ['🍕', '🍔', '🍟', '🌭', '🍦', '🍩', '🍪', '☕'],
    nature: ['🌞', '🌙', '⭐', '☁️', '🌈', '🌺', '🌴', '🌊']
  };

  // Initialize game
  useEffect(() => {
    const savedStats = localStorage.getItem('memoryGameStats');
    const savedSettings = localStorage.getItem('memoryGameSettings');
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('memoryGameStats', JSON.stringify(stats));
    localStorage.setItem('memoryGameSettings', JSON.stringify(settings));
  }, [stats, settings]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (game.gameStatus === 'playing') {
      timer = setInterval(() => {
        setGame(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [game.gameStatus]);

  // Initialize cards based on difficulty
  const initializeCards = () => {
    const selectedSet = cardSets[settings.cardSet];
    const difficultySettings = {
      easy: { pairs: 6, grid: 'grid-cols-4' },
      medium: { pairs: 8, grid: 'grid-cols-4' },
      hard: { pairs: 12, grid: 'grid-cols-6' }
    };
    
    const { pairs } = difficultySettings[settings.difficulty];
    const selectedCards = selectedSet.slice(0, pairs);
    const cardPairs = [...selectedCards, ...selectedCards];
    
    // Shuffle cards
    const shuffledCards = cardPairs
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    return shuffledCards;
  };

  // Start new game
  const startNewGame = () => {
    const newCards = initializeCards();
    setGame({
      cards: newCards,
      flippedCards: [],
      matchedCards: [],
      moves: 0,
      score: 0,
      gameStatus: 'playing',
      timeElapsed: 0,
      isProcessing: false
    });
    
    setStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
  };

  // Handle card click
  const handleCardClick = (clickedCard) => {
    if (
      game.isProcessing ||
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      game.flippedCards.length >= 2 ||
      game.gameStatus !== 'playing'
    ) {
      return;
    }

    const updatedCards = game.cards.map(card =>
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );

    const newFlippedCards = [...game.flippedCards, clickedCard];

    setGame(prev => ({
      ...prev,
      cards: updatedCards,
      flippedCards: newFlippedCards,
      moves: prev.moves + 1
    }));

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setGame(prev => ({ ...prev, isProcessing: true }));
      
      setTimeout(() => {
        checkForMatch(newFlippedCards);
      }, 1000);
    }
  };

  // Check if two flipped cards match
  const checkForMatch = (flippedCards) => {
    const [firstCard, secondCard] = flippedCards;
    const isMatch = firstCard.emoji === secondCard.emoji;

    let updatedCards;
    let newMatchedCards;
    let newScore;

    if (isMatch) {
      updatedCards = game.cards.map(card =>
        card.id === firstCard.id || card.id === secondCard.id
          ? { ...card, isMatched: true, isFlipped: true }
          : card
      );
      
      newMatchedCards = [...game.matchedCards, firstCard.id, secondCard.id];
      newScore = game.score + 100 + Math.max(0, 500 - game.timeElapsed * 2);
      
      setStats(prev => ({ ...prev, totalMatches: prev.totalMatches + 1 }));
    } else {
      updatedCards = game.cards.map(card =>
        flippedCards.some(flipped => flipped.id === card.id)
          ? { ...card, isFlipped: false }
          : card
      );
      newMatchedCards = game.matchedCards;
      newScore = Math.max(0, game.score - 10);
    }

    const difficultySettings = {
      easy: 6,
      medium: 8,
      hard: 12
    };
    const totalPairs = difficultySettings[settings.difficulty];
    const isGameComplete = newMatchedCards.length === totalPairs * 2;

    setGame(prev => ({
      ...prev,
      cards: updatedCards,
      flippedCards: [],
      matchedCards: newMatchedCards,
      score: newScore,
      isProcessing: false,
      gameStatus: isGameComplete ? 'finished' : 'playing'
    }));

    // Update best scores if game is complete
    if (isGameComplete) {
      setStats(prev => ({
        ...prev,
        bestScore: Math.max(prev.bestScore, newScore),
        bestTime: prev.bestTime === 0 ? game.timeElapsed : Math.min(prev.bestTime, game.timeElapsed)
      }));
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update settings
  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
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

  const theme = getThemeColors();

  // Calculate game progress
  const getGameProgress = () => {
    const totalPairs = {
      easy: 6,
      medium: 8,
      hard: 12
    }[settings.difficulty];
    
    return (game.matchedCards.length / 2 / totalPairs) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Square className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Memory Card Game</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Game Controls */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Game Controls</h3>
            </div>
            <div className="p-2">
              <button
                onClick={startNewGame}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  game.gameStatus === 'waiting' 
                    ? `bg-${theme.primary}-100 text-${theme.primary}-800` 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Sparkles size={16} />
                New Game
              </button>
              <button
                onClick={startNewGame}
                className="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 hover:bg-gray-100"
              >
                <RotateCcw size={16} />
                Restart Game
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Navigation</h3>
            </div>
            <div className="p-2">
              {[
                { id: 'game', name: 'Game Board', icon: Square },
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

          {/* Game Info */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Game Info</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Moves:</span>
                <span className="font-bold text-gray-800">{game.moves}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Score:</span>
                <span className="font-bold text-green-600">{game.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Time:</span>
                <span className="font-bold text-blue-600">{formatTime(game.timeElapsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Matches:</span>
                <span className="font-bold text-purple-600">{game.matchedCards.length / 2}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Progress</h3>
            </div>
            <div className="p-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-${theme.primary}-500 transition-all duration-500`}
                  style={{ width: `${getGameProgress()}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                {Math.round(getGameProgress())}% Complete
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'game' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              {/* Game Status */}
              <div className="text-center mb-8">
                {game.gameStatus === 'finished' ? (
                  <div className={`text-2xl font-bold text-${theme.primary}-600 flex items-center justify-center gap-2`}>
                    <Award className="text-yellow-500" />
                    Congratulations! You Won!
                    <Award className="text-yellow-500" />
                  </div>
                ) : game.gameStatus === 'waiting' ? (
                  <div className="text-xl text-gray-600">Click "New Game" to start playing!</div>
                ) : (
                  <div className="text-xl text-gray-800">
                    Find all the matching pairs!
                  </div>
                )}
              </div>

              {/* Game Board */}
              <div className="flex justify-center">
                <div className={`
                  grid gap-3 p-6 bg-gray-100 rounded-2xl shadow-inner
                  ${settings.difficulty === 'hard' ? 'grid-cols-6' : 'grid-cols-4'}
                  ${settings.difficulty === 'easy' ? 'max-w-md' : 'max-w-2xl'}
                `}>
                  {game.cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      disabled={game.isProcessing || card.isMatched}
                      className={`
                        w-20 h-20 rounded-xl text-3xl font-bold transition-all duration-300
                        flex items-center justify-center shadow-lg
                        ${settings.animations ? 'transform hover:scale-105' : ''}
                        ${card.isFlipped || card.isMatched
                          ? `bg-white text-gray-800 border-2 border-${theme.primary}-300`
                          : `bg-${theme.primary}-500 text-white border-2 border-${theme.primary}-600 hover:bg-${theme.primary}-600`
                        }
                        ${card.isMatched ? 'opacity-75 scale-95' : ''}
                        ${!card.isFlipped && !card.isMatched && game.gameStatus === 'playing' 
                          ? 'cursor-pointer hover:shadow-xl' 
                          : 'cursor-default'
                        }
                      `}
                    >
                      {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{game.moves}</div>
                  <div className="text-sm text-blue-800">Moves</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-2xl font-bold text-green-600">{game.score}</div>
                  <div className="text-sm text-green-800">Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{game.matchedCards.length / 2}</div>
                  <div className="text-sm text-purple-800">Matches</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{formatTime(game.timeElapsed)}</div>
                  <div className="text-sm text-orange-800">Time</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Game Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.gamesPlayed}</div>
                  <div className="text-lg font-semibold text-blue-800">Games Played</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.bestScore}</div>
                  <div className="text-lg font-semibold text-green-800">Best Score</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{formatTime(stats.bestTime)}</div>
                  <div className="text-lg font-semibold text-purple-800">Best Time</div>
                </div>
                
                <div className="text-center p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalMatches}</div>
                  <div className="text-lg font-semibold text-orange-800">Total Matches</div>
                </div>
              </div>

              {/* Recent Games */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">Performance Tips</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Zap className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                    <span>Try to remember the position of cards when they're flipped</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                    <span>Take your time - fewer moves with better accuracy gives higher scores</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
                    <span>Complete games faster to earn time bonuses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                    <span>Practice with different card sets to improve your memory</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="text-gray-600" />
                Game Settings
              </h3>
              
              <div className="space-y-8">
                {/* Theme Selection */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Theme Color</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['blue', 'green', 'purple', 'orange'].map(color => (
                      <button
                        key={color}
                        onClick={() => updateSettings('theme', color)}
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

                {/* Difficulty Selection */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Difficulty Level</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'easy', name: 'Easy', pairs: 6, description: '4×3 grid (6 pairs)' },
                      { id: 'medium', name: 'Medium', pairs: 8, description: '4×4 grid (8 pairs)' },
                      { id: 'hard', name: 'Hard', pairs: 12, description: '6×4 grid (12 pairs)' }
                    ].map(difficulty => (
                      <button
                        key={difficulty.id}
                        onClick={() => updateSettings('difficulty', difficulty.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                          settings.difficulty === difficulty.id 
                            ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                            : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        <Star size={16} className={
                          difficulty.id === 'easy' ? 'text-green-500' :
                          difficulty.id === 'medium' ? 'text-yellow-500' : 'text-red-500'
                        } />
                        <div>
                          <div className="font-semibold">{difficulty.name}</div>
                          <div className="text-sm text-gray-500">{difficulty.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Set Selection */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Card Set</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(cardSets).map(([setKey, setEmojis]) => (
                      <button
                        key={setKey}
                        onClick={() => updateSettings('cardSet', setKey)}
                        className={`p-4 rounded-lg border-2 transition text-center ${
                          settings.cardSet === setKey 
                            ? `border-${theme.primary}-500 bg-${theme.primary}-100` 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-2">{setEmojis[0]}{setEmojis[1]}</div>
                        <div className="text-sm capitalize">{setKey}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Sound</h4>
                    <button
                      onClick={() => updateSettings('soundEnabled', !settings.soundEnabled)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.soundEnabled 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      Sound {settings.soundEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Animations</h4>
                    <button
                      onClick={() => updateSettings('animations', !settings.animations)}
                      className={`w-full px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                        settings.animations 
                          ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <Sparkles size={16} />
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
          <Square className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Multiple Themes</div>
          <div className="text-sm text-gray-600">6 different card sets</div>
        </div>
        <div className="text-center p-4">
          <Star className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">3 Difficulty Levels</div>
          <div className="text-sm text-gray-600">Easy to hard challenges</div>
        </div>
        <div className="text-center p-4">
          <Trophy className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Score Tracking</div>
          <div className="text-sm text-gray-600">Track your best scores</div>
        </div>
        <div className="text-center p-4">
          <Settings className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Customizable</div>
          <div className="text-sm text-gray-600">Themes and settings</div>
        </div>
      </div>

      {/* Game Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🎮 How to Play Memory Card Game:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Click on cards to flip them and find matching pairs</li>
          <li>• You can only flip two cards at a time</li>
          <li>• If the two flipped cards match, they stay face up</li>
          <li>• If they don't match, they flip back after a short delay</li>
          <li>• Complete the board by finding all matching pairs</li>
          <li>• Try to complete the game with the fewest moves and fastest time for high scores!</li>
        </ul>
      </div>
    </div>
  );
};

export default MemoryCardGame;