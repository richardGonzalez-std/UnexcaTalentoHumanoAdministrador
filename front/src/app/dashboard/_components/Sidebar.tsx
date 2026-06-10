import { Icon, Skyline, type IconName } from "@/app/dashboard/_components/icons";
import type { UsuarioActual } from "@/app/dashboard/types/dashboard";

type NavItem = { icon: IconName; label: string; href: string; active?: boolean };

const NAV: NavItem[] = [
  { icon: "home", label: "Inicio", href: "#", active: true },
  { icon: "people", label: "Empleados", href: "#" },
  { icon: "calculator", label: "Cálculo de Prestaciones", href: "#" },
  { icon: "gear", label: "Administración", href: "#" },
  { icon: "envelope", label: "Correspondencia", href: "#" },
];

const BRAND_GRADIENT = "linear-gradient(168deg, #002e6b, #2b3d4f)";

export function Sidebar({
  open,
  usuario,
  onNavigate,
  onLogout,
}: {
  open: boolean;
  usuario: UsuarioActual;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col bg-brand text-white transition-transform duration-300 max-[920px]:shadow-card-lg ${
        open ? "max-[920px]:translate-x-0" : "max-[920px]:-translate-x-full"
      }`}
    >
      {/* Marca */}
      <div className="flex items-center gap-3 px-6 pb-6 pt-[26px]">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-[11px] border border-white/20"
          style={{ background: BRAND_GRADIENT }}
        >
          <Skyline />
        </div>
        <div className="leading-[1.15]">
          <div className="text-[15px] font-extrabold tracking-[0.2px]">UNEXCA</div>
          <div className="mt-[2px] text-[11.5px] font-medium text-brand-300">Talento Humano</div>
        </div>
      </div>

      <div className="px-6 pb-[10px] pt-[6px] text-[11px] font-semibold uppercase tracking-[1.4px] text-brand-300">
        Menú principal
      </div>

      <nav className="flex-1 px-[14px] py-[6px]">
        {NAV.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={`relative mb-[3px] flex items-center gap-[13px] rounded-[10px] px-[14px] py-[11px] text-[14.5px] font-medium transition-colors ${
              item.active
                ? "bg-white font-semibold text-brand shadow-card before:absolute before:inset-y-[9px] before:-left-[14px] before:w-1 before:rounded-r before:bg-white before:content-['']"
                : "text-[#cdd9ea] hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Icon name={item.icon} className="size-[19px] shrink-0" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Pie: usuario autenticado + cerrar sesión */}
      <div className="border-t border-white/[0.09] p-[14px]">
        <div className="flex items-center gap-[11px] px-[10px] pb-[14px] pt-2">
          <div
            className="grid size-[38px] shrink-0 place-items-center rounded-full text-sm font-bold text-white"
            style={{ background: BRAND_GRADIENT }}
          >
            {usuario.iniciales}
          </div>
          <div className="min-w-0 leading-[1.2]">
            <div className="truncate text-[13.5px] font-semibold text-white">
              {usuario.nombreCompleto}
            </div>
            <div className="truncate text-[11.5px] text-brand-300">{usuario.correo}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-[13px] rounded-[10px] px-[14px] py-[11px] text-left text-[14.5px] font-medium text-[#cdd9ea] transition-colors hover:bg-[rgba(220,70,70,0.16)] hover:text-[#ffd3d3]"
        >
          <Icon name="logout" className="size-[19px]" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
