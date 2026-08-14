import type { Kpi, Modulo, Solicitud } from "@/app/dashboard/types/dashboard";

// Datos de ejemplo (mock). Más adelante vendrán del backend:
// los KPIs del módulo de Empleados/Correspondencia, las solicitudes de su
// propio módulo, y el nombre del usuario del JWT de la sesión.

export const kpis: Kpi[] = [
  { icon: "people", value: 248, label: "Profesores activos" },
  { icon: "idcard", value: 63, label: "Personal administrativo" },
  { icon: "envelope", value: 12, label: "Correspondencia pendiente", attention: true },
  { icon: "calculator", value: 37, label: "Prestaciones este mes" },
];

export const modulos: Modulo[] = [
  {
    icon: "people",
    titulo: "Empleados",
    descripcion:
      "Consulta y gestiona el expediente del personal, datos de contacto y situación laboral.",
    proximamente: true,
    href: "#",
  },
  {
    icon: "calculator",
    titulo: "Cálculo de Prestaciones",
    descripcion:
      "Estima prestaciones sociales, antigüedad e intereses conforme a la normativa vigente.",
    href: "/dashboard/prestaciones",
  },
  {
    icon: "gear",
    titulo: "Administración",
    descripcion:
      "Configura usuarios, roles y parámetros generales del sistema de talento humano.",
    proximamente: true,
    href: "#",
  },
  {
    icon: "envelope",
    titulo: "Correspondencia",
    descripcion:
      "Registra y da seguimiento a oficios, memorandos y comunicaciones internas.",
    proximamente: true,
    href: "#",
  },
];

export const solicitudes: Solicitud[] = [
  { iniciales: "MH", nombre: "María Hernández", tipo: "Vacaciones", tiempo: "hace 1 día", estado: "pendiente" },
  { iniciales: "JR", nombre: "José Rodríguez", tipo: "Constancia de trabajo", tiempo: "hace 2 días", estado: "aprobada" },
  { iniciales: "CD", nombre: "Carmen Díaz", tipo: "Permiso remunerado", tiempo: "hace 3 días", estado: "revision" },
  { iniciales: "LM", nombre: "Luis Martínez", tipo: "Adelanto de prestaciones", tiempo: "hace 4 días", estado: "pendiente" },
  { iniciales: "AP", nombre: "Ana Pérez", tipo: "Reposo médico", tiempo: "hace 5 días", estado: "aprobada" },
];
