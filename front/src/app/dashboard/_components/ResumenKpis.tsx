import { Icon } from "@/app/dashboard/_components/icons";
import { kpis } from "@/app/dashboard/libs/data";

// Sección "Resumen": fila compacta de indicadores, de menor jerarquía visual
// que las tarjetas de módulo.
export function ResumenKpis() {
  return (
    <section className="mb-[34px]">
      <div className="mb-[18px] flex items-center gap-3">
        <h2 className="text-[17px] font-bold tracking-[-0.2px] text-ink">Resumen</h2>
      </div>

      <div className="grid grid-cols-4 gap-[14px] max-[920px]:grid-cols-2 max-[520px]:grid-cols-1">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-center gap-[13px] rounded-[13px] border border-line bg-white px-4 py-[15px] shadow-card transition-[border-color,box-shadow] hover:border-[#cfdcec] hover:shadow-card-md"
          >
            <div
              className={`grid size-[38px] shrink-0 place-items-center rounded-[10px] ${
                kpi.attention ? "bg-[#fbf3da] text-[#b8881a]" : "bg-accent-soft text-brand"
              }`}
            >
              <Icon name={kpi.icon} className="size-[19px]" />
            </div>
            <div className="min-w-0 leading-[1.1]">
              <div
                className={`text-2xl font-extrabold tracking-[-0.5px] ${
                  kpi.attention ? "text-[#b8881a]" : "text-ink"
                }`}
              >
                {kpi.value}
              </div>
              <div className="mt-1 text-xs font-medium text-ink-soft">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
