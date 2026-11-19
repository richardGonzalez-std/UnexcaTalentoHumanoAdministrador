import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getToken() {
  return (await cookies()).get("token")?.value;
}

export async function GET(request: Request) {
  const token = await getToken();
  if (!token) return Response.json({ mensaje: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const res = await fetch(`${API}/api/empleados?q=${encodeURIComponent(q)}`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export async function POST(request: Request) {
  const token = await getToken();
  if (!token) return Response.json({ mensaje: "No autenticado" }, { status: 401 });

  const body = await request.text();
  const res = await fetch(`${API}/api/empleados`, {
    method: "POST",
    headers: { Cookie: `token=${token}`, "Content-Type": "application/json" },
    body,
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
