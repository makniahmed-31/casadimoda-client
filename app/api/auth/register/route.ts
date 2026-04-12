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
    const response = NextResponse.json(data, { status: res.status });

    // Forward the Express JWT cookie to the browser so authenticated
    // API calls (e.g. /api/supplier/register) work after registration.
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
