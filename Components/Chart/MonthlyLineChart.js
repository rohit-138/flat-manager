"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function MonthlyLineChart({ dataMap, year }) {
  const data = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: `My Expenses (${year})`,
        data: MONTH_LABELS.map((_, i) => dataMap[i] || 0),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.2)",
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="font-semibold mb-3 text-center">
        Month-wise Spend – {year}
      </h3>
      <Line data={data} options={options} />
    </div>
  );
}
