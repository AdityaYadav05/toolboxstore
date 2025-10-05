import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, RotateCcw, Users, Zap, Crown, Star, Settings, Volume2, VolumeX } from 'lucide-react';

const TicTacToe = () => {
  const [game, setGame] = useState({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    winningLine: [],
    isDraw: false,
    scores: {
      X: 0,
      O: 0,
      draws: 0
    },
    gameHistory: []
  });

  const [settings, setSettings] = useState({
    soundEnabled: true,
    animations: true,
    theme: 'blue',
    difficulty: 'easy'
  });

  const [gameMode, setGameMode] = useState('player'); // 'player' or 'ai'
  const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'playing', 'finished'
  const [activeTab, setActiveTab] = useState('game');

  // Initialize game
  useEffect(() => {
    const savedScores = localStorage.getItem('ticTacToeScores');
    const savedSettings = localStorage.getItem('ticTacToeSettings');
    
    if (savedScores) {
      setGame(prev => ({
        ...prev,
        scores: JSON.parse(savedScores)
      }));
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ticTacToeScores', JSON.stringify(game.scores));
    localStorage.setItem('ticTacToeSettings', JSON.stringify(settings));
  }, [game.scores, settings]);

  // Check for winner
  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: lines[i] };
      }
    }

    if (!board.includes(null)) {
      return { winner: 'draw', line: [] };
    }

    return null;
  };

  // AI Move (Minimax algorithm for hard difficulty)
  const getAIMove = (board, difficulty) => {
    const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    if (difficulty === 'easy') {
      // Random move for easy difficulty
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficulty === 'medium') {
      // Sometimes block or win, sometimes random
      if (Math.random() < 0.7) {
        // Try to win or block
        for (let player of ['O', 'X']) {
          for (let move of availableMoves) {
            const newBoard = [...board];
            newBoard[move] = player;
            if (checkWinner(newBoard)?.winner === player) {
              return move;
            }
          }
        }
      }
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      // Hard difficulty - Minimax algorithm
      return minimax(board, 'O').index;
    }
  };

  // Minimax algorithm for hard AI
  const minimax = (newBoard, player) => {
    const availSpots = newBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    const result = checkWinner(newBoard);
    if (result?.winner === 'O') return { score: 10 };
    if (result?.winner === 'X') return { score: -10 };
    if (result?.winner === 'draw') return { score: 0 };

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === 'O') {
        move.score = minimax(newBoard, 'X').score;
      } else {
        move.score = minimax(newBoard, 'O').score;
      }

      newBoard[availSpots[i]] = null;
      moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  // Handle cell click
  const handleCellClick = (index) => {
    if (game.board[index] || game.winner || game.isDraw || gameStatus === 'finished') {
      return;
    }

    // Player's move
    const newBoard = [...game.board];
    newBoard[index] = game.currentPlayer;
    
    const result = checkWinner(newBoard);
    
    let newScores = { ...game.scores };
    let newWinner = null;
    let newWinningLine = [];
    let newIsDraw = false;

    if (result) {
      if (result.winner === 'draw') {
        newIsDraw = true;
        newScores.draws += 1;
      } else {
        newWinner = result.winner;
        newWinningLine = result.line;
        newScores[result.winner] += 1;
      }
    }

    const updatedGame = {
      ...game,
      board: newBoard,
      winner: newWinner,
      winningLine: newWinningLine,
      isDraw: newIsDraw,
      scores: newScores,
      gameHistory: [...game.gameHistory, { board: [...newBoard], player: game.currentPlayer }]
    };

    setGame(updatedGame);

    // AI move if playing against AI and game isn't over
    if (gameMode === 'ai' && !newWinner && !newIsDraw && gameStatus === 'playing') {
      setTimeout(() => {
        const aiMove = getAIMove(newBoard, settings.difficulty);
        if (aiMove !== undefined) {
          handleAIMove(aiMove, updatedGame);
        }
      }, 500);
    }
  };

  // Handle AI move
  const handleAIMove = (index, currentGame) => {
    if (currentGame.board[index] || currentGame.winner || currentGame.isDraw) {
      return;
    }

    const newBoard = [...currentGame.board];
    newBoard[index] = 'O';
    
    const result = checkWinner(newBoard);
    
    let newScores = { ...currentGame.scores };
    let newWinner = null;
    let newWinningLine = [];
    let newIsDraw = false;

    if (result) {
      if (result.winner === 'draw') {
        newIsDraw = true;
        newScores.draws += 1;
      } else {
        newWinner = result.winner;
        newWinningLine = result.line;
        newScores[result.winner] += 1;
      }
    }

    setGame({
      ...currentGame,
      board: newBoard,
      currentPlayer: 'X',
      winner: newWinner,
      winningLine: newWinningLine,
      isDraw: newIsDraw,
      scores: newScores,
      gameHistory: [...currentGame.gameHistory, { board: [...newBoard], player: 'O' }]
    });
  };

  // Reset game
  const resetGame = () => {
    setGame({
      ...game,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      winningLine: [],
      isDraw: false
    });
    setGameStatus('waiting');
  };

  // Start new game
  const startNewGame = (mode) => {
    setGameMode(mode);
    resetGame();
    setGameStatus('playing');
  };

  // Reset scores
  const resetScores = () => {
    setGame({
      ...game,
      scores: { X: 0, O: 0, draws: 0 }
    });
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

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Gamepad2 className={`text-${theme.primary}-600`} size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Tic-Tac-Toe</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Game Mode Selection */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Game Mode</h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => startNewGame('player')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  gameMode === 'player' 
                    ? `bg-${theme.primary}-100 text-${theme.primary}-800` 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Users size={16} />
                Player vs Player
              </button>
              <button
                onClick={() => startNewGame('ai')}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  gameMode === 'ai' 
                    ? `bg-${theme.primary}-100 text-${theme.primary}-800` 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Zap size={16} />
                Player vs AI
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
                { id: 'game', name: 'Game Board', icon: Gamepad2 },
                { id: 'scores', name: 'Score Board', icon: Trophy },
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
                onClick={resetGame}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset Game
              </button>
              <button
                onClick={resetScores}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trophy size={16} />
                Reset Scores
              </button>
            </div>
          </div>

          {/* Current Game Info */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Game Info</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Player:</span>
                <span className={`font-bold text-${theme.primary}-600`}>
                  {game.currentPlayer}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Game Mode:</span>
                <span className="font-semibold text-gray-800">
                  {gameMode === 'player' ? 'PvP' : 'PvAI'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${
                  gameStatus === 'playing' ? 'text-green-600' : 
                  gameStatus === 'finished' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1)}
                </span>
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
                {game.winner ? (
                  <div className={`text-2xl font-bold text-${theme.primary}-600 flex items-center justify-center gap-2`}>
                    <Crown className="text-yellow-500" />
                    Player {game.winner} Wins!
                    <Crown className="text-yellow-500" />
                  </div>
                ) : game.isDraw ? (
                  <div className="text-2xl font-bold text-gray-600">It's a Draw!</div>
                ) : gameStatus === 'waiting' ? (
                  <div className="text-xl text-gray-600">Select a game mode to start playing!</div>
                ) : (
                  <div className="text-xl text-gray-800">
                    Current Player: <span className={`font-bold text-${theme.primary}-600 text-2xl`}>{game.currentPlayer}</span>
                  </div>
                )}
              </div>

              {/* Game Board */}
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-4 bg-gray-100 p-6 rounded-2xl shadow-inner">
                  {game.board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={gameStatus !== 'playing' || cell !== null}
                      className={`
                        w-24 h-24 rounded-xl text-4xl font-bold transition-all duration-300
                        flex items-center justify-center shadow-lg
                        ${game.winningLine.includes(index) 
                          ? `bg-${theme.primary}-200 border-2 border-${theme.primary}-400 scale-105` 
                          : 'bg-white border-2 border-gray-300 hover:border-gray-400'
                        }
                        ${settings.animations ? 'hover:scale-105' : ''}
                        ${cell === 'X' ? `text-${theme.primary}-600` : 'text-green-600'}
                        ${!cell && gameStatus === 'playing' ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
                      `}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex justify-center gap-4 mt-8">
                {gameStatus !== 'playing' && gameStatus !== 'waiting' && (
                  <button
                    onClick={resetGame}
                    className={`px-6 py-3 bg-${theme.primary}-600 text-white rounded-lg hover:bg-${theme.primary}-700 transition flex items-center gap-2`}
                  >
                    <RotateCcw size={20} />
                    Play Again
                  </button>
                )}
                
                {gameStatus === 'waiting' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => startNewGame('player')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Users size={20} />
                      Player vs Player
                    </button>
                    <button
                      onClick={() => startNewGame('ai')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Zap size={20} />
                      Player vs AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Score Board
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{game.scores.X}</div>
                  <div className="text-lg font-semibold text-blue-800">Player X Wins</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">{game.scores.O}</div>
                  <div className="text-lg font-semibold text-green-800">Player O Wins</div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div className="text-3xl font-bold text-gray-600 mb-2">{game.scores.draws}</div>
                  <div className="text-lg font-semibold text-gray-800">Draws</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Game Statistics</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Games Played:</span>
                    <span className="font-semibold">{game.scores.X + game.scores.O + game.scores.draws}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate (X):</span>
                    <span className="font-semibold">
                      {game.scores.X + game.scores.O > 0 
                        ? Math.round((game.scores.X / (game.scores.X + game.scores.O)) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate (O):</span>
                    <span className="font-semibold">
                      {game.scores.X + game.scores.O > 0 
                        ? Math.round((game.scores.O / (game.scores.X + game.scores.O)) * 100) 
                        : 0}%
                    </span>
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
              
              <div className="space-y-6">
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

                {/* AI Difficulty */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">AI Difficulty</h4>
                  <div className="space-y-2">
                    {['easy', 'medium', 'hard'].map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => updateSettings('difficulty', difficulty)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-2 ${
                          settings.difficulty === difficulty 
                            ? `bg-${theme.primary}-100 text-${theme.primary}-800 border-2 border-${theme.primary}-300` 
                            : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        <Star size={16} className={
                          difficulty === 'easy' ? 'text-green-500' :
                          difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                        } />
                        <span className="capitalize">{difficulty}</span>
                        {difficulty === 'easy' && <span className="text-sm text-gray-500 ml-auto">(Random moves)</span>}
                        {difficulty === 'medium' && <span className="text-sm text-gray-500 ml-auto">(Sometimes smart)</span>}
                        {difficulty === 'hard' && <span className="text-sm text-gray-500 ml-auto">(Always optimal)</span>}
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
          <Users className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Two Player Mode</div>
          <div className="text-sm text-gray-600">Play with a friend</div>
        </div>
        <div className="text-center p-4">
          <Zap className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Smart AI</div>
          <div className="text-sm text-gray-600">Multiple difficulty levels</div>
        </div>
        <div className="text-center p-4">
          <Trophy className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Score Tracking</div>
          <div className="text-sm text-gray-600">Track your wins and stats</div>
        </div>
        <div className="text-center p-4">
          <Settings className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Customizable</div>
          <div className="text-sm text-gray-600">Themes and settings</div>
        </div>
      </div>

      {/* Game Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🎮 How to Play:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Players take turns placing X and O marks on the 3x3 grid</li>
          <li>• The first player to get 3 of their marks in a row (horizontally, vertically, or diagonally) wins</li>
          <li>• If all 9 squares are filled and no player has 3 in a row, the game is a draw</li>
          <li>• Choose between playing against a friend or testing your skills against our AI</li>
          <li>• Adjust the AI difficulty in settings for a greater challenge</li>
        </ul>
      </div>
    </div>
  );
};

export default TicTacToe;
