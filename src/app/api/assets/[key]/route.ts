import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    if (!key) return new NextResponse("Not Found", { status: 404 });

    const ctx = getCloudflareContext();
    const env = ctx.env as any;
    if (env && env.STORAGE) {
      const decodedKey = decodeURIComponent(key);
      const object = await env.STORAGE.get(decodedKey);

      if (!object) {
        return new NextResponse("Object Not Found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      return new NextResponse(object.body as ReadableStream, {
        headers,
      });
    }

    return new NextResponse("R2 STORAGE binding missing", { status: 500 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
