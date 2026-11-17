import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function cookieHeader() {
  const token = (await cookies()).get("token");
  return token ? { Cookie: `token=${token.value}` } : null;
}

export async function GET() {
  const headers = await cookieHeader();
  if (!headers) return Response.json({ mensaje: "No autenticado" }, { status: 401 });

  const res = await fetch(`${API}/api/historial/prestaciones`, {
    headers,
    cache: "no-store",
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export async function POST(request: Request) {
  const headers = await cookieHeader();
  if (!headers) return Response.json({ mensaje: "No autenticado" }, { status: 401 });

  const body = await request.text();

  const res = await fetch(`${API}/api/historial/prestaciones`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
