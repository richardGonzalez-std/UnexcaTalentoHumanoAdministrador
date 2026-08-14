import type { DatosLiquidacionRequest, PrestacionesResult } from "../types/prestaciones";

// Ruta relativa: pega contra el route handler de Next (mismo origen), que
// reenvía al backend con la cookie httpOnly. Evita CORS y el 403 por cookie
// no adjunta en llamadas cross-origin del navegador.
export async function calcularPrestaciones(
  datos: DatosLiquidacionRequest
): Promise<PrestacionesResult> {
  const response = await fetch("/api/prestaciones/calcular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empleadoId: datos.empleadoId,
      fechaIngreso: datos.fechaIngreso,
      fechaEgreso: datos.fechaEgreso,
      motivoTerminacion: datos.motivoTerminacion,
      sueldoTabla: datos.sueldoTabla,
      primas: datos.primas,
      esSalarioVariable: datos.esSalarioVariable,
      promedioSueldoUltimos6Meses: datos.promedioSueldoUltimos6Meses,
      diasBonoVacacional: datos.diasBonoVacacional,
      diasAguinaldos: datos.diasAguinaldos,
      historicoAcumulado: datos.historicoAcumulado,
      anticipos: datos.anticipos ?? 0,
      otrasDeudas: datos.otrasDeudas ?? 0,
      pensionAlimentaria: datos.pensionAlimentaria ?? 0,
    }),
    credentials: "include",
  });

  if (!response.ok) {
    // El backend responde {"mensaje": "..."} en sus errores; mostrarlo tal cual es
    // más útil que el statusText genérico ("Bad Request").
    const mensaje = await response
      .json()
      .then((b: { mensaje?: string }) => b?.mensaje)
      .catch(() => undefined);
    throw new Error(mensaje ?? `Error: ${response.statusText}`);
  }

  return (await response.json()) as PrestacionesResult;
}
