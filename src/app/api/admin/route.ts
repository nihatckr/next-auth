import { currentRole } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";

export async function GET() {

  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return NextResponse.json(null, { status: 200 });
  }
  return NextResponse.json(null, { status: 403 });
}
