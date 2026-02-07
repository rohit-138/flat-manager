"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FLATMATES = [
  { name: "Krushna" },
  { name: "Pranav" },
  { name: "Rohit" },
  { name: "Utkarsh" },
  { name: "Sameer" },
];

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

  // 🔥 GPay-style state
  const [selectedUsers, setSelectedUsers] = useState(
    FLATMATES.map((f) => ({ name: f.name, amount: 0 }))
  );
  const [splitMode, setSplitMode] = useState("equal"); // equal | custom
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) router.push("/login");
    else setUser(JSON.parse(storedUser));
  }, []);

  // 🔄 Auto equal split
  useEffect(() => {
    if (splitMode !== "equal" || !amount) return;

    const perHead = Math.floor(amount / selectedUsers.length);
    let updated = selectedUsers.map((u) => ({
      ...u,
      amount: perHead,
    }));

    const diff =
      amount - updated.reduce((s, u) => s + u.amount, 0);
    if (diff > 0) updated[0].amount += diff;

    setSelectedUsers(updated);
  }, [amount, splitMode]);

  const toggleUser = (name) => {
    let updated = selectedUsers.filter((u) => u.name !== name);
    if (updated.length === selectedUsers.length) {
      updated = [...selectedUsers, { name, amount: 0 }];
    }
    setSelectedUsers(updated);
  };

  const updateAmount = (name, value) => {
    setSplitMode("custom");
    setSelectedUsers((prev) =>
      prev.map((u) =>
        u.name === name ? { ...u, amount: Number(value) } : u
      )
    );
  };

  const splitTotal = selectedUsers.reduce(
    (s, u) => s + u.amount,
    0
  );
  const remaining = amount - splitTotal;
  const isValid = remaining === 0 && selectedUsers.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    const splits = selectedUsers.map((u) => ({
      user: u.name,
      amount: u.amount,
    }));

    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        date,
        category,
        addedBy: user.name,
        splits,
      }),
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">Add Expense</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow max-w-lg mx-auto"
      >
        <input
          className="w-full border px-3 py-2 mb-3"
          placeholder="Expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          className="w-full border px-3 py-2 mb-3"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />

        <input
          type="date"
          className="w-full border px-3 py-2 mb-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <select
          className="w-full border px-3 py-2 mb-4"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* 👥 Select people */}
        <p className="font-medium mb-2">Split between</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {FLATMATES.map((f) => {
            const active = selectedUsers.some(
              (u) => u.name === f.name
            );
            return (
              <button
                type="button"
                key={f.name}
                onClick={() => toggleUser(f.name)}
                className={`px-3 py-1 rounded-full text-sm ${
                  active
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                {f.name}
              </button>
            );
          })}
        </div>

        {/* 🔁 Split mode */}
        <div className="flex gap-4 mb-3 text-sm">
          <label>
            <input
              type="radio"
              checked={splitMode === "equal"}
              onChange={() => setSplitMode("equal")}
            />{" "}
            Equal
          </label>
          <label>
            <input
              type="radio"
              checked={splitMode === "custom"}
              onChange={() => setSplitMode("custom")}
            />{" "}
            Custom
          </label>
        </div>

        {/* ✏️ Custom amounts */}
        {splitMode === "custom" &&
          selectedUsers.map((u) => (
            <div
              key={u.name}
              className="flex justify-between items-center mb-2"
            >
              <span>{u.name}</span>
              <input
                type="number"
                className="border px-2 py-1 w-24"
                value={u.amount}
                onChange={(e) =>
                  updateAmount(u.name, e.target.value)
                }
              />
            </div>
          ))}

        {/* ✅ Validation */}
        <p
          className={`text-sm mb-4 ${
            remaining === 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {remaining === 0
            ? "All settled"
            : `Remaining: ₹${remaining}`}
        </p>

        <button
          disabled={!isValid || loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
