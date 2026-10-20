import { cookies } from "next/headers";

import { ADMIN_COOKIE, adminConfigured, adminKey, keyMatches } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** 12 hours normally, 30 days when the admin asks to stay signed in. */
const SESSION_SECONDS = 60 * 60 * 12;
const REMEMBER_SECONDS = 60 * 60 * 24 * 30;

/** Exchange the admin key for an httpOnly cookie. */
export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json(
      {
        ok: false,
        message:
          "No admin key is set on this deployment. Add ADMIN_SECRET (or IMPORT_SECRET) in Vercel → Settings → Environment Variables, then redeploy.",
      },
      { status: 503 },
    );
  }

  let key = "";
  let keep = false;
  try {
    const body = (await request.json()) as { key?: unknown; keep?: unknown };
    key = typeof body.key === "string" ? body.key.trim() : "";
    keep = body.keep === true;
  } catch {
    return Response.json({ ok: false, message: "Send the key as JSON." }, { status: 400 });
  }

  if (!key || !keyMatches(key)) {
    return Response.json({ ok: false, message: "That key is not correct." }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, adminKey() ?? "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: keep ? REMEMBER_SECONDS : SESSION_SECONDS,
  });

  return Response.json({ ok: true });
}

/** Sign out. */
export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
