import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getToken() {
  return (await cookies()).get("token")?.value;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getToken();
  if (!token) return Response.json({ mensaje: "No autenticado" }, { status: 401 });

  const res = await fetch(`${API}/api/empleados/${id}`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getToken();
  if (!token) return Response.json({ mensaje: "No autenticado" }, { status: 401 });

  const body = await req.text();
  const res = await fetch(`${API}/api/empleados/${id}`, {
    method: "PUT",
    headers: { Cookie: `token=${token}`, "Content-Type": "application/json" },
    body,
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
