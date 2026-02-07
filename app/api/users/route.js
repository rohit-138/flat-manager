import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/monogodb";
import User from "../../../models/User";

/**
 * GET /api/users
 * Used by dashboard to check upload completeness
 */
export async function GET() {
  try {
    await connectDB();

    const users = await User.find(
      {},
      { name: 1, last_uploaded_at: 1, _id: 0 }
    ).sort({ name: 1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
