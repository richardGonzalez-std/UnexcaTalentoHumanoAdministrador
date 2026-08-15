"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/app/dashboard/_components/Sidebar";
import { Icon } from "@/app/dashboard/_components/icons";
import type { UsuarioActual } from "@/app/dashboard/types/dashboard";

// Cascarón cliente: maneja el menú lateral en móvil y el cierre de sesión.
// El contenido (KPIs, módulos, solicitudes) se pasa como `children` y se
// renderiza en el servidor.
export function DashboardShell({
  usuario,
  children,
}: {
  usuario: UsuarioActual;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const router = useRouter();

  // Logout contra el route handler de Next (mismo origen), que borra la cookie
  // del token en el dominio del front y avisa al backend.
  async function cerrarSesion() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/"); // el login vive en la raíz
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <Sidebar
        open={navOpen}
        usuario={usuario}
        onNavigate={() => setNavOpen(false)}
        onLogout={cerrarSesion}
      />

      {/* Scrim: solo en móvil cuando el menú está abierto */}
      <div
        aria-hidden
        onClick={() => setNavOpen(false)}
        className={`fixed inset-0 z-[35] bg-[rgba(8,25,50,0.45)] transition-opacity min-[921px]:hidden ${
          navOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <div className="ml-[264px] flex min-w-0 flex-1 flex-col max-[920px]:ml-0">
        {/* Topbar solo visible en móvil */}
        <div className="sticky top-0 z-30 hidden items-center gap-[14px] border-b border-line bg-white px-5 py-[14px] max-[920px]:flex">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Abrir menú"
            className="grid size-10 place-items-center rounded-[10px] border border-line bg-white text-brand"
          >
            <Icon name="hamburger" className="size-5" strokeWidth={2} />
          </button>
          <div className="text-[15px] font-bold text-brand">Talento Humano · UNEXCA</div>
        </div>

        <main className="w-full max-w-[1200px] px-[46px] pb-12 pt-[38px] max-[920px]:px-[22px] max-[920px]:pb-10 max-[920px]:pt-[26px] max-[520px]:px-4 max-[520px]:pb-9 max-[520px]:pt-[22px]">
          {children}
        </main>
      </div>
    </div>
  );
}
