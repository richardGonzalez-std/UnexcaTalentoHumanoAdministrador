import { cookies } from "next/headers";
import { Icon } from "@/app/dashboard/_components/icons";
import { kpis } from "@/app/dashboard/libs/data";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function fetchEmpleadosTotal(): Promise<number> {
  const token = (await cookies()).get("token");
  if (!token) return 0;
  try {
    const res = await fetch(`${API}/api/empleados/count`, {
      headers: { Cookie: `token=${token.value}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total ?? 0;
  } catch {
    return 0;
  }
}

export async function ResumenKpis() {
  const totalEmpleados = await fetchEmpleadosTotal();

  const kpisConEmpleados = kpis.map((kpi) =>
    kpi.icon === "calculator"
      ? {
          ...kpi,
          label:
            totalEmpleados > 0
              ? `prestaciones · ${totalEmpleados} empleados disponibles`
              : "Prestaciones este mes",
        }
      : kpi
  );

  return (
    <section className="mb-[34px]">
      <div className="mb-[18px] flex items-center gap-3">
        <h2 className="text-[17px] font-bold tracking-[-0.2px] text-ink">Resumen</h2>
      </div>

      <div className="grid grid-cols-4 gap-[14px] max-[920px]:grid-cols-2 max-[520px]:grid-cols-1">
        {kpisConEmpleados.map((kpi) => (
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
