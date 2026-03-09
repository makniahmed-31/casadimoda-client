import db from "@/utils/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    console.log("Testing DB connection...");
    await db.connect();
    const state = mongoose.connection.readyState;
    const states: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const status = states[state] || "unknown";

    if (state === 1) {
      const admin = mongoose.connection.db?.admin();
      const info = await admin?.listDatabases();
      console.log("Databases:", info);
    }

    await db.disconnect();
    return NextResponse.json({
      success: true,
      status,
      readyState: state,
      message: "Database connection successful",
    });
  } catch (error: unknown) {
    console.error("DB Connection Test Failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 }
    );
  }
}
