import { NextResponse, type NextRequest } from "next/server";

function unauthorized(realm: string) {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${realm}", charset="UTF-8"` }
  });
}

function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function parseBasicAuth(
  header: string | null
): { user: string; pass: string } | null {
  if (!header) return null;

  const spaceIdx = header.indexOf(" ");
  if (spaceIdx < 0) return null;

  const scheme = header.slice(0, spaceIdx);
  const encoded = header.slice(spaceIdx + 1).trim();
  if (scheme.toLowerCase() !== "basic" || !encoded) return null;

  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return null;
  }

  const idx = decoded.indexOf(":");
  if (idx < 0) return null;

  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
}

export function middleware(req: NextRequest) {
  const adminUser = process.env.ADMIN_USER ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "";

  if (!adminPass) {
    return new NextResponse("Server misconfigured: ADMIN_PASSWORD is not set.", {
      status: 500
    });
  }

  const auth = parseBasicAuth(req.headers.get("authorization"));
  if (!auth) return unauthorized("Admin");

  const userOk = safeEq(auth.user, adminUser);
  const passOk = safeEq(auth.pass, adminPass);

  if (!userOk || !passOk) return unauthorized("Admin");

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"]
};
