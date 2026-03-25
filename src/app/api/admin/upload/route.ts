import { NextResponse } from "next/server";
import { uploadFileToStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploaded = await uploadFileToStorage(file, "admin");
    return NextResponse.json({
      url: uploaded.url,
      key: uploaded.key,
      success: true
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
