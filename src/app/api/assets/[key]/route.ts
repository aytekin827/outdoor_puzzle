import { NextResponse, NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const key = params.key;
    if (!key) return new NextResponse("Not Found", { status: 404 });

    const ctx = getCloudflareContext();
    const env = ctx.env as any;
    if (env && env.STORAGE) {
      const object = await env.STORAGE.get(key);

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
