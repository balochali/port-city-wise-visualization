import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import PortData from "@/models/portData";
import { verifyToken } from "@/libs/auth";

// GET: Fetch all port data or specific city
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Optional: Filter by city using query params
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");

    let ports;
    if (city) {
      // Fetch specific city
      ports = await PortData.findOne({ city: city.toUpperCase() });
      if (!ports) {
        return NextResponse.json(
          { success: false, message: "City not found" },
          { status: 404 }
        );
      }
    } else {
      // Fetch all ports
      ports = await PortData.find({}).sort({ city: 1 });
    }

    return NextResponse.json({
      success: true,
      data: ports,
    });
  } catch (error) {
    console.error("Error fetching port data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create or Update port data (Protected)
export async function POST(request: NextRequest) {
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

    try {
      verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // 2. Process Body
    const body = await request.json();
    const { city, agents } = body;

    if (!city || !Array.isArray(agents)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid data format. Required: city (string) and agents (array)",
        },
        { status: 400 }
      );
    }

    // 3. Validate agents structure
    for (const agent of agents) {
      if (!agent.agent || typeof agent.total !== "number") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each agent must have 'agent' (string) and 'total' (number)",
          },
          { status: 400 }
        );
      }
    }

    // 4. Upsert (Update if exists, Insert if new)
    const updatedPort = await PortData.findOneAndUpdate(
      { city: city.toUpperCase() },
      {
        city: city.toUpperCase(),
        agents,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Port data saved successfully",
      data: updatedPort,
    });
  } catch (error) {
    console.error("Error saving port data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update specific agent in a city (Protected)
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

    try {
      verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // 2. Process Body
    const body = await request.json();
    const { city, agentName, updates } = body;

    if (!city || !agentName || !updates) {
      return NextResponse.json(
        {
          success: false,
          message: "Required: city, agentName, and updates object",
        },
        { status: 400 }
      );
    }

    // 3. Find and update specific agent
    const port = await PortData.findOne({ city: city.toUpperCase() });

    if (!port) {
      return NextResponse.json(
        { success: false, message: "City not found" },
        { status: 404 }
      );
    }

    const agentIndex = port.agents.findIndex((a: any) => a.agent === agentName);

    if (agentIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Agent not found in this city" },
        { status: 404 }
      );
    }

    // Update agent data
    Object.assign(port.agents[agentIndex], updates);
    await port.save();

    return NextResponse.json({
      success: true,
      message: "Agent data updated successfully",
      data: port,
    });
  } catch (error) {
    console.error("Error updating agent data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a city or specific agent (Protected)
export async function DELETE(request: NextRequest) {
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

    try {
      verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // 2. Process Query Params
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const agentName = searchParams.get("agent");

    if (!city) {
      return NextResponse.json(
        { success: false, message: "City parameter is required" },
        { status: 400 }
      );
    }

    if (agentName) {
      // Delete specific agent
      const result = await PortData.updateOne(
        { city: city.toUpperCase() },
        { $pull: { agents: { agent: agentName } } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { success: false, message: "Agent not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Agent deleted successfully",
      });
    } else {
      // Delete entire city
      const result = await PortData.deleteOne({ city: city.toUpperCase() });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { success: false, message: "City not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "City deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
