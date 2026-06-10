import { cookies } from "next/headers";
import type { UsuarioActual } from "@/app/dashboard/types/dashboard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Resuelve el usuario autenticado EN EL SERVIDOR: lee la cookie httpOnly "token"
// (que el JS del navegador no puede ver) y la reenvía al backend. Devuelve null
// si no hay sesión válida — la página la usa para redirigir a /login.
export async function obtenerUsuario(): Promise<UsuarioActual | null> {
  const token = (await cookies()).get("token");
  if (!token) return null;

  try {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Cookie: `token=${token.value}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as UsuarioActual;
  } catch {
    return null;
  }
}
