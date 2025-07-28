"use client";

import AddTransaction from "./AddTransaction";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#4ade80", "#f87171", "#fbbf24"]; // green, red, yellow

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();

  const fetchFinanceAndTransactions = async (userId) => {
    const { data: finance, error: financeError } = await supabase
      .from("finance")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (financeError) {
      console.error("Error fetching finance data:", financeError.message);
    } else {
      setFinanceData(finance);
    }

    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (txError) {
      console.error("Error fetching transactions:", txError.message);
    } else {
      setTransactions(txData);
    }
  };

  useEffect(() => {
    const getUserAndData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        await fetchFinanceAndTransactions(session.user.id);
      }
    };

    getUserAndData();
  }, [router]);

  if (!user) return null; // or spinner

  // Prepare chart data
  const pieData = financeData
    ? [
        { name: "Income", value: financeData.income || 0 },
        { name: "Expenditures", value: financeData.expenditures || 0 },
        { name: "Savings", value: financeData.savings || 0 },
      ]
    : [];

  const barData = financeData
    ? [
        { name: "Income", amount: financeData.income || 0 },
        { name: "Expenditures", amount: financeData.expenditures || 0 },
      ]
    : [];

  // Build lineData with starting baseline and cumulative updates
  const lineData = (() => {
    if (!financeData) return [];

    const sortedTx = transactions
      ? [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
      : [];

    let cumulativeTotalMoney = (financeData.income || 0) + (financeData.savings || 0);
    let cumulativeExpenditures = financeData.expenditures || 0;

    const data = [];

    // Starting baseline point date (earliest transaction date or today)
    const startDate =
      sortedTx.length > 0 ? new Date(sortedTx[0].date) : new Date();

    data.push({
      date: startDate.toLocaleDateString(),
      totalMoney: cumulativeTotalMoney,
      expenditures: cumulativeExpenditures,
    });

    sortedTx.forEach((tx) => {
      if (tx.amount > 0) {
        cumulativeTotalMoney += tx.amount;
      } else {
        cumulativeExpenditures += Math.abs(tx.amount);
      }

      data.push({
        date: new Date(tx.date).toLocaleDateString(),
        totalMoney: cumulativeTotalMoney,
        expenditures: cumulativeExpenditures,
      });
    });

    return data;
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Navbar */}
      <div className="w-full border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Corey’s Webpage</div>
        <nav className="space-x-6 flex items-center">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/userSetup" className="hover:underline">
            Finance Information
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </nav>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-xl font-bold mb-4 text-left">Welcome, {user.email}</h1>

        {financeData ? (
          <>
            <h2 className="text-xl font-bold mb-4">Your Finance Overview</h2>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                  Income
                </h3>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  £{financeData.income}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                  Expenditures
                </h3>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  £{financeData.expenditures}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                  Savings
                </h3>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  £{financeData.savings}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
              {/* Pie Chart */}
              <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Income vs Expenditures vs Savings
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Income vs Expenditures
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#4ade80" name="Amount (£)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Add Transaction and Line Chart side by side */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Add Transaction Form */}
              <div>
                <AddTransaction
                  userId={user.id}
                  onTransactionAdded={() => fetchFinanceAndTransactions(user.id)}
                />
              </div>

              {/* Line Chart */}
              <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-center">
                  Total Money vs Expenditures Over Time
                </h2>
                {lineData.length === 0 ? (
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No data available for chart.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={lineData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                      <Line
                        type="monotone"
                        dataKey="totalMoney"
                        stroke="#4ade80"
                        name="Total Money (£)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenditures"
                        stroke="#f87171"
                        name="Expenditures (£)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Transactions List below */}
            <div className="mt-10 max-w-5xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              {transactions.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400">
                  No transactions found.
                </p>
              ) : (
                <ul className="divide-y divide-neutral-300 dark:divide-neutral-700 max-w-xl">
                  {transactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{tx.description}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {tx.category} • {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p
                        className={`font-bold ${
                          tx.amount >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        £{tx.amount.toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            No finance data found.
          </p>
        )}
      </div>
    </div>
  );
}
