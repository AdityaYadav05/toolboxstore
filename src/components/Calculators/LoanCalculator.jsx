import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Calendar, Percent, TrendingUp, PieChart, Download, Copy, Check, Zap, History, Target } from 'lucide-react';

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(25000);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(5);
  const [loanType, setLoanType] = useState('years');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [results, setResults] = useState(null);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Loan types with descriptions
  const loanTypes = [
    { id: 'personal', name: 'Personal Loan', icon: DollarSign, color: 'blue' },
    { id: 'mortgage', name: 'Mortgage', icon: TrendingUp, color: 'green' },
    { id: 'auto', name: 'Auto Loan', icon: Target, color: 'purple' },
    { id: 'student', name: 'Student Loan', icon: PieChart, color: 'orange' }
  ];

  // Payment frequencies
  const paymentFrequencies = [
    { id: 'monthly', name: 'Monthly', multiplier: 12 },
    { id: 'biweekly', name: 'Bi-Weekly', multiplier: 26 },
    { id: 'weekly', name: 'Weekly', multiplier: 52 }
  ];

  // Calculate loan results
  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    
    // Convert term to months based on loan type
    let numberOfPayments;
    if (loanType === 'years') {
      numberOfPayments = loanTerm * getPaymentFrequencyMultiplier();
    } else {
      numberOfPayments = loanTerm;
    }

    const monthlyRate = annualRate / getPaymentFrequencyMultiplier();
    
    // Calculate monthly payment using the formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    // Calculate amortization schedule (first 12 months)
    const amortizationSchedule = [];
    let remainingBalance = principal;
    
    for (let i = 1; i <= Math.min(12, numberOfPayments); i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      amortizationSchedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }

    const result = {
      monthlyPayment: monthlyPayment,
      totalPayment: totalPayment,
      totalInterest: totalInterest,
      numberOfPayments: numberOfPayments,
      amortizationSchedule: amortizationSchedule,
      calculationDate: new Date().toLocaleString()
    };

    setResults(result);

    // Add to history
    const historyItem = {
      id: Date.now(),
      loanAmount: principal,
      interestRate: annualRate * 100,
      loanTerm: loanTerm,
      loanType: loanType,
      paymentFrequency: paymentFrequency,
      monthlyPayment: monthlyPayment,
      totalInterest: totalInterest,
      timestamp: new Date().toLocaleTimeString()
    };
    setCalculationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  const getPaymentFrequencyMultiplier = () => {
    return paymentFrequencies.find(freq => freq.id === paymentFrequency)?.multiplier || 12;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const copyToClipboard = async () => {
    if (results) {
      const text = `Loan Summary:\nMonthly Payment: ${formatCurrency(results.monthlyPayment)}\nTotal Interest: ${formatCurrency(results.totalInterest)}\nTotal Payment: ${formatCurrency(results.totalPayment)}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    setCalculationHistory([]);
  };

  const resetCalculator = () => {
    setLoanAmount(25000);
    setInterestRate(5.5);
    setLoanTerm(5);
    setLoanType('years');
    setPaymentFrequency('monthly');
    setResults(null);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTerm, loanType, paymentFrequency]);

  // Quick preset buttons
  const loanPresets = [
    { amount: 15000, rate: 6.5, term: 3, type: 'personal', label: 'Personal Loan' },
    { amount: 300000, rate: 4.2, term: 30, type: 'mortgage', label: 'Mortgage' },
    { amount: 25000, rate: 3.5, term: 5, type: 'auto', label: 'Auto Loan' },
    { amount: 50000, rate: 5.0, term: 10, type: 'student', label: 'Student Loan' }
  ];

  const applyPreset = (preset) => {
    setLoanAmount(preset.amount);
    setInterestRate(preset.rate);
    setLoanTerm(preset.term);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="text-green-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Loan Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calculator Card */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Loan Amount
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">$</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$1,000</span>
                  <span>$1,000,000</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Percent size={16} />
                    Interest Rate (%)
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    step="0.1"
                    className="w-full pl-4 pr-10 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Loan Term
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => setLoanType('years')}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      loanType === 'years'
                        ? 'border-blue-500 bg-blue-100 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    Years
                  </button>
                  <button
                    onClick={() => setLoanType('months')}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      loanType === 'months'
                        ? 'border-blue-500 bg-blue-100 text-blue-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    Months
                  </button>
                </div>
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="range"
                  min={loanType === 'years' ? '1' : '6'}
                  max={loanType === 'years' ? '30' : '360'}
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="w-full mt-3"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{loanType === 'years' ? '1 year' : '6 months'}</span>
                  <span>{loanType === 'years' ? '30 years' : '30 years'}</span>
                </div>
              </div>

              {/* Payment Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Payment Frequency
                </label>
                <div className="space-y-2">
                  {paymentFrequencies.map(freq => (
                    <button
                      key={freq.id}
                      onClick={() => setPaymentFrequency(freq.id)}
                      className={`w-full p-3 rounded-lg border-2 text-center transition-all ${
                        paymentFrequency === freq.id
                          ? 'border-green-500 bg-green-100 text-green-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                      }`}
                    >
                      {freq.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={calculateLoan}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Zap size={24} />
                Calculate Loan
              </button>
              <button
                onClick={resetCalculator}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-xl text-center border-2 border-green-200">
                  <DollarSign className="mx-auto text-green-600 mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">{formatCurrency(results.monthlyPayment)}</div>
                  <div className="text-sm text-gray-600">Monthly Payment</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl text-center border-2 border-blue-200">
                  <TrendingUp className="mx-auto text-blue-600 mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">{formatCurrency(results.totalInterest)}</div>
                  <div className="text-sm text-gray-600">Total Interest</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center border-2 border-purple-200">
                  <PieChart className="mx-auto text-purple-600 mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-800">{formatCurrency(results.totalPayment)}</div>
                  <div className="text-sm text-gray-600">Total Payment</div>
                </div>
              </div>

              {/* Amortization Schedule */}
              <div className="bg-white border-2 border-gray-200 rounded-xl">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Amortization Schedule (First 12 Months)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Principal</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Interest</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.amortizationSchedule.map((payment) => (
                        <tr key={payment.month} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">{payment.month}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                            {formatCurrency(payment.payment)}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatCurrency(payment.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons for Results */}
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copied!' : 'Copy Results'}
                </button>
                <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2">
                  <Download size={20} />
                  Export as PDF
                </button>
              </div>
            </div>
          )}

          {/* Loan Presets */}
          <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="text-yellow-600" />
              Quick Loan Presets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {loanPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="p-4 bg-white hover:bg-yellow-100 border border-yellow-200 rounded-lg transition text-center"
                >
                  <div className="font-semibold text-gray-800">{preset.label}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(preset.amount)} • {preset.rate}% • {preset.term} years
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Loan Types */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Loan Types</h3>
            <div className="space-y-3">
              {loanTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.id}
                    className="flex items-center gap-3 p-3 bg-white border border-purple-200 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg bg-${type.color}-500`}>
                      <IconComponent size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{type.name}</div>
                      <div className="text-sm text-gray-600">Learn more</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculation History */}
          {calculationHistory.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <History className="text-blue-600" />
                  Recent Calculations
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
                      <div className="font-semibold text-gray-800">
                        {formatCurrency(item.monthlyPayment)}/mo
                      </div>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(item.loanAmount)} • {item.interestRate}% • {item.loanTerm} {item.loanType}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      Interest: {formatCurrency(item.totalInterest)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loan Tips */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Loan Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Improve Credit Score</div>
                <div className="text-gray-600">Better scores get lower interest rates</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Make Extra Payments</div>
                <div className="text-gray-600">Reduce total interest paid</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Compare Lenders</div>
                <div className="text-gray-600">Shop around for the best rates</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-800 mb-1">Consider Loan Term</div>
                <div className="text-gray-600">Shorter terms = less interest</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          {results && (
            <div className="bg-orange-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Number of Payments</span>
                  <span className="font-semibold text-gray-800">{results.numberOfPayments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Interest to Principal Ratio</span>
                  <span className="font-semibold text-gray-800">
                    {((results.totalInterest / loanAmount) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Cost per $1000</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency((results.totalPayment / loanAmount) * 1000)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Calculation Date</span>
                  <span className="font-semibold text-gray-800 text-xs">{results.calculationDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <Calculator className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Accurate Calculations</div>
          <div className="text-sm text-gray-600">Precise amortization</div>
        </div>
        <div className="text-center p-4">
          <PieChart className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Payment Breakdown</div>
          <div className="text-sm text-gray-600">Principal vs interest</div>
        </div>
        <div className="text-center p-4">
          <History className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Calculation History</div>
          <div className="text-sm text-gray-600">Track your scenarios</div>
        </div>
        <div className="text-center p-4">
          <Download className="mx-auto text-orange-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Export Results</div>
          <div className="text-sm text-gray-600">Save and share</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Loan Calculation Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Even a small decrease in interest rate can save thousands over the loan term</li>
          <li>• Shorter loan terms mean higher monthly payments but less total interest</li>
          <li>• Consider making extra payments to reduce the principal faster</li>
          <li>• Your credit score significantly impacts the interest rate you qualify for</li>
          <li>• Use the amortization schedule to see how payments are applied over time</li>
        </ul>
      </div>
    </div>
  );
};

export default LoanCalculator;