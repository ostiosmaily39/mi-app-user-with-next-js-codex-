import { NextRequest, NextResponse } from "next/server";

const TARGET = process.env.USERS_API_TARGET ?? "http://localhost:3000/api/users";

export async function GET() {
  const res = await fetch(TARGET);
  const data = await res.json();
  return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(TARGET, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json({ success: true, data }, { status: 201 });
}