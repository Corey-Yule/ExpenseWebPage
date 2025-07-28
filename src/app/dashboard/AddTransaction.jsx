"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AddTransaction({ userId, onTransactionAdded }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Savings");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive number for amount.");
      setLoading(false);
      return;
    }

    const newTransaction = {
      user_id: userId,
      description,
      amount: parsedAmount,
      category,
      date: new Date().toISOString(),
    };

    try {
      // Insert transaction
      const { error: insertError } = await supabase
        .from("transactions")
        .insert([newTransaction]);

      if (insertError) {
        console.error("Transaction insert error:", insertError);
        alert("Failed to add transaction.");
        setLoading(false);
        return;
      }

      // Fetch current finance values
      const { data: financeData, error: fetchError } = await supabase
        .from("finance")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("Finance fetch error:", fetchError);
        alert("Failed to fetch finance data.");
        setLoading(false);
        return;
      }

      let updatedFields = {};
      if (category === "Savings") {
        updatedFields.savings = (financeData?.savings || 0) + parsedAmount;
      } else if (category === "Expenditure") {
        updatedFields.expenditures = (financeData?.expenditures || 0) + parsedAmount;
      }

      const { error: updateError } = await supabase
        .from("finance")
        .update(updatedFields)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Finance update error:", updateError);
        alert("Failed to update finance totals.");
      }

      // Reset
      setDescription("");
      setAmount("");
      setCategory("Savings");

      if (onTransactionAdded) onTransactionAdded();

    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Unexpected error occurred.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow max-w-xl mx-auto mb-10">
      <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
            placeholder="e.g. Sold bike, Fuel cost"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Amount (£)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
            placeholder="e.g. 100"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
          >
            <option value="Savings">Savings</option>
            <option value="Expenditure">Expenditure</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}
