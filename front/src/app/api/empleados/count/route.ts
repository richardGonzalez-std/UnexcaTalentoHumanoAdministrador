import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET() {
  const token = (await cookies()).get("token");
  if (!token) return Response.json({ total: 0 });

  try {
    const res = await fetch(`${API}/api/empleados/count`, {
      headers: { Cookie: `token=${token.value}` },
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ total: 0 });
    return Response.json(await res.json());
  } catch {
    return Response.json({ total: 0 });
  }
}
