import { NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { connectDB } from "../../../../lib/monogodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const mobile = String(body.mobile || "").trim();
    const password = String(body.password || "");

    if (!mobile || !password) {
      return NextResponse.json(
        { message: "Mobile number and password are required" },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    await connectDB();

    const user = await User.findOne({ mobile });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid mobile number or password" },
        { status: 401 }
      );
    }

    // ✅ Plain-text password comparison (NO bcrypt)
    const isMatch = user.password === password;

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid mobile number or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        mobile: user.mobile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
      },
    });

    // ✅ HttpOnly cookie (recommended)
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
