import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check — only admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, mode, businessId, category, location } = await request.json();
  if (!url) return NextResponse.json({ error: "Thiếu URL" }, { status: 400 });

  try {
    // Call the Node.js scraper API (running as a separate service)
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);
    const path = await import("path");

    const scriptPath = path.join(process.cwd(), "scripts", "scrape_single.js");
    const safeMode = mode || "bulk";
    const safeBizId = businessId || "";
    const safeCategory = category || "spa-massage";
    const safeLocation = location || "ho-chi-minh";

    // Use execFile to prevent shell injection (args are passed directly to node, not parsed by shell)
    const { stdout, stderr } = await execFileAsync(
      "node",
      [
        scriptPath,
        `--url=${url}`,
        `--mode=${safeMode}`,
        `--businessId=${safeBizId}`,
        `--category=${safeCategory}`,
        `--location=${safeLocation}`,
      ],
      { timeout: 60000, cwd: process.cwd() }
    );

    // Parse the JSON result output from the script
    const lines = stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    try {
      const result = JSON.parse(lastLine);
      return NextResponse.json(result);
    } catch {
      console.error("[scrape-business] Parse error. Stderr:", stderr?.trim(), "Stdout lastLine:", lastLine);
      return NextResponse.json({ error: "Lỗi nội bộ khi trích xuất dữ liệu" }, { status: 500 });
    }
  } catch (e: any) {
    console.error("[scrape-business] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
