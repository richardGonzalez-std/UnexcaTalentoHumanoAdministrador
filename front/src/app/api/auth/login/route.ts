import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Proxy de login. Reenvía las credenciales al backend y, con el token que este
// devuelve en su Set-Cookie, emite la cookie httpOnly EN EL DOMINIO DEL FRONT.
// Así la sesión vive en el dominio de Next (Vercel) y tanto session.ts como el
// proxy de prestaciones —que corren en el servidor— pueden leerla. Sin esto, en
// un deploy cross-domain (front en Vercel, back en Render) la cookie quedaría en
// el dominio del backend, invisible para el servidor de Next.
export async function POST(request: Request) {
  const body = await request.text();

  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  const data = await res.text();
  const response = new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });

  if (res.ok) {
    const setCookie = leerSetCookie(res);
    const token = extraer(setCookie, /(?:^|;\s*)token=([^;]*)/);
    if (token) {
      const maxAge = extraer(setCookie, /Max-Age=(\d+)/i);
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // Sin Max-Age = cookie de sesión (dura hasta cerrar el navegador),
        // igual que el login sin "recordarme" en el backend.
        ...(maxAge ? { maxAge: Number(maxAge) } : {}),
      });
    }
  }

  return response;
}

// undici expone getSetCookie() (varias cookies sin colapsar); si no está,
// caemos al header combinado, suficiente porque el login emite una sola cookie.
function leerSetCookie(res: Response): string {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headers.getSetCookie?.();
  if (cookies?.length) return cookies.find((c) => c.startsWith("token=")) ?? cookies[0];
  return res.headers.get("set-cookie") ?? "";
}

function extraer(cookie: string, re: RegExp): string | null {
  const m = cookie.match(re);
  return m ? m[1] : null;
}
