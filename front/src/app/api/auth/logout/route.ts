import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Proxy de logout. Avisa al backend (best-effort) y borra la cookie del token
// en el dominio del front, que es donde vive tras el login por proxy.
export async function POST() {
  const token = (await cookies()).get("token");

  if (token) {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: { Cookie: `token=${token.value}` },
        cache: "no-store",
      });
    } catch {
      // El borrado local de la cookie basta para cerrar la sesión en el front.
    }
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
