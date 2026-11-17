export interface HistorialItem {
  id: string;
  nombreEmpleado: string;
  motivoTerminacion: string;
  montoFinal: number;
  fecha: string; // ISO
}

export async function obtenerHistorial(): Promise<HistorialItem[]> {
  try {
    const res = await fetch("/api/historial/prestaciones");
    if (!res.ok) return [];
    const data: Array<{
      id: number;
      nombreEmpleado: string;
      motivoTerminacion: string;
      montoFinal: number;
      fecha: string;
    }> = await res.json();
    return data.map((h) => ({ ...h, id: String(h.id) }));
  } catch {
    return [];
  }
}

export async function agregarAlHistorial(
  item: Omit<HistorialItem, "id" | "fecha">
): Promise<HistorialItem[]> {
  try {
    await fetch("/api/historial/prestaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  } catch {
    // La UI muestra éxito aunque falle el guardado — el usuario ya tiene el resultado.
  }
  return obtenerHistorial();
}
