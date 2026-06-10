import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/app/dashboard/_components/DashboardShell";
import { ResumenKpis } from "@/app/dashboard/_components/ResumenKpis";
import { AccesoRapido } from "@/app/dashboard/_components/AccesoRapido";
import { SolicitudesRecientes } from "@/app/dashboard/_components/SolicitudesRecientes";
import { Icon } from "@/app/dashboard/_components/icons";
import { obtenerUsuario } from "@/app/dashboard/libs/session";

// El diseño usa Inter; el layout raíz usa Geist, así que la cargamos
// localmente y la aplicamos solo al árbol del dashboard.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Panel · Talento Humano UNEXCA",
};

// Fecha de hoy en español venezolano. El componente CSS `capitalize`
// convierte "sábado, 6 de junio de 2026" → "Sábado, 6 De Junio De 2026".
function fechaHoy(): string {
  return new Intl.DateTimeFormat("es-VE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default async function DashboardPage() {
  // Protección de ruta: sin sesión válida no se renderiza el panel.
  // El login vive en la raíz "/" (ver app/page.tsx).
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/");

  return (
    <div className={inter.className}>
      <DashboardShell usuario={usuario}>
        <header className="mb-[34px] flex flex-wrap items-end justify-between gap-6 max-[520px]:mb-[26px]">
          <div>
            <div className="mb-2 text-[12.5px] font-semibold uppercase tracking-[0.4px] text-brand-600">
              Panel principal
            </div>
            <h1 className="text-[30px] font-extrabold tracking-[-0.6px] text-ink max-[920px]:text-[25px]">
              Bienvenido, <span className="text-brand">{usuario.nombreCompleto}</span>
            </h1>
          </div>
          <div className="inline-flex items-center gap-[9px] rounded-xl border border-line bg-white px-4 py-[11px] text-[13.5px] font-medium capitalize text-ink-soft shadow-card">
            <Icon name="calendar" className="size-[17px] text-brand" />
            <span>{fechaHoy()}</span>
          </div>
        </header>

        <ResumenKpis />

        <div className="grid grid-cols-[62fr_38fr] items-start gap-6 max-[920px]:grid-cols-1">
          <AccesoRapido />
          <SolicitudesRecientes />
        </div>
      </DashboardShell>
    </div>
  );
}
