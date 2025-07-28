"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function UserSetup() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Finance fields:
  const [income, setIncome] = useState("");
  const [expenditures, setExpenditures] = useState("");
  const [savings, setSavings] = useState("");

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }
      setSession(session);

      // Fetch existing finance data if exists
      const { data, error } = await supabase
        .from("finance")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) {
        setIncome(data.income || "");
        setExpenditures(data.expenditures || "");
        setSavings(data.savings || "");
      }
    };

    fetchSessionAndData();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from("finance")
      .upsert(
        {
          user_id: session.user.id,
          income: parseFloat(income),
          expenditures: parseFloat(expenditures),
          savings: parseFloat(savings),
        },
        { onConflict: "user_id" } // <-- This is the key fix
      );

    if (error) {
      console.error("Upsert error:", error);
      alert("Oops, something went wrong.");
    } else {
      setSuccess(true);
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Navbar */}
      <div className="w-full border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Corey’s Webpage</div>
        <nav className="space-x-6 flex items-center">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {session && (
            <>
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
            </>
          )}
          {!session && (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/login/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto mt-12 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Set Up Your Finance Information
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Monthly Income (£)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Monthly Expenditures (£)
            </label>
            <input
              type="number"
              value={expenditures}
              onChange={(e) => setExpenditures(e.target.value)}
              required
              className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Savings (£)</label>
            <input
              type="number"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700"
              step="0.01"
              min="0"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Submit"}
          </button>

          {success && (
            <p className="text-green-500 mt-2 text-center text-sm">
              Saved! Redirecting to dashboard...
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
