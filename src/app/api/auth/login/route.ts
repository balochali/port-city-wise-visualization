import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import User from "@/models/user";
import { generateToken } from "@/libs/auth";
import { LoginRequest, LoginResponse } from "@/types/types";
import { logActivity } from "@/libs/activity";

// For a real app, you might want to use a validation library like Zod
function validateLoginData(data: LoginRequest): string | null {
  if (!data.username) {
    return "Username is required";
  }

  if (!data.password || data.password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body: LoginRequest = await request.json();

    // Validate input
    const validationError = validateLoginData(body);
    if (validationError) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await User.findOne({ username: body.username.toLowerCase() });

    if (!user) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(body.password);

    if (!isPasswordValid) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
    });

    // Log Activity
    await logActivity(
      "User Login",
      "User logged in successfully",
      user.username,
      "success"
    );

    // Create response with user data
    const response = NextResponse.json<LoginResponse>({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
      },
    });

    // Set httpOnly cookie for secure authentication
    response.cookies.set("token", token, {
      httpOnly: true, // Cannot be accessed by client-side JavaScript
      secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
      sameSite: "lax", // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/", // Cookie available for all routes
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json<LoginResponse>(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
