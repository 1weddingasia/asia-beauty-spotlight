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
    // Since Next.js API runs in Edge/Node, we call our puppeteer script via a child process
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    const path = await import("path");

    const scriptPath = path.join(process.cwd(), "scripts", "scrape_single.js");
    const escapedUrl = url.replace(/"/g, '\\"');
    const escapedMode = mode || "bulk";
    const escapedBizId = businessId || "";
    const escapedCategory = (category || "spa-massage").replace(/"/g, '\\"');
    const escapedLocation = (location || "ho-chi-minh").replace(/"/g, '\\"');

    const { stdout, stderr } = await execAsync(
      `node "${scriptPath}" --url="${escapedUrl}" --mode="${escapedMode}" --businessId="${escapedBizId}" --category="${escapedCategory}" --location="${escapedLocation}"`,
      { timeout: 60000, cwd: process.cwd() }
    );

    // Parse the JSON result output from the script
    // scrape_single.js always writes a JSON result to stdout
    // If stdout is empty or unparseable, surface stderr for debugging
    const lines = stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    try {
      const result = JSON.parse(lastLine);
      return NextResponse.json(result);
    } catch {
      const errDetail = stderr?.trim() || lastLine || "Empty response from scraper";
      return NextResponse.json({ error: errDetail }, { status: 500 });
    }
  } catch (e: any) {
    console.error("[scrape-business] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
