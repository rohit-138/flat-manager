import { NextResponse } from "next/server";
import { connectDB} from '../../../lib/monogodb';
import Expense from "../../../models/Expense";
import User from "../../../models/User"
/**
 * Safely parse GPay amounts
 * "₹1,340.00" → 1340
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
 * Get YYYY-MM from ISO date (UTC-safe)
 */
function getExpenseMonth(dateStr) {
  const d = new Date(dateStr);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function POST(req) {
  try {
    const { uploadedBy, data } = await req.json();
 console.log("🔹 Import triggered by:", uploadedBy);
    console.log("🔹 Total records in file:", data?.length);

    if (!uploadedBy || !Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔥 1. Delete all expenses created by this user
    await Expense.deleteMany({ creator: uploadedBy });
   const creatorsInFile = new Set(
      data.map((e) => e.creator)
    );

    console.log(
      "🔹 Unique creators in file:",
      Array.from(creatorsInFile), "\n\n\n\n\n",
      "Creator ---> ", uploadedBy
    );

      const groupFiltered = data.filter(
      (e) => e.group_name === "A2 701"
    );

    console.log(
      "🔹 After group filter:",
      groupFiltered.length
    );
    // 🔍 2. Filter ONLY expenses created by this user
    const expensesToInsert = data
      .filter((e) => e.group_name === "A2 701")
      .filter((e) => e.creator === uploadedBy)
      .map((e) => ({
        title: e.title,
        creator: e.creator,
        group_name: e.group_name,
        creation_time: new Date(e.creation_time),
        total_amount: parseAmount(e.total_amount),
        state: e.state,
        expense_month: getExpenseMonth(e.creation_time),
        source: "GPAY",
        splits: e.items.map((item) => ({
          payer: item.payer,
          amount: parseAmount(item.amount),
          state: item.state,
        })),
      }));
  console.log(
      "✅ Final expenses to insert:",
      expensesToInsert.length
    );
    // ✅ 3. Insert fresh data (if any)
    if (expensesToInsert.length > 0) {
      await Expense.insertMany(expensesToInsert);
    }

    // 🧑 4. Update user's last upload timestamp
    await User.updateOne(
      { name: uploadedBy },
      { last_uploaded_at: new Date() }
    );

    return NextResponse.json({
      message: "Import successful",
      uploadedBy,
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
