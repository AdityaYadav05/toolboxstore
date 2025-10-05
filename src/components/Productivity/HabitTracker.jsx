import { useState, useEffect } from 'react';
import { Calendar, Plus, Target, TrendingUp, Award, Clock, Trash2, Edit3, Check, X, Star, Zap, History } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [habitFrequency, setHabitFrequency] = useState('daily');
  const [habitGoal, setHabitGoal] = useState(1);
  const [editingHabit, setEditingHabit] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  const [stats, setStats] = useState(null);

  // Sample initial habits
  const sampleHabits = [
    {
      id: 1,
      name: 'Morning Meditation',
      frequency: 'daily',
      goal: 1,
      streak: 5,
      completedDates: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'],
      color: 'blue',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Exercise',
      frequency: 'daily',
      goal: 1,
      streak: 3,
      completedDates: ['2024-01-17', '2024-01-18', '2024-01-19'],
      color: 'green',
      createdAt: new Date('2024-01-10')
    },
    {
      id: 3,
      name: 'Read Book',
      frequency: 'daily',
      goal: 1,
      streak: 7,
      completedDates: ['2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19'],
      color: 'purple',
      createdAt: new Date('2024-01-01')
    }
  ];

  // Initialize with sample habits
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      setHabits(sampleHabits);
    }
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    calculateStats();
  }, [habits]);

  // Calculate statistics
  const calculateStats = () => {
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit => 
      habit.completedDates.includes(selectedDate)
    ).length;
    const totalCompletions = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
    const longestStreak = Math.max(...habits.map(habit => habit.streak), 0);
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

    setStats({
      totalHabits,
      completedToday,
      totalCompletions,
      longestStreak,
      completionRate
    });
  };

  // Add new habit
  const addHabit = () => {
    if (newHabit.trim() === '') return;

    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      frequency: habitFrequency,
      goal: habitGoal,
      streak: 0,
      completedDates: [],
      color: getRandomColor(),
      createdAt: new Date()
    };

    setHabits(prev => [...prev, habit]);
    setNewHabit('');
    setHabitFrequency('daily');
    setHabitGoal(1);
  };

  // Toggle habit completion
  const toggleHabitCompletion = (habitId) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(selectedDate);
        let newCompletedDates;
        let newStreak = habit.streak;

        if (isCompleted) {
          // Remove completion
          newCompletedDates = habit.completedDates.filter(date => date !== selectedDate);
          // Recalculate streak
          newStreak = calculateStreak(newCompletedDates);
        } else {
          // Add completion
          newCompletedDates = [...habit.completedDates, selectedDate];
          // Update streak
          newStreak = calculateStreak(newCompletedDates);
        }

        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: newStreak
        };
      }
      return habit;
    }));
  };

  // Calculate streak
  const calculateStreak = (completedDates) => {
    if (completedDates.length === 0) return 0;

    const sortedDates = completedDates.sort((a, b) => new Date(b) - new Date(a));
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);

      if (sortedDates[i] === prevDate.toISOString().split('T')[0]) {
        streak++;
        currentDate = new Date(sortedDates[i]);
      } else {
        break;
      }
    }

    return streak;
  };

  // Delete habit
  const deleteHabit = (habitId) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  // Start editing habit
  const startEditing = (habit) => {
    setEditingHabit(habit.id);
    setEditText(habit.name);
  };

  // Save edited habit
  const saveEdit = () => {
    if (editText.trim() === '') return;

    setHabits(prev => prev.map(habit => 
      habit.id === editingHabit 
        ? { ...habit, name: editText.trim() }
        : habit
    ));
    setEditingHabit(null);
    setEditText('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingHabit(null);
    setEditText('');
  };

  // Get random color for new habit
  const getRandomColor = () => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get color classes
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-500 border-blue-500 text-blue-600',
      green: 'bg-green-500 border-green-500 text-green-600',
      purple: 'bg-purple-500 border-purple-500 text-purple-600',
      orange: 'bg-orange-500 border-orange-500 text-orange-600',
      red: 'bg-red-500 border-red-500 text-red-600',
      pink: 'bg-pink-500 border-pink-500 text-pink-600',
      indigo: 'bg-indigo-500 border-indigo-500 text-indigo-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(date);
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push(currentDate.toISOString().split('T')[0]);
    }
    
    return days;
  };

  // Check if habit is completed on specific date
  const isHabitCompletedOnDate = (habit, date) => {
    return habit.completedDates.includes(date);
  };

  // Get completion count for date
  const getCompletionCountForDate = (date) => {
    return habits.filter(habit => habit.completedDates.includes(date)).length;
  };

  // Navigate to previous/next month
  const navigateMonth = (direction) => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Target className="text-green-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Habit Tracker</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center border-2 border-blue-200">
                <Target className="mx-auto text-blue-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.totalHabits}</div>
                <div className="text-sm text-gray-600">Total Habits</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center border-2 border-green-200">
                <Check className="mx-auto text-green-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.completedToday}</div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center border-2 border-purple-200">
                <Award className="mx-auto text-purple-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{stats.longestStreak}</div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl text-center border-2 border-orange-200">
                <TrendingUp className="mx-auto text-orange-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{Math.round(stats.completionRate)}%</div>
                <div className="text-sm text-gray-600">Today's Rate</div>
              </div>
            </div>
          )}

          {/* Add Habit Form */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-blue-600" />
              Add New Habit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="e.g., Morning Meditation"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={habitFrequency}
                  onChange={(e) => setHabitFrequency(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily Goal
                </label>
                <select
                  value={habitGoal}
                  onChange={(e) => setHabitGoal(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value={1}>1 time</option>
                  <option value={2}>2 times</option>
                  <option value={3}>3 times</option>
                  <option value={5}>5 times</option>
                </select>
              </div>
            </div>
            <button
              onClick={addHabit}
              disabled={!newHabit.trim()}
              className="mt-4 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <Zap size={24} />
              Add Habit
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setView('calendar')}
              className={`flex-1 py-3 rounded-lg border-2 text-center transition-all ${
                view === 'calendar'
                  ? 'border-blue-500 bg-blue-100 text-blue-800 font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              <Calendar className="mx-auto mb-1" size={20} />
              Calendar View
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex-1 py-3 rounded-lg border-2 text-center transition-all ${
                view === 'list'
                  ? 'border-blue-500 bg-blue-100 text-blue-800 font-bold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              <List className="mx-auto mb-1" size={20} />
              List View
            </button>
          </div>

          {/* Habits List View */}
          {view === 'list' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Habits</h3>
              {habits.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Target className="mx-auto text-gray-400 mb-4" size={48} />
                  <div className="text-gray-500">No habits yet. Add your first habit above!</div>
                </div>
              ) : (
                habits.map(habit => (
                  <div key={habit.id} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleHabitCompletion(habit.id)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isHabitCompletedOnDate(habit, selectedDate)
                              ? `${getColorClasses(habit.color).split(' ')[0]} border-transparent text-white`
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {isHabitCompletedOnDate(habit, selectedDate) && <Check size={16} />}
                        </button>
                        <div>
                          {editingHabit === habit.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                              />
                              <button onClick={saveEdit} className="p-1 text-green-600 hover:text-green-700">
                                <Check size={16} />
                              </button>
                              <button onClick={cancelEdit} className="p-1 text-red-600 hover:text-red-700">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-800">{habit.name}</div>
                              <button 
                                onClick={() => startEditing(habit)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit3 size={14} />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {habit.frequency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award size={12} />
                              {habit.streak} day streak
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getColorClasses(habit.color).split(' ')[2]}`}>
                              {getColorClasses(habit.color).split(' ')[2].split('-')[1]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-xl font-bold text-gray-800">
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="h-16"></div>;
                  }

                  const completionCount = getCompletionCountForDate(date);
                  const isSelected = date === selectedDate;
                  const isToday = date === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`h-16 p-1 rounded-lg border-2 transition-all relative ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isToday
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`text-sm font-semibold ${
                          isSelected ? 'text-blue-800' : isToday ? 'text-green-800' : 'text-gray-700'
                        }`}>
                          {new Date(date).getDate()}
                        </div>
                        {completionCount > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 mt-1">
                            {habits.slice(0, 3).map(habit => (
                              isHabitCompletedOnDate(habit, date) && (
                                <div
                                  key={habit.id}
                                  className={`w-2 h-2 rounded-full ${getColorClasses(habit.color).split(' ')[0]}`}
                                  title={habit.name}
                                />
                              )
                            ))}
                            {completionCount > 3 && (
                              <div className="text-xs text-gray-500">+{completionCount - 3}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              {formatDate(selectedDate)}
            </h3>
            <div className="space-y-3">
              {habits.filter(habit => isHabitCompletedOnDate(habit, selectedDate)).length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No habits completed on this day
                </div>
              ) : (
                habits
                  .filter(habit => isHabitCompletedOnDate(habit, selectedDate))
                  .map(habit => (
                    <div key={habit.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                      <div className={`w-3 h-3 rounded-full ${getColorClasses(habit.color).split(' ')[0]}`}></div>
                      <div className="font-semibold text-gray-800">{habit.name}</div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Streak Leaders */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-green-600" />
              Streak Leaders
            </h3>
            <div className="space-y-3">
              {habits
                .sort((a, b) => b.streak - a.streak)
                .slice(0, 3)
                .map((habit, index) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getColorClasses(habit.color).split(' ')[0]}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{habit.name}</div>
                        <div className="text-sm text-gray-600">{habit.streak} days</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">🔥</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="w-full p-3 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Go to Today</div>
                <div className="text-sm text-gray-600">Jump to current date</div>
              </button>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const completedHabits = habits.filter(habit => 
                    habit.completedDates.includes(today)
                  ).length;
                  if (completedHabits === habits.length) {
                    alert('🎉 All habits completed today! Great job!');
                  } else {
                    alert(`You've completed ${completedHabits} out of ${habits.length} habits today. Keep going!`);
                  }
                }}
                className="w-full p-3 bg-white hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Check Progress</div>
                <div className="text-sm text-gray-600">See today's completion</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Habit Tracking Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Start with 1-3 small habits and gradually build from there</li>
          <li>• Track your habits at the same time each day to build consistency</li>
          <li>• Don't break the chain - even doing a small version of your habit maintains momentum</li>
          <li>• Use the streak counter as motivation to keep going</li>
          <li>• Review your progress weekly and adjust habits as needed</li>
        </ul>
      </div>
    </div>
  );
};

// List icon component since it's not in lucide-react
const List = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

export default HabitTracker;
