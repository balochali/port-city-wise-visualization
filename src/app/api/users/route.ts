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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // 1. Auth Check
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

    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { activeTab, name, username, currentPassword, newPassword } = body;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (activeTab === "profile") {
      if (!name || !username) {
        return NextResponse.json(
          { success: false, message: "Name and Username are required" },
          { status: 400 }
        );
      }

      // Check if username is taken by another user
      if (username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return NextResponse.json(
            { success: false, message: "Username already taken" },
            { status: 400 }
          );
        }
      }

      user.name = name;
      user.username = username;
      await user.save();

      await logActivity(
        "Profile Update",
        `User updated profile: ${username}`,
        user.username,
        "success"
      );

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
      });
    } else if (activeTab === "password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "All password fields are required" },
          { status: 400 }
        );
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password" },
          { status: 400 }
        );
      }

      user.password = newPassword;
      await user.save();

      await logActivity(
        "Password Change",
        "User changed their password",
        user.username,
        "success"
      );

      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid update type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
