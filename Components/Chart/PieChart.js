"use client";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ title, dataMap }) {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#f97316",
          "#ef4444",
          "#14b8a6",
        ],
      },
    ],
  };

  return (
    <div className="max-w-sm mx-auto">
      <h3 className="text-center font-medium mb-2">{title}</h3>
      <Pie data={data} />
    </div>
  );
}
