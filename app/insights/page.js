"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { categorizeTitle, getCategoryList } from "../../lib/categoryRules";
import { exportToExcel, learnFromCategorizations } from "../../lib/exportUtils";
import CategoryPieChart from "../../Components/Chart/CategoryPieChart";
import Swal from "sweetalert2";

export default function InsightsImportPage() {
    const [fileName, setFileName] = useState("");
    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [filterPayer, setFilterPayer] = useState("rohit khalate");
    const [creatorFilter, setCreatorFilter] = useState("");
    const [amountSort, setAmountSort] = useState("none"); // none | asc | desc
    const [statusFilters, setStatusFilters] = useState(new Set());
    const [monthFilter, setMonthFilter] = useState("");
    const [categoryEdits, setCategoryEdits] = useState({}); // Map of row index to edited category

    const categoryList = getCategoryList();

    // Get logged-in user from localStorage
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setLoggedInUser(user);
                // Auto-set filterPayer to logged-in user's name
                if (user.name) {
                    setFilterPayer(user.name);
                }
            } catch (err) {
                console.error("Failed to parse user from localStorage", err);
            }
        }
    }, []);

    function parseAmount(str) {
        if (str == null) return 0;
        const cleaned = String(str).replace(/₹/g, "").replace(/,/g, "").trim();
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : 0;
    }

    function monthFrom(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return "";
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        return `${y}-${m}`;
    }

    // Format number in Indian numbering system with two decimals
    function formatINR(x) {
        const n = Number(x) || 0;
        const parts = n.toFixed(2).split('.');
        let intPart = parts[0];
        const dec = parts[1];
        if (intPart.length > 3) {
            const lastThree = intPart.slice(-3);
            const rest = intPart.slice(0, -3);
            intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
        }
        return intPart + '.' + dec;
    }

    async function processFileObject(f) {
        setError("");
        if (!f) return;
        setFileName(f.name);

        try {
            const text = await f.text();
            const data = JSON.parse(text);

            // Support two common shapes: array-of-records or object with Group_expenses
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data.Group_expenses)
                    ? data.Group_expenses
                    : [];

            if (list.length === 0) {
                setError("No expense records found in file.");
                setRows([]);
                return;
            }

            // Transform and filter to records where filterPayer participates
            const out = [];
            for (const rec of list) {
                const splits = Array.isArray(rec.items) ? rec.items : [];
                const participates = splits.some((s) =>
                    String(s.payer || "").toLowerCase() === filterPayer.toLowerCase()
                );
                if (!participates) continue;

                out.push({
                    creation_time: rec.creation_time || "",
                    date: rec.creation_time ? new Date(rec.creation_time) : null,
                    title: rec.title || "",
                    creator: rec.creator || "",
                    group_name: rec.group_name || "",
                    total_amount: parseAmount(rec.total_amount),
                    state: rec.state || "",
                    expense_month: monthFrom(rec.creation_time),
                    splits: splits.map((s) => ({
                        payer: s.payer || "",
                        amount: parseAmount(s.amount),
                        state: s.state || "",
                    })),
                    category: categorizeTitle(rec.title || ""),
                });
            }

            setRows(out);
        } catch (err) {
            console.error(err);
            setError("Failed to read or parse JSON file. Make sure it's valid JSON.");
            setRows([]);
        }
    }

    const handleFile = async (eOrFile) => {
        // If called from input change event
        if (eOrFile && eOrFile.target && eOrFile.target.files) {
            const f = eOrFile.target.files[0];
            await processFileObject(f);
            return;
        }

        // If called with a File object (from drop)
        if (eOrFile instanceof File) {
            await processFileObject(eOrFile);
            return;
        }
    };

    // derive available months and statuses
    const availableMonths = Array.from(
        new Set(rows.map((r) => r.expense_month).filter(Boolean))
    ).sort();

    const STATUS_CATS = ["ONGOING", "SETTLED", "COMPLETED", "CLOSED"];

    const toggleStatus = (s) => {
        setStatusFilters((prev) => {
            const next = new Set(prev);
            if (next.has(s)) next.delete(s);
            else next.add(s);
            return next;
        });
    };

    const updateCategory = (rowIndex, newCategory) => {
        setCategoryEdits((prev) => ({
            ...prev,
            [rowIndex]: newCategory,
        }));
    };

    const handleExport = async () => {
        // Build rows with applied category edits
        const rowsToExport = filteredRows.map((r, i) => ({
            ...r,
            category: categoryEdits[i] !== undefined ? categoryEdits[i] : r.category,
        }));

        // Ask if user wants to save learned categories
        const result = await Swal.fire({
            title: "Export to Excel",
            text: `Export ${rowsToExport.length} records. Save category learnings for future categorizations?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, save & export",
            cancelButtonText: "Just export",
        });

        if (result.dismiss) {
            // User clicked "Just export"
            exportToExcel(rowsToExport, "expenses.xlsx", loggedInUser);
            Swal.fire("Exported!", "File downloaded without saving learnings.", "success");
            return;
        }

        if (result.isConfirmed) {
            // Learn from categorizations
            const count = learnFromCategorizations(rowsToExport);
            exportToExcel(rowsToExport, "expenses.xlsx", loggedInUser);
            Swal.fire(
                "Exported & Learned!",
                `Saved ${count} category learnings. Future similar titles will use these categorizations.`,
                "success"
            );
        }
    };

    const clearFilters = () => {
        setCreatorFilter("");
        setAmountSort("none");
        setStatusFilters(new Set());
        setMonthFilter("");
        setFilterPayer("rohit khalate");
    };

    const filteredRows = rows
        .filter((r) => {
            if (creatorFilter && !r.creator.toLowerCase().includes(creatorFilter.toLowerCase())) return false;
            if (monthFilter && r.expense_month !== monthFilter) return false;
            if (statusFilters.size > 0 && !statusFilters.has(r.state)) return false;
            return true;
        })
        .sort((a, b) => {
            if (amountSort === "asc") return a.total_amount - b.total_amount;
            if (amountSort === "desc") return b.total_amount - a.total_amount;
            return 0;
        });

    const stats = useMemo(() => {
        const count = filteredRows.length;

        // Sum only the filtered payer's share across visible rows
        const payerTotal = filteredRows.reduce((sum, r) => {
            const ps = r.splits.find((s) => s.payer.toLowerCase() === filterPayer.toLowerCase());
            return sum + (ps ? ps.amount : 0);
        }, 0);

        const avg = count > 0 ? payerTotal / count : 0;
        const payers = new Set();
        filteredRows.forEach((r) => r.splits.forEach((s) => payers.add(s.payer)));
        return {
            total: payerTotal,
            count,
            avg,
            uniquePayers: payers.size,
        };
    }, [filteredRows, filterPayer]);

    // Prepare data for pie chart (filtered rows with payer share calculated)
    const pieChartData = useMemo(() => {
        return filteredRows.map((r) => {
            const ps = r.splits.find((s) => s.payer.toLowerCase() === filterPayer.toLowerCase());
            return {
                ...r,
                payer_share: ps ? ps.amount : 0,
            };
        });
    }, [filteredRows, filterPayer]);

    return (
        <div className="min-h-screen p-6 bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Import & Preview Expenses</h1>
                    {loggedInUser && (
                        <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded shadow">
                            <span className="font-medium">Logged in as:</span> {loggedInUser.name}
                        </div>
                    )}
                </div>

                <div className="bg-white p-4 rounded shadow mb-6">
                    <label className="block text-sm font-medium mb-2">Filter payer (show only expenses where this person is listed as a payer)</label>
                    <input
                        value={filterPayer}
                        onChange={(e) => setFilterPayer(e.target.value)}
                        className="w-full border px-3 py-2 rounded mb-3"
                        placeholder="e.g. rohit khalate"
                    />

                    <label className="block text-sm font-medium mb-2">Upload GPay JSON export</label>

                    <input
                        ref={null}
                        id="file-input"
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFile}
                        className="hidden"
                    />

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const f = e.dataTransfer?.files?.[0];
                            if (f) handleFile(f);
                        }}
                        onClick={() => document.getElementById("file-input").click()}
                        className="w-full border-2 border-dashed border-indigo-300 rounded-lg py-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition mb-2 bg-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a3 3 0 013-3h4a3 3 0 013 3v4M7 16l1.5 2m0 0L7 20m1.5-2h7" />
                        </svg>
                        <div className="text-sm text-slate-700">Drop JSON file here, or click to browse</div>
                        <div className="text-xs text-slate-400 mt-1">Accepted: .json (Google Takeout export)</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => document.getElementById("file-input").click()}
                            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                        >
                            Choose file
                        </button>
                        {fileName && <div className="text-sm text-green-600">Loaded: {fileName}</div>}
                    </div>
                    {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
                    <div className="text-sm text-slate-600">This works fully offline in the browser.</div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-3">Expenses ({rows.length})</h2>

                    {/* Filters */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-slate-600">Creator</label>
                            <input
                                value={creatorFilter}
                                onChange={(e) => setCreatorFilter(e.target.value)}
                                placeholder="Filter by creator"
                                className="w-full border px-2 py-1 rounded"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-600">Amount</label>
                            <select
                                value={amountSort}
                                onChange={(e) => setAmountSort(e.target.value)}
                                className="w-full border px-2 py-1 rounded"
                            >
                                <option value="none">None</option>
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-600">Month</label>
                            <select
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className="w-full border px-2 py-1 rounded"
                            >
                                <option value="">All months</option>
                                {availableMonths.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-600">Status</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {STATUS_CATS.map((s) => (
                                    <label key={s} className="inline-flex items-center text-sm">
                                        <input
                                            type="checkbox"
                                            checked={statusFilters.has(s)}
                                            onChange={() => toggleStatus(s)}
                                            className="mr-2"
                                        />
                                        {s}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-slate-50 p-3 rounded">
                                <div className="text-xs text-slate-500">Total (filtered)</div>
                                <div className="text-lg font-semibold">₹{formatINR(stats.total)}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <div className="text-xs text-slate-500">Records</div>
                                <div className="text-lg font-semibold">{stats.count}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <div className="text-xs text-slate-500">Avg / Record</div>
                                <div className="text-lg font-semibold">₹{formatINR(stats.avg)}</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded">
                                <div className="text-xs text-slate-500">Unique Payers</div>
                                <div className="text-lg font-semibold">{stats.uniquePayers}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button onClick={clearFilters} className="text-sm text-gray-600 underline">Clear filters</button>
                            <button
                                onClick={handleExport}
                                disabled={filteredRows.length === 0}
                                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                📥 Export to Excel
                            </button>
                            <div className="text-sm text-slate-500">Showing {filteredRows.length} of {rows.length}</div>
                        </div>
                    </div>

                    <CategoryPieChart rows={pieChartData} />

                    {filteredRows.length === 0 ? (
                        <p className="text-sm text-slate-500">No records to show — adjust filters or upload a different file.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-2 text-left">Date</th>
                                        <th className="p-2 text-left">Title</th>
                                        <th className="p-2 text-left">Creator</th>
                                        <th className="p-2 text-right">Amount</th>
                                        <th className="p-2 text-left">Payer Share (filter)</th>
                                        <th className="p-2 text-left">Status</th>
                                        <th className="p-2 text-left">Category</th>
                                        <th className="p-2 text-left">Month</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((r, i) => {
                                        const payerSplit = r.splits.find((s) =>
                                            s.payer.toLowerCase() === filterPayer.toLowerCase()
                                        );
                                        const displayCategory = categoryEdits[i] !== undefined ? categoryEdits[i] : r.category;
                                        return (
                                            <tr key={i} className="border-b hover:bg-slate-50">
                                                <td className="p-2">{r.date ? r.date.toLocaleString() : r.creation_time}</td>
                                                <td className="p-2">{r.title}</td>
                                                <td className="p-2">{r.creator}</td>
                                                <td className="p-2 text-right">₹{formatINR(r.total_amount)}</td>
                                                <td className="p-2">{payerSplit ? `₹${formatINR(payerSplit.amount)}` : "-"}</td>
                                                <td className="p-2">{r.state}</td>
                                                <td className="p-2">
                                                    <select
                                                        value={displayCategory}
                                                        onChange={(e) => updateCategory(i, e.target.value)}
                                                        className="border rounded px-2 py-1 text-sm"
                                                    >
                                                        {categoryList.map((cat) => (
                                                            <option key={cat} value={cat}>
                                                                {cat}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">{r.expense_month}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
