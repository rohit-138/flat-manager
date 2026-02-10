import * as XLSX from "xlsx";

// Learn from user's categorizations and store in localStorage
export function learnFromCategorizations(rows) {
    const learnings = JSON.parse(localStorage.getItem("categoryLearnings") || "{}");

    rows.forEach((r) => {
        const title = String(r.title || "").toLowerCase().trim();
        if (title && r.category) {
            learnings[title] = r.category;
        }
    });

    localStorage.setItem("categoryLearnings", JSON.stringify(learnings));
    return Object.keys(learnings).length;
}

// Export rows to Excel
export function exportToExcel(rows, filename = "expenses.xlsx", loggedInUser = null) {
    // Prepare data for Excel
    const data = rows.map((r) => {
        let payerShare = "";

        if (loggedInUser && loggedInUser.name) {
            // Show only the logged-in user's payer share
            const userSplit = r.splits.find((s) => s.payer === loggedInUser.name);
            payerShare = userSplit ? `₹${userSplit.amount}` : "₹0";
        } else {
            // Fallback: show all splits if no user logged in
            payerShare = r.splits
                .map((s) => `${s.payer}: ₹${s.amount}`)
                .join("; ");
        }

        return {
            Date: r.date ? r.date.toLocaleString() : r.creation_time,
            Title: r.title,
            Creator: r.creator,
            "Group Name": r.group_name,
            "Total Amount": r.total_amount,
            Category: r.category,
            Status: r.state,
            Month: r.expense_month,
            "Payer Share": payerShare,
        };
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    // Adjust column widths
    ws["!cols"] = [
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 18 },
        { wch: 12 },
        { wch: 8 },
        { wch: 25 },
    ];

    // Write file
    XLSX.writeFile(wb, filename);
}

// Get learned categorizations from localStorage
export function getLearnedCategorizations() {
    return JSON.parse(localStorage.getItem("categoryLearnings") || "{}");
}

// Clear learned categorizations
export function clearLearnings() {
    localStorage.removeItem("categoryLearnings");
}
