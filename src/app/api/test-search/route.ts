import { NextResponse } from "next/server";
import { searchBusinessesAction } from "@/app/actions/search";

export async function GET() {
  try {
    const { results: res, error } = await searchBusinessesAction('', 'all', 'all');
    return NextResponse.json({ success: !error, data: res });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
