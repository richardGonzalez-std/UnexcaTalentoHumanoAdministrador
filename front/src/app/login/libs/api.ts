import type { LoginRequest, LoginResponse } from "../types/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // necesario para que el navegador acepte/envíe la cookie
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    let mensaje = "No se pudo iniciar sesión";
    try {
      const data = await res.json();
      if (data?.mensaje) mensaje = data.mensaje;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new Error(mensaje);
  }
  return res.json();
}
