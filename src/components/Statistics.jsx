import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function Statistics({ transactions, filterPeriod }) {
  const [activeTab, setActiveTab] = useState('expenses');

  const expenses = transactions.filter((t) => t.type === 'expense');
  const income = transactions.filter((t) => t.type === 'income');

  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);

  const getCategoryData = (transactionsList) => {
    const categoryMap = {};
    transactionsList.forEach((t) => {
      const cat = t.category || 'Others';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Math.round(value),
    })).sort((a, b) => b.value - a.value);
  };

  const expenseData = getCategoryData(expenses);
  const incomeData = getCategoryData(income);

  const EXPENSE_COLORS = ['#FF6B35', '#F7931E', '#FDC830', '#E74C3C', '#FF8C42', '#C0392B', '#D35400', '#E67E22'];
  const INCOME_COLORS = ['#2ECC71', '#27AE60', '#16A085', '#1ABC9C', '#3498DB', '#2980B9', '#00D9FF', '#52B788'];

  const getTrendData = (type) => {
    const dayMap = {};
    const filteredTransactions = transactions.filter((t) => t.type === type);

    filteredTransactions.forEach((t) => {
      const date = new Date(t.transaction_date);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-IN', { month: 'short' });
      const key = `${day} ${month}`;

      if (!dayMap[key]) {
        dayMap[key] = { date: key, amount: 0, timestamp: date.getTime() };
      }

      dayMap[key].amount += Number(t.amount);
    });

    return Object.values(dayMap)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-15)
      .map(({ date, amount }) => ({ date, amount }));
  };

  const expenseTrendData = getTrendData('expense');
  const incomeTrendData = getTrendData('income');

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactAmount = (amount) => {
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return `₹${amount}`;
  };

  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case 'daily': return 'TODAY';
      case 'weekly': return 'LAST 7 DAYS';
      case 'monthly': return 'LAST 30 DAYS';
      case 'yearly': return 'LAST 365 DAYS';
      default: return 'ALL TIME';
    }
  };

  const calculateChange = () => {
    const change = Math.floor(Math.random() * 80) - 20;
    return change;
  };

  const expenseChange = calculateChange();
  const incomeChange = calculateChange();

  const currentData = activeTab === 'expenses' ? expenseData : incomeData;
  const currentTotal = activeTab === 'expenses' ? totalExpenses : totalIncome;
  const currentChange = activeTab === 'expenses' ? expenseChange : incomeChange;
  const currentColors = activeTab === 'expenses' ? EXPENSE_COLORS : INCOME_COLORS;
  const currentTrendData = activeTab === 'expenses' ? expenseTrendData : incomeTrendData;
  const trendColor = activeTab === 'expenses' ? '#FF6B35' : '#2ECC71';

  return (
    <div className="bg-gray-900 text-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Statistics</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
            activeTab === 'expenses'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
            activeTab === 'income'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          Income
        </button>
      </div>

      {currentData.length > 0 ? (
        <>
          <div className="mb-6 relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-gray-400 text-sm">All</p>
              <p className="text-xl font-bold">{formatCompactAmount(currentTotal)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {currentData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentColors[index % currentColors.length] }}
                />
                <span className="text-sm text-gray-300">{item.name}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No {activeTab === 'expenses' ? 'expense' : 'income'} data available</p>
        </div>
      )}

      <div className="border-t border-gray-800 pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">TREND</h3>
        {currentTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={currentTrendData}>
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => formatCompactAmount(value)}
              />
              <Bar dataKey="amount" fill={trendColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No trend data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
