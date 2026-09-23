import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check — only admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, mode, businessId } = await request.json();
  if (!url) return NextResponse.json({ error: "Thiếu URL" }, { status: 400 });

  try {
    // Call the Node.js scraper API (running as a separate service)
    // Since Next.js API runs in Edge/Node, we call our puppeteer script via a child process
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    const path = await import("path");

    const scriptPath = path.join(process.cwd(), "scripts", "scrape_single.js");
    const escapedUrl = url.replace(/"/g, '\\"');
    const escapedMode = mode || "bulk";
    const escapedBizId = businessId || "";

    const { stdout, stderr } = await execAsync(
      `node "${scriptPath}" --url="${escapedUrl}" --mode="${escapedMode}" --businessId="${escapedBizId}"`,
      { timeout: 60000, cwd: process.cwd() }
    );

    if (stderr && stderr.includes("FATAL")) {
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    // Parse the JSON result output from the script
    const lines = stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const result = JSON.parse(lastLine);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[scrape-business] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
