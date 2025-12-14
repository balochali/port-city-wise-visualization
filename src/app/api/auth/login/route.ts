import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import User from "@/models/user";
import { generateToken } from "@/libs/auth";
import { LoginRequest, LoginResponse } from "@/types/types";

// For a real app, you might want to use a validation library like Zod
function validateLoginData(data: LoginRequest): string | null {
  if (!data.email || !data.email.includes("@")) {
    return "Valid email is required";
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

    // Find user by email
    const user = await User.findOne({ email: body.email.toLowerCase() });

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
      email: user.email,
    });

    // Create response with user data
    const response = NextResponse.json<LoginResponse>({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
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
