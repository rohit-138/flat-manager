import { NextResponse } from "next/server";
import { connectDB} from '../../../lib/monogodb';
import Expense from "../../../models/Expense";

/**
 * Helper: parse "₹340.00" → 340
 */
function parseAmount(amountStr) {
  if (!amountStr) return 0;

  const cleaned = amountStr
    .toString()
    .replace("₹", "")
    .replace(/,/g, "")
    .trim();

  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper: get YYYY-MM from ISO date
 */
function getExpenseMonth(dateStr) {
  const d = new Date(dateStr);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function POST(req) {
  try {
    const { month, data } = await req.json();

    if (!month || !Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }
    console.log("🔥🔥🔥🔥🔥 --> Data ---> ", {data})

    await connectDB();

    // 🔥 Step 1: Remove existing data for this month
    await Expense.deleteMany({ expense_month: month });

    // 🔍 Step 2: Filter & transform GPay data
    const expensesToInsert = data
      .filter((e) => e.group_name === "A2 701")
      .filter((e) => getExpenseMonth(e.creation_time) === month)
      .map((e) => ({
        title: e.title,
        creator: e.creator,
        group_name: e.group_name,
        creation_time: new Date(e.creation_time),
        total_amount: parseAmount(e.total_amount),
        state: e.state,
        expense_month: month,
        source: "GPAY",
        splits: e.items.map((item) => ({
          payer: item.payer,
          amount: parseAmount(item.amount),
          state: item.state,
        })),
      }));

    // ✅ Step 3: Insert (even if empty)
    if (expensesToInsert.length > 0) {
      await Expense.insertMany(expensesToInsert);
    }

    return NextResponse.json({
      message: "Import successful",
      month,
      inserted: expensesToInsert.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { message: "Import failed" },
      { status: 500 }
    );
  }
}
