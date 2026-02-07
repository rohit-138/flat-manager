"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Protect route
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalAmount = monthlyExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome, {user?.name}
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
          className="text-sm text-red-600"
        >
          Logout
        </button>
      </div>

      {/* Total Card */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <p className="text-gray-500 text-sm">Total Expenses (This Month)</p>
        <p className="text-3xl font-bold mt-2">₹{totalAmount}</p>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="font-semibold mb-4">Recent Expenses</h2>

        {monthlyExpenses.length === 0 ? (
          <p className="text-gray-500 text-sm">No expenses added yet</p>
        ) : (
          <ul className="space-y-3">
            {monthlyExpenses.slice(0, 5).map((e) => (
              <li
                key={e._id}
                className="flex justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-gray-500">
                    {e.category} • {e.addedBy}
                  </p>
                </div>
                <p className="font-semibold">₹{e.amount}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Expense Button */}
      <button
        onClick={() => router.push("/add-expense")}
        className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-full shadow-lg"
      >
        + Add Expense
      </button>
    </div>
  );
}
