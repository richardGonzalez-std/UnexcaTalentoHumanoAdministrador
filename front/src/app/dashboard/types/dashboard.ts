import type { IconName } from "@/app/dashboard/_components/icons";

// Indicador (KPI) de la sección "Resumen".
export type Kpi = {
  icon: IconName;
  value: number;
  label: string;
  /** Variante de atención (ámbar): resalta métricas que requieren acción. */
  attention?: boolean;
};

// Tarjeta de módulo de "Acceso rápido".
export type Modulo = {
  icon: IconName;
  titulo: string;
  descripcion: string;
  /** Mientras el módulo no exista, muestra el badge "Próximamente". */
  proximamente?: boolean;
  href: string;
};

// Usuario autenticado (resuelto desde el JWT vía GET /api/auth/me).
export type UsuarioActual = {
  id: number;
  nombreCompleto: string;
  cedula: string;
  correo: string;
  iniciales: string;
};

export type EstadoSolicitud = "pendiente" | "aprobada" | "revision";

// Fila del panel "Solicitudes recientes".
export type Solicitud = {
  iniciales: string;
  nombre: string;
  tipo: string;
  /** Texto relativo, p. ej. "hace 2 días". */
  tiempo: string;
  estado: EstadoSolicitud;
};
