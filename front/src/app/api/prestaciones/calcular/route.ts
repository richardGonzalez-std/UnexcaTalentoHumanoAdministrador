import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Proxy server-side hacia el backend. El navegador no puede adjuntar la cookie
// httpOnly "token" en una llamada cross-origin a :8080 (de ahí el 403), así que
// reenviamos la petición desde el servidor de Next con la cookie, igual que
// dashboard/libs/session.ts hace para /api/auth/me.
export async function POST(request: Request) {
  const token = (await cookies()).get("token");
  if (!token) {
    return Response.json({ mensaje: "No autenticado" }, { status: 401 });
  }

  const body = await request.text();

  const res = await fetch(`${API}/api/prestaciones/calcular`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token.value}`,
    },
    body,
    cache: "no-store",
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
