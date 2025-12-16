import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import User from "@/models/user";
import { logActivity } from "@/libs/activity";
import { verifyToken } from "@/libs/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 1. Authentication Check
    let token = "";
    const authHeader = request.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = request.cookies.get("token")?.value || "";
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      verifyToken(token);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // 2. Fetch Users
    // .select("-password") excludes the password field
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 1. Authentication Check
    let token = "";
    const authHeader = request.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = request.cookies.get("token")?.value || "";
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      verifyToken(token);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // 2. Validate Request Body
    const body = await request.json();
    const { name, username, password } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. Check for Existing User
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // 4. Create User
    // Password hashing is handled by the model"s pre-save hook
    // Create new user
    const user = new User({ username, password, name });
    await user.save();

    // Log Activity
    await logActivity(
      "User Registration",
      `New user created: ${username}`,
      "Admin", // Ideally we'd get the creator's username, but for now specific Admin context
      "info"
    );

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
