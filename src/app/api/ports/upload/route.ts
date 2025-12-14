import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
import PortData from "@/models/portData";
import * as XLSX from "xlsx";
import { verifyToken } from "@/libs/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Authentication Check
    let token = "";
    const authHeader = req.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.get("token")?.value || "";
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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Use header: 1 to get an array of arrays
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    let currentCity = "";
    let processedCities = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const firstCell = row[0]?.toString()?.trim();

      // Skip header row
      // Check for AGENTS title OR explicit container headers
      const isHeaderRow =
        (firstCell &&
          (firstCell.toUpperCase() === "AGENTS" ||
            firstCell.toUpperCase() === "AGENT")) ||
        row.some((cell) => cell?.toString().toUpperCase().includes("20'GP"));

      if (isHeaderRow) continue;

      // Skip completely empty rows
      if (!firstCell) continue;

      // Strategy:
      // If the row has numbers in columns 1-10, it's likely an Agent row.
      // If it doesn't, and has a string in the first column, it's a City row.

      // Let's check if it's a data row
      // A data row should have values (or 0) in the subsequent columns.
      // We can check if at least one of the container columns (index 1 to 10) is a number.
      const hasData = row
        .slice(1, 11)
        .some((val) => typeof val === "number" || !isNaN(Number(val)));

      if (!hasData) {
        // Likely a City row
        currentCity = firstCell.toUpperCase();
        processedCities.add(currentCity);

        // Ensure city exists
        const existingCity = await PortData.findOne({ city: currentCity });
        if (!existingCity) {
          await PortData.create({ city: currentCity, agents: [] });
        }
      } else {
        // It's an Agent row
        if (!currentCity) continue; // Skip if no city context

        const agentName = firstCell;

        // Map columns to our schema
        // Assuming Excel structure matches:
        // 0: Agent
        // 1: 20'GP
        // 2: 40'HC
        // 3: 20'RF
        // 4: 40'RF
        // 5: 20'OT
        // 6: 40'OT
        // 7: 20'FR
        // 8: 40'FR
        // 9: 20'TK
        // 10: 45 HC
        // 11: Total (can be calculated)

        const agentData = {
          agent: agentName,
          "20GP": Number(row[1]) || 0,
          "40HC": Number(row[2]) || 0,
          "20RF": Number(row[3]) || 0,
          "40RF": Number(row[4]) || 0,
          "20OT": Number(row[5]) || 0,
          "40OT": Number(row[6]) || 0,
          "20FR": Number(row[7]) || 0,
          "40FR": Number(row[8]) || 0,
          "20TK": Number(row[9]) || 0,
          "45HC": Number(row[10]) || 0,
          total: Number(row[11]) || 0, // Or calculate sum
        };

        // Recalculate total ensuring consistency
        agentData.total =
          agentData["20GP"] +
          agentData["40HC"] +
          agentData["20RF"] +
          agentData["40RF"] +
          agentData["20OT"] +
          agentData["40OT"] +
          agentData["20FR"] +
          agentData["40FR"] +
          agentData["20TK"] +
          agentData["45HC"];

        // Upsert Agent in City
        await PortData.findOneAndUpdate(
          { city: currentCity },
          {
            $pull: { agents: { agent: agentName } }, // Remove if exists (to replace)
          }
        );

        await PortData.findOneAndUpdate(
          { city: currentCity },
          {
            $push: { agents: agentData },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCities.size} cities`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
