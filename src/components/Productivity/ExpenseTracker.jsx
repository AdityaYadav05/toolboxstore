import { useState, useEffect } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, PieChart, Calendar, Tag, Wallet, Download, Upload, Filter, Trash2, Edit3, Check, X } from 'lucide-react';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [editData, setEditData] = useState({});
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState(null);
  const [budget, setBudget] = useState(2000);

  // Sample initial data
  const sampleExpenses = [
    {
      id: 1,
      description: 'Groceries',
      amount: 85.50,
      category: 'food',
      date: '2024-01-19',
      type: 'expense'
    },
    {
      id: 2,
      description: 'Salary',
      amount: 2500,
      category: 'income',
      date: '2024-01-15',
      type: 'income'
    },
    {
      id: 3,
      description: 'Restaurant',
      amount: 45.00,
      category: 'food',
      date: '2024-01-18',
      type: 'expense'
    },
    {
      id: 4,
      description: 'Electricity Bill',
      amount: 120.00,
      category: 'utilities',
      date: '2024-01-10',
      type: 'expense'
    },
    {
      id: 5,
      description: 'Freelance Work',
      amount: 800,
      category: 'income',
      date: '2024-01-12',
      type: 'income'
    },
    {
      id: 6,
      description: 'Gas',
      amount: 60.00,
      category: 'transportation',
      date: '2024-01-17',
      type: 'expense'
    }
  ];

  const sampleCategories = [
    { id: 'food', name: 'Food & Dining', type: 'expense', color: 'red', budget: 400 },
    { id: 'transportation', name: 'Transportation', type: 'expense', color: 'blue', budget: 200 },
    { id: 'utilities', name: 'Utilities', type: 'expense', color: 'green', budget: 300 },
    { id: 'entertainment', name: 'Entertainment', type: 'expense', color: 'purple', budget: 150 },
    { id: 'shopping', name: 'Shopping', type: 'expense', color: 'orange', budget: 200 },
    { id: 'healthcare', name: 'Healthcare', type: 'expense', color: 'pink', budget: 100 },
    { id: 'income', name: 'Income', type: 'income', color: 'emerald', budget: 0 }
  ];

  // Initialize data
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedCategories = localStorage.getItem('categories');
    const savedBudget = localStorage.getItem('budget');

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      setExpenses(sampleExpenses);
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(sampleCategories);
    }

    if (savedBudget) {
      setBudget(parseFloat(savedBudget));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('budget', JSON.stringify(budget));
    calculateStats();
  }, [expenses, categories, budget]);

  // Calculate statistics
  const calculateStats = () => {
    const filteredExpenses = filterExpensesByTimeRange(expenses, timeRange);
    const totalIncome = filteredExpenses
      .filter(expense => expense.type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const totalExpenses = filteredExpenses
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryBreakdown = categories.map(category => {
      const categoryExpenses = filteredExpenses.filter(
        expense => expense.category === category.id && expense.type === 'expense'
      );
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const budgetUsed = category.budget > 0 ? (total / category.budget) * 100 : 0;
      
      return {
        ...category,
        total,
        budgetUsed,
        count: categoryExpenses.length
      };
    });

    // Recent transactions
    const recentTransactions = [...filteredExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    setStats({
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      categoryBreakdown,
      recentTransactions,
      transactionCount: filteredExpenses.length
    });
  };

  // Filter expenses by time range
  const filterExpensesByTimeRange = (expensesList, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return expensesList;
    }

    return expensesList.filter(expense => new Date(expense.date) >= startDate);
  };

  // Add new expense
  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) return;

    const category = categories.find(cat => cat.id === newExpense.category);
    const expense = {
      id: Date.now(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      type: category.type
    };

    setExpenses(prev => [...prev, expense]);
    setNewExpense({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Delete expense
  const deleteExpense = (expenseId) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  // Start editing expense
  const startEditing = (expense) => {
    setEditingExpense(expense.id);
    setEditData({ ...expense });
  };

  // Save edited expense
  const saveEdit = () => {
    if (!editData.description || !editData.amount || !editData.category) return;

    setExpenses(prev => prev.map(expense =>
      expense.id === editingExpense
        ? { ...editData, amount: parseFloat(editData.amount) }
        : expense
    ));
    setEditingExpense(null);
    setEditData({});
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingExpense(null);
    setEditData({});
  };

  // Add new category
  const addCategory = () => {
    const newCategory = {
      id: `custom-${Date.now()}`,
      name: 'New Category',
      type: 'expense',
      color: 'gray',
      budget: 0
    };
    setCategories(prev => [...prev, newCategory]);
  };

  // Get filtered expenses
  const getFilteredExpenses = () => {
    let filtered = expenses;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(expense => expense.type === filter);
    }

    // Filter by time range
    filtered = filterExpensesByTimeRange(filtered, timeRange);

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get color classes
  const getColorClasses = (color) => {
    const colorMap = {
      red: 'bg-red-500 border-red-500 text-red-600',
      blue: 'bg-blue-500 border-blue-500 text-blue-600',
      green: 'bg-green-500 border-green-500 text-green-600',
      purple: 'bg-purple-500 border-purple-500 text-purple-600',
      orange: 'bg-orange-500 border-orange-500 text-orange-600',
      pink: 'bg-pink-500 border-pink-500 text-pink-600',
      emerald: 'bg-emerald-500 border-emerald-500 text-emerald-600',
      gray: 'bg-gray-500 border-gray-500 text-gray-600'
    };
    return colorMap[color] || colorMap.gray;
  };

  // Export data
  const exportData = () => {
    const data = {
      expenses,
      categories,
      budget,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.expenses) setExpenses(data.expenses);
        if (data.categories) setCategories(data.categories);
        if (data.budget) setBudget(data.budget);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="text-green-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Expense Tracker</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-xl text-center border-2 border-green-200">
                <TrendingUp className="mx-auto text-green-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalIncome)}</div>
                <div className="text-sm text-gray-600">Total Income</div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center border-2 border-red-200">
                <TrendingDown className="mx-auto text-red-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalExpenses)}</div>
                <div className="text-sm text-gray-600">Total Expenses</div>
              </div>
              <div className={`p-4 rounded-xl text-center border-2 ${
                stats.balance >= 0 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <Wallet className={`mx-auto mb-2 ${
                  stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`} size={24} />
                <div className={`text-2xl font-bold ${
                  stats.balance >= 0 ? 'text-blue-800' : 'text-orange-800'
                }`}>
                  {formatCurrency(stats.balance)}
                </div>
                <div className="text-sm text-gray-600">Balance</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center border-2 border-purple-200">
                <PieChart className="mx-auto text-purple-600 mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{Math.round(stats.savingsRate)}%</div>
                <div className="text-sm text-gray-600">Savings Rate</div>
              </div>
            </div>
          )}

          {/* Add Expense Form */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-blue-600" />
              Add New Transaction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Groceries"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={addExpense}
              disabled={!newExpense.description || !newExpense.amount || !newExpense.category}
              className="mt-4 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <Plus size={24} />
              Add Transaction
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Filter:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
                >
                  <Download size={16} />
                  Export
                </button>
                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 cursor-pointer">
                  <Upload size={16} />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Transactions</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {getFilteredExpenses().length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                  <div className="text-gray-500">No transactions found. Add your first transaction above!</div>
                </div>
              ) : (
                getFilteredExpenses().map(expense => {
                  const category = categories.find(cat => cat.id === expense.category);
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(category?.color).split(' ')[0]} text-white`}>
                          <Tag size={20} />
                        </div>
                        <div className="flex-1">
                          {editingExpense === expense.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editData.description}
                                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                className="px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                              />
                              <input
                                type="number"
                                value={editData.amount}
                                onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
                                className="px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none w-24"
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
                              <div>
                                <div className="font-semibold text-gray-800">{expense.description}</div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                  <span>{category?.name}</span>
                                  <span>•</span>
                                  <span>{new Date(expense.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-lg font-bold ${
                          expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                        </div>
                        {editingExpense !== expense.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(expense)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Setting */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet className="text-blue-600" />
              Monthly Budget
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              {stats && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent this month:</span>
                    <span className="font-semibold">{formatCurrency(stats.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining:</span>
                    <span className={`font-semibold ${
                      (budget - stats.totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(budget - stats.totalExpenses)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (stats.totalExpenses / budget) * 100 <= 80 ? 'bg-green-500' :
                        (stats.totalExpenses / budget) * 100 <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((stats.totalExpenses / budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          {stats && (
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="text-green-600" />
                Spending by Category
              </h3>
              <div className="space-y-3">
                {stats.categoryBreakdown
                  .filter(cat => cat.type === 'expense' && cat.total > 0)
                  .sort((a, b) => b.total - a.total)
                  .map(category => (
                    <div key={category.id} className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getColorClasses(category.color).split(' ')[0]}`}></div>
                          <span className="font-semibold text-gray-800">{category.name}</span>
                        </div>
                        <span className="font-bold text-gray-800">{formatCurrency(category.total)}</span>
                      </div>
                      {category.budget > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Budget: {formatCurrency(category.budget)}</span>
                            <span>{Math.round(category.budgetUsed)}% used</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${
                                category.budgetUsed <= 80 ? 'bg-green-500' :
                                category.budgetUsed <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(category.budgetUsed, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {stats && stats.recentTransactions.length > 0 && (
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-purple-600" />
                Recent Transactions
              </h3>
              <div className="space-y-3">
                {stats.recentTransactions.map(transaction => {
                  const category = categories.find(cat => cat.id === transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{transaction.description}</div>
                        <div className="text-xs text-gray-600">{category?.name}</div>
                      </div>
                      <div className={`text-sm font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-orange-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={addCategory}
                className="w-full p-3 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">Add New Category</div>
                <div className="text-sm text-gray-600">Create custom spending categories</div>
              </button>
              <button
                onClick={() => {
                  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                  alert(`Total transactions: ${expenses.length}\nTotal amount: ${formatCurrency(total)}`);
                }}
                className="w-full p-3 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">View Summary</div>
                <div className="text-sm text-gray-600">See overall financial summary</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Expense Tracking Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Track every expense, no matter how small, for accurate budgeting</li>
          <li>• Set realistic category budgets and review them monthly</li>
          <li>• Use the savings rate to measure your financial progress</li>
          <li>• Regularly export your data to maintain backups</li>
          <li>• Review spending patterns monthly to identify areas for improvement</li>
        </ul>
      </div>
    </div>
  );
};

export default ExpenseTracker;