import { redirect } from "next/navigation";
import { DashboardShell } from "../_components/DashboardShell";
import { obtenerUsuario } from "../libs/session";
import PrestacionesForm from "./_components/PrestacionesForm";

export const metadata = {
  title: "Cálculo de Prestaciones Sociales · Talento Humano",
};

export default async function PrestacionesPage() {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/");

  return (
    <DashboardShell usuario={usuario}>
      <div className="mb-8">
        <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-brand-600">
          Talento Humano / Prestaciones
        </div>
        <h1 className="text-[26px] font-extrabold tracking-[-0.4px] text-ink">Cálculo de Prestaciones Sociales</h1>
        <p className="mt-1 text-sm text-ink-soft">Liquidación conforme a la LOTTT, con estimación en vivo.</p>
      </div>

      <PrestacionesForm />
    </DashboardShell>
  );
}
