"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PieChart from "../../Components/Chart/PieChart";
import { showExpenseInfo } from "../../Components/Popups/ExpenseInfoPopup";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function DashboardPage() {
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const res = await fetch(`/api/expenses?month=${monthStr}`);
    const data = await res.json();
    setExpenses(data.expenses || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [month, year]);

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

  const totalAmount = expenses.reduce(
    (sum, e) => sum + e.total_amount,
    0
  );

  // 🔥 Flatmate-wise aggregation from splits
  const flatmateMap = {};
  expenses.forEach(e => {
    e.splits.forEach(s => {
      flatmateMap[s.payer] =
        (flatmateMap[s.payer] || 0) + s.amount;
    });
  });

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => router.push("/import")}
          className="text-sm bg-black text-white px-4 py-2 rounded"
        >
          Import GPay Data
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-4">
        <button onClick={goPrev}>←</button>
        <div className="font-semibold">
          {MONTHS[month]} {year}
        </div>
        <button onClick={goNext}>→</button>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <p className="text-gray-500 text-sm">Total Expenses</p>
        <p className="text-3xl font-bold">₹{totalAmount}</p>
      </div>


      <div className="md:flex gap-4 h-[500px]">


        {/* Chart */}
        <div className="bg-white rounded-xl p-4 shadow mb-6 h-[500px]">
          <PieChart
            title="Expense Share (Flatmate-wise)"
            dataMap={flatmateMap}
          />
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-xl p-4 shadow w-full max-h-[500px] flex flex-col">
  <div className="flex justify-between mb-3">
    <h2 className="font-semibold">Expenses</h2>
    <span className="text-xs text-gray-500">
      {expenses.length} records
    </span>
  </div>

  {expenses.length === 0 ? (
    <p className="text-sm text-gray-500">No data</p>
  ) : (
    <div className="space-y-3 overflow-y-auto pr-1">
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
    </div>
  );
}
