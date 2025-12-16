import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import Activity from "@/models/activity";
import { verifyToken } from "@/libs/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Auth Check
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch recent 10 activities
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);

    // Format for frontend
    // "Just now", "5 mins ago", etc. will be handled by frontend timeago or similar logic,
    // or we send user-friendly relative time if we want to keep frontend simple.
    // For now, sending raw date.

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
