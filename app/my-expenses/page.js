"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showExpenseInfo } from "../../Components/Popups/ExpenseInfoPopup";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MyExpensesPage() {
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");


  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.creation_time) - new Date(a.creation_time);
    }

    if (sortBy === "oldest") {
      return new Date(a.creation_time) - new Date(b.creation_time);
    }

    if (sortBy === "amount-desc") {
      const aAmt = a.splits.find(s => s.payer === user.name)?.amount || 0;
      const bAmt = b.splits.find(s => s.payer === user.name)?.amount || 0;
      return bAmt - aAmt;
    }

    if (sortBy === "amount-asc") {
      const aAmt = a.splits.find(s => s.payer === user.name)?.amount || 0;
      const bAmt = b.splits.find(s => s.payer === user.name)?.amount || 0;
      return aAmt - bAmt;
    }

    return 0;
  });



  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchExpenses = async (u) => {
    setLoading(true);

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const res = await fetch(`/api/expenses?month=${monthStr}`);
    const data = await res.json();

    // 🔑 Filter only expenses where user is part of split
    const myExpenses = (data.expenses || []).filter((e) =>
      e.splits.some((s) => s.payer === u.name)
    );

    setExpenses(myExpenses);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchExpenses(user);
  }, [user, month, year]);

  /* ---------------- MONTH NAV ---------------- */

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else setMonth(m => m - 1);
  };

  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else setMonth(m => m + 1);
  };

  /* ---------------- TOTAL ---------------- */

  const myTotal = expenses.reduce((sum, e) => {
    const mySplit = e.splits.find(s => s.payer === user?.name);
    return sum + (mySplit?.amount || 0);
  }, 0);

  /* ---------------- UI ---------------- */

  if (!user || loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Expenses</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm underline"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-4">
        <button onClick={goPrev}>←</button>
        <div className="font-semibold">
          {MONTHS[month]} {year}
        </div>
        <button onClick={goNext}>→</button>
      </div>

      {/* My Total */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <p className="text-gray-500 text-sm">
          Your share this month
        </p>
        <p className="text-3xl font-bold">₹{Math.round(myTotal)}</p>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Your Expenses</h2>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {sortedExpenses.length} records
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount-desc">Amount ↓</option>
              <option value="amount-asc">Amount ↑</option>
            </select>
          </div>
        </div>

        {expenses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No expenses where you are involved
          </p>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.map((e) => {
              const mySplit = e.splits.find(
                s => s.payer === user.name
              );

              return (
                <div
                  key={e._id}
                  onClick={() => showExpenseInfo(e)}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{e.title}</p>
                    <p className="font-bold">
                      ₹{mySplit?.amount}
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    Created by {e.creator} •{" "}
                    {new Date(e.creation_time).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>


                  <p
                    className={`text-xs mt-1 ${mySplit?.state === "PAID_RECEIVED"
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {mySplit?.state === "PAID_RECEIVED"
                      ? "Paid"
                      : "Pending"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
