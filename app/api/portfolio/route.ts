import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const url = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/app_portfolio?select=id,data,created_at,updated_at&order=created_at.desc`;
      const res = await fetch(url, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = await res.json();
        const projects = Array.isArray(rows)
          ? rows.map((row) => {
              const data = row && typeof row.data === "object" ? row.data : {};
              return {
                ...data,
                id: String(data.id || row.id || ""),
                createdAt: String(data.createdAt || row.created_at || ""),
                updatedAt: data.updatedAt || row.updated_at || null,
              };
            })
          : [];
        return NextResponse.json({ projects });
      }
    } catch {
      // fallback to file-based portfolio below
    }
  }

  try {
    const filePath = path.join(process.cwd(), "data", "portfolio.json");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    const projects = Array.isArray(parsed?.projects) ? parsed.projects : [];
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ projects: [] });
  }
}
