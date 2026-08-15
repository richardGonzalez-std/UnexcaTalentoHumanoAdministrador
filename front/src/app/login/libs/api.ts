import type { LoginRequest, LoginResponse } from "../types/auth";

// Ruta relativa: pega contra el route handler de Next (mismo origen), que
// reenvía al backend y emite la cookie del token en el dominio del front. Así
// la sesión funciona también cuando front y back están en dominios distintos.
export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
