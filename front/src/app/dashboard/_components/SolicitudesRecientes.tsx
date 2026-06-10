import { Icon } from "@/app/dashboard/_components/icons";
import { solicitudes } from "@/app/dashboard/libs/data";
import type { EstadoSolicitud } from "@/app/dashboard/types/dashboard";

const BRAND_GRADIENT = "linear-gradient(168deg, #002e6b, #2b3d4f)";

// Etiqueta + clases de color por estado (paleta sobria del diseño).
const ESTADO: Record<EstadoSolicitud, { label: string; clase: string }> = {
  pendiente: { label: "Pendiente", clase: "border-[#f1e3b8] bg-[#fbf3da] text-[#8a6d1e]" },
  aprobada: { label: "Aprobada", clase: "border-[#b8deca] bg-[#e6f4ee] text-[#1a6f47]" },
  revision: { label: "En revisión", clase: "border-[#c5d5eb] bg-accent-soft text-brand-600" },
};

export function SolicitudesRecientes() {
  return (
    <section>
      <div className="mb-[18px] flex items-center gap-3">
        <h2 className="text-[17px] font-bold tracking-[-0.2px] text-ink">Solicitudes recientes</h2>
        <span className="rounded-full bg-accent-soft px-[11px] py-[3px] text-xs font-semibold text-brand-600">
          {solicitudes.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="py-2">
          {solicitudes.map((solicitud, i) => (
            <div key={solicitud.nombre}>
              <div className="flex cursor-pointer items-center gap-3 px-5 py-[11px] transition-colors hover:bg-canvas">
                <div
                  className="grid size-[34px] shrink-0 place-items-center rounded-full text-[12px] font-bold tracking-[0.3px] text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  {solicitud.iniciales}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-ink">
                    {solicitud.nombre}
                  </div>
                  <div className="mt-[2px] flex items-center gap-[6px]">
                    <span className="truncate text-xs text-ink-soft">{solicitud.tipo}</span>
                    <span className="text-[11px] text-line">·</span>
                    <span className="shrink-0 text-[11.5px] text-ink-soft">{solicitud.tiempo}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full border px-[9px] py-[3px] text-[11.5px] font-semibold ${ESTADO[solicitud.estado].clase}`}
                >
                  {ESTADO[solicitud.estado].label}
                </span>
              </div>
              {i < solicitudes.length - 1 && <div className="mx-5 h-px bg-line opacity-60" />}
            </div>
          ))}
        </div>

        <a
          href="#"
          className="group flex items-center justify-center gap-[6px] border-t border-line px-5 py-[13px] text-[13px] font-semibold text-brand-600 transition-colors hover:bg-canvas hover:text-brand"
        >
          Ver todas las solicitudes
          <Icon
            name="arrow"
            className="size-[14px] transition-transform group-hover:translate-x-[3px]"
            strokeWidth={2.2}
          />
        </a>
      </div>
    </section>
  );
}
