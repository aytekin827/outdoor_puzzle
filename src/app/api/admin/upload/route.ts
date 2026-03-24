import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let env: any;
    try {
      const ctx = getCloudflareContext();
      env = ctx.env;
    } catch (e) {
      // Not running in Cloudflare edge context
    }

    if (env && env.STORAGE) {
      // Cloudflare R2 Upload
      const key = `${Date.now()}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      await env.STORAGE.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type }
      });
      // To serve this, you could point to an R2 public domain or an asset proxy
      // Assuming a public URL or an API asset proxy route. We will return a proxy route format.
      return NextResponse.json({
        url: `/api/assets/${key}`,
        success: true
      });
    }

    // Local fallback: Since this is standard Next.js, writing to public dir natively isn't reliable on edge runtime.
    // If not in Cloudflare, we spoof it for local testing
    console.warn("R2 STORAGE binding missing. Returning mock URL for local testing.");
    return NextResponse.json({
      url: `/mock-upload-${file.name}`,
      success: true
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
