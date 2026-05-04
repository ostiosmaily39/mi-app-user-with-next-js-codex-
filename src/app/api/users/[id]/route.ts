import { NextRequest, NextResponse } from "next/server";

const TARGET = process.env.USERS_API_TARGET ?? "http://localhost:3000/api/users";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${TARGET}/${id}`);
  const data = await res.json();
  return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${TARGET}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : { ...body, id: Number(id) };
  return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await fetch(`${TARGET}/${id}`, { method: "DELETE" });
  return NextResponse.json({ success: true, data: { id: Number(id) } }, { status: 200 });
}