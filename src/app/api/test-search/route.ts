import { NextResponse } from "next/server";
import { searchBusinessesAction } from "@/app/actions/search";

export async function GET() {
  try {
    const res = await searchBusinessesAction('', 'all', 'all');
    return NextResponse.json({ success: true, data: res });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
