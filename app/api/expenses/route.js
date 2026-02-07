import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/monogodb";

// Simple Expense schema (v1)
const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Expense =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

// GET → fetch all expenses
export async function GET() {
  try {
    await connectDB();
    const expenses = await Expense.find().sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST → add new expense
export async function POST(req) {
  try {
    const body = await req.json();
    await connectDB();

    const expense = await Expense.create(body);

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add expense" },
      { status: 500 }
    );
  }
}
