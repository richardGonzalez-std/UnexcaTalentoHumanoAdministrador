export interface Empleado {
  id: number;
  nombre: string;
  cedula: string;
  cargo: string;
  fechaIngreso: string; // YYYY-MM-DD
  iniciales: string;
}

// Directorio de ejemplo. Sustituir por GET /api/empleados?q= cuando el
// backend exponga el buscador de empleados.
export const EMPLEADOS: Empleado[] = [
  { id: 1, nombre: "María Hernández", cedula: "V-18.234.556", cargo: "Docente", fechaIngreso: "2018-03-12", iniciales: "MH" },
  { id: 2, nombre: "José Rodríguez", cedula: "V-15.887.221", cargo: "Administrativo", fechaIngreso: "2015-06-01", iniciales: "JR" },
  { id: 3, nombre: "Carmen Díaz", cedula: "V-20.114.903", cargo: "Docente", fechaIngreso: "2020-01-15", iniciales: "CD" },
  { id: 4, nombre: "Luis Martínez", cedula: "V-12.345.678", cargo: "Administrativo", fechaIngreso: "2012-09-20", iniciales: "LM" },
  { id: 5, nombre: "Ana Pérez", cedula: "V-19.876.543", cargo: "Docente", fechaIngreso: "2019-11-05", iniciales: "AP" },
];

export function buscarEmpleados(query: string): Empleado[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return EMPLEADOS.filter(
    (e) => e.nombre.toLowerCase().includes(q) || e.cedula.toLowerCase().includes(q)
  ).slice(0, 5);
}
