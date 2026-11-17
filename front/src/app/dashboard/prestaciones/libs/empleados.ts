export interface Empleado {
  id: number;
  nombre: string;
  cedula: string;
  cargo: string | null;
  fechaIngreso: string | null; // YYYY-MM-DD
  iniciales: string;
}

export async function buscarEmpleados(query: string): Promise<Empleado[]> {
  const q = query.trim();
  if (!q) return [];

  const res = await fetch(`/api/empleados?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
}
