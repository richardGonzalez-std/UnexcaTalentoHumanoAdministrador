export interface HistorialItem {
  id: string;
  nombreEmpleado: string;
  motivoTerminacion: string;
  montoFinal: number;
  fecha: string; // ISO
}

const KEY = "th_prestaciones_historial";

// Datos de ejemplo mientras no exista un endpoint de historial en el backend.
const SEED: HistorialItem[] = [
  { id: "seed-1", nombreEmpleado: "Luis Martínez", motivoTerminacion: "RENUNCIA", montoFinal: 42100, fecha: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "seed-2", nombreEmpleado: "Ana Pérez", motivoTerminacion: "RENUNCIA", montoFinal: 38900, fecha: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "seed-3", nombreEmpleado: "Carmen Díaz", motivoTerminacion: "RENUNCIA", montoFinal: 51200, fecha: new Date(Date.now() - 7 * 86400000).toISOString() },
];

export function obtenerHistorial(): HistorialItem[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as HistorialItem[];
  } catch {
    return SEED;
  }
}

export function agregarAlHistorial(item: Omit<HistorialItem, "id" | "fecha">): HistorialItem[] {
  const actual = obtenerHistorial();
  const nuevo: HistorialItem = { ...item, id: crypto.randomUUID(), fecha: new Date().toISOString() };
  const actualizado = [nuevo, ...actual].slice(0, 8);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(actualizado));
  }
  return actualizado;
}
