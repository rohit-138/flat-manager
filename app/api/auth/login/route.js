import { NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/monogodb";

export async function POST(req) {
  try {
    const { mobile, password } = await req.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { message: "Mobile number and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ mobile });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid mobile number or password" },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid mobile number or password" },
        { status: 401 }
      );
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        mobile: user.mobile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
