import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/libs/auth";

export async function GET(request: NextRequest) {
  try {
    let token = "";
    const authHeader = request.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      // Check for token in cookies
      token = request.cookies.get("token")?.value || "";
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    return NextResponse.json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
