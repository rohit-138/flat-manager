import mongoose from "mongoose";

/**
 * Split schema (GPay-aligned)
 */
const SplitSchema = new mongoose.Schema(
  {
    payer: {
      type: String, // EXACT field from GPay
      required: true,
    },

    amount: {
      type: Number, // parsed from "₹xx.xx"
      required: true,
    },

    state: {
      type: String,
      enum: ["PAID_RECEIVED", "UNPAID", "MARK_AS_PAID"],
      required: true,
    },
  },
  { _id: false }
);

/**
 * Expense schema (GPay-aligned)
 */
const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,

      default: "NA"
    },

    creator: {
      type: String,
      required: true,
    },

    group_name: {
      type: String,
      required: true,
    },

    creation_time: {
      type: Date,
      required: true,
    },

    total_amount: {
      type: Number,
      required: true,
    },

    state: {
      type: String,
      enum: ["ONGOING", "SETTLED", "COMPLETED", "CLOSED"],
      required: true,
    },

    splits: {
      type: [SplitSchema],
      required: true,
    },

    expense_month: {
      type: String, // YYYY-MM
      required: true,
      index: true,
    },

    source: {
      type: String,
      default: "GPAY",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
