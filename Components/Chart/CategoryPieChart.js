"use client";

import { useEffect, useRef } from "react";
import { Chart as ChartJS, PieController, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(PieController, ArcElement, Tooltip, Legend);

const COLORS = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#C9CBCF",
    "#4BC0C0",
    "#FF9F40",
];

export default function CategoryPieChart({ rows }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!rows || rows.length === 0 || !canvasRef.current) return;

        // Calculate category totals (sum of payer share)
        const categoryTotals = {};
        rows.forEach((row) => {
            const category = row.category || "Misc";
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += row.payer_share || 0;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        // Destroy existing chart if it exists
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext("2d");
        chartRef.current = new ChartJS(ctx, {
            type: "pie",
            data: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: COLORS.slice(0, labels.length),
                        borderColor: "#fff",
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: { size: 12 },
                            padding: 15,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.parsed || 0;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `₹${value.toLocaleString("en-IN")} (${percentage}%)`;
                            },
                        },
                    },
                },
            },
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [rows]);

    if (!rows || rows.length === 0) {
        return <div className="text-center text-slate-500 py-8">No data to display</div>;
    }

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Expense Distribution by Category</h2>
            <div style={{ position: "relative", height: "300px", width: "100%" }}>
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}
