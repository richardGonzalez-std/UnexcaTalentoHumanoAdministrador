import { Icon } from "@/app/dashboard/_components/icons";
import { modulos } from "@/app/dashboard/libs/data";

// Sección "Acceso rápido": tarjetas de módulo en cuadrícula 2×2.
// La barra azul lateral (after) y la inversión de color del icono usan
// `group-hover` para reaccionar al hover de toda la tarjeta.
export function AccesoRapido() {
  return (
    <section>
      <div className="mb-[18px] flex items-center gap-3">
        <h2 className="text-[17px] font-bold tracking-[-0.2px] text-ink">Acceso rápido</h2>
        <span className="rounded-full bg-accent-soft px-[11px] py-[3px] text-xs font-semibold text-brand-600">
          4 módulos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-[14px] max-[520px]:grid-cols-1">
        {modulos.map((modulo) => (
          <a
            key={modulo.titulo}
            href={modulo.href}
            className="group relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-white px-[18px] pb-4 pt-[18px] shadow-card transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-[#cfdcec] hover:shadow-card-md after:absolute after:inset-y-0 after:left-0 after:w-1 after:origin-top after:scale-y-0 after:bg-brand after:transition-transform after:content-[''] hover:after:scale-y-100"
          >
            <div className="mb-[14px] flex items-start justify-between">
              <div className="grid size-[44px] place-items-center rounded-[11px] bg-accent-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon name={modulo.icon} className="size-[22px]" strokeWidth={1.8} />
              </div>
              {modulo.proximamente && (
                <span className="inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border border-[#f1e3b8] bg-[#fbf3da] px-[10px] py-1 text-[11px] font-semibold text-[#8a6d1e]">
                  <span className="size-[6px] rounded-full bg-[#d9a814]" />
                  Próximamente
                </span>
              )}
            </div>
            <h3 className="mb-[6px] text-[15px] font-bold tracking-[-0.2px] text-ink">
              {modulo.titulo}
            </h3>
            <p className="flex-1 text-pretty text-[13px] leading-[1.48] text-ink-soft">
              {modulo.descripcion}
            </p>
            <span className="mt-[14px] inline-flex items-center gap-[6px] text-[13px] font-semibold text-brand opacity-[.55]">
              Abrir módulo
              <Icon
                name="arrow"
                className="size-[15px] transition-transform group-hover:translate-x-[3px]"
                strokeWidth={2.2}
              />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
