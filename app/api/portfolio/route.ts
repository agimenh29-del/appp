import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
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

export async function POST(request: Request) {
  const expectedPasscode = String(
    process.env.ADMIN_PASSCODE
      || process.env.NEXT_PUBLIC_ADMIN_PASSCODE
      || "",
  ).trim();
  const providedPasscode = String(request.headers.get("x-admin-passcode") || "").trim();
  if (!expectedPasscode || !providedPasscode || providedPasscode !== expectedPasscode) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const title = String(body?.title || "").trim();
  const description = String(body?.description || "").trim();
  const details = String(body?.details || "").trim();
  const media = Array.isArray(body?.media) ? body.media : [];
  if (!title || !description || media.length === 0) {
    return NextResponse.json({ error: "Title, description, and media are required." }, { status: 400 });
  }

  const project = {
    id: randomUUID(),
    title,
    description,
    details,
    media,
    createdAt: new Date().toISOString(),
  };

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (supabaseUrl && serviceKey) {
    try {
      const url = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/app_portfolio`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify([{ id: project.id, data: project, created_at: project.createdAt }]),
      });
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: text || "Failed to save portfolio to Supabase." }, { status: 500 });
      }
      return NextResponse.json({ project });
    } catch {
      return NextResponse.json({ error: "Failed to save portfolio to Supabase." }, { status: 500 });
    }
  }

  // Local fallback (works in local dev; not persistent on serverless deployments).
  try {
    const filePath = path.join(process.cwd(), "data", "portfolio.json");
    let parsed: any = { projects: [] };
    try {
      const raw = await fs.readFile(filePath, "utf8");
      parsed = JSON.parse(raw || "{}");
    } catch {
      parsed = { projects: [] };
    }
    const projects = Array.isArray(parsed?.projects) ? parsed.projects : [];
    projects.unshift(project);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ projects }, null, 2), "utf8");
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({
      error: "Portfolio write failed. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
    }, { status: 500 });
  }
}
