import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { id, password } = await req.json();

    // WARNING: Replace with ENV variables in production
    if (id === "admin" && password === "admin123!") {
      const cookieStore = await cookies();
      cookieStore.set("adminToken", "authenticated", { 
        httpOnly: true, 
        path: "/",
        // MVP: expire in 1 day
        maxAge: 60 * 60 * 24 
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
