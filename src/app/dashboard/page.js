"use client";

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
} from "recharts";

const COLORS = ["#4ade80", "#f87171", "#fbbf24"]; // green, red, yellow (tailwind colors)

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUserAndFinance = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);

        const { data, error } = await supabase
          .from("finance")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching finance data:", error.message);
        } else {
          setFinanceData(data);
        }
      }
    };

    getUserAndFinance();
  }, [router]);

  if (!user) {
    return null; // or loading spinner
  }

  // Prepare data for charts
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
        <h1 className="text-xl font-bold text-center mb-4"> Welcome, {user.email}</h1>

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

            {/* Charts container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Pie chart */}
              <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-center">Income vs Expenditures vs Savings</h3>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 text-center">Income vs Expenditures</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
          </>
        ) : (
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">No finance data found.</p>
        )}
      </div>
    </div>
  );
}
