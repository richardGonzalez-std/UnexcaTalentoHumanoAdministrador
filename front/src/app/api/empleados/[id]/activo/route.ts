import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get("token");
  if (!token) return Response.json({ mensaje: "No autenticado" }, { status: 401 });

  const res = await fetch(`${API}/api/empleados/${id}/activo`, {
    method: "PATCH",
    headers: { Cookie: `token=${token.value}` },
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
