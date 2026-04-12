import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_URL = (process.env.INTERNAL_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${INTERNAL_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
