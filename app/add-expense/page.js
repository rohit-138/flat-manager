"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Rent",
  "Grocery",
  "Electricity",
  "Milk",
  "Internet",
  "Other",
];

export default function AddExpensePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Grocery");
  const [loading, setLoading] = useState(false);

  // Protect route
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          date,
          category,
          addedBy: user.name,
        }),
      });

      if (!res.ok) {
        alert("Failed to add expense");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 mr-3"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">Add Expense</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 shadow max-w-md mx-auto"
      >
        <div className="mb-4">
          <label className="block text-sm mb-1">Expense Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Grocery / Rent / Milk"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="0"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
