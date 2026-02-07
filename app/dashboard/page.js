"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PieChart from "../../Components/Chart/PieChart";
import { showExpenseInfo } from "../../Components/Popups/ExpenseInfoPopup";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function DashboardPage() {
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------ FETCH DATA ------------------ */
const [user, setUser] = useState(null);
 
  // Protect route
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

    const [expRes, userRes] = await Promise.all([
      fetch(`/api/expenses?month=${monthStr}`),
      fetch(`/api/users`)
    ]);

    const expData = await expRes.json();
    const userData = await userRes.json();

    setExpenses(expData.expenses || []);
    setUsers(userData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  /* ------------------ MONTH NAV ------------------ */

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

  /* ------------------ TOTAL ------------------ */

  const totalAmount = expenses.reduce(
    (sum, e) => sum + e.total_amount,
    0
  );

  /* ------------------ FLATMATE SHARE ------------------ */

  const flatmateMap = {};
  expenses.forEach(e => {
    e.splits.forEach(s => {
      flatmateMap[s.payer] =
        (flatmateMap[s.payer] || 0) + s.amount;
    });
  });

  /* ------------------ COMPLETENESS ------------------ */

  const lastDayOfMonth = new Date(
    year,
    month + 1,
    0,
    23,
    59,
    59
  );

  const completeness = users.map(u => ({
    name: u.name,
    completed:
      u.last_uploaded_at &&
      new Date(u.last_uploaded_at) > lastDayOfMonth
  }));

  /* ------------------ UI ------------------ */

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome, {user?.name}
          </p>
        </div>
        <button
          onClick={() => router.push("/import")}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Import GPay Data
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

      {/* Completeness */}
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <p className="text-sm font-medium mb-2">
          Data completion status
        </p>
        <div className="flex flex-wrap gap-2">
          {completeness.map(c => (
            <span
              key={c.name}
              className={`px-3 py-1 rounded-full text-sm ${
                c.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <p className="text-gray-500 text-sm">Total Expenses</p>
        <p className="text-3xl font-bold">₹{totalAmount}</p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <PieChart
          title="Expense Share (Flatmate-wise)"
          dataMap={flatmateMap}
        />
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">Expenses</h2>
          <span className="text-xs text-gray-500">
            {expenses.length} records
          </span>
        </div>

        {expenses.length === 0 ? (
          <p className="text-sm text-gray-500">No data</p>
        ) : (
          <div className="space-y-3">
            {expenses.map(e => (
              <div
                key={e._id}
                onClick={() => showExpenseInfo(e)}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex justify-between">
                  <p className="font-medium">{e.title}</p>
                  <p className="font-bold">₹{e.total_amount}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Created by {e.creator}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
