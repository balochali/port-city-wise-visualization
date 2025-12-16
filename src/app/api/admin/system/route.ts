import { NextResponse } from "next/server";
import mongoose from "mongoose";
import packageJson from "@/../package.json"; // Adjust path if needed

export async function GET() {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    // Calculate uptime in human readable format
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    let uptimeString = "";
    if (days > 0) uptimeString += `${days} days `;
    if (hours > 0) uptimeString += `${hours}h `;
    uptimeString += `${minutes}m`;

    return NextResponse.json({
      success: true,
      data: {
        status: "Operational",
        database: dbStatus,
        uptime: uptimeString,
        version: `v${packageJson.version}`,
        lastBackup: "Automated daily", // Placeholder as discussed
      },
    });
  } catch (error) {
    console.error("Error fetching system info:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
