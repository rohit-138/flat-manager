import { NextResponse } from "next/server";
import { connectDB} from '../../../lib/monogodb';
import Expense from "../../../models/Expense";

/**
 * GET /api/expenses?month=YYYY-MM
 * Example: /api/expenses?month=2026-02
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { message: "Month query param is required (YYYY-MM)" },
        { status: 400 }
      );
    }

    await connectDB();

    const expenses = await Expense.find({
      expense_month: month,
    }).sort({ creation_time: -1 });

    return NextResponse.json({
      month,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json(
      { message: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
