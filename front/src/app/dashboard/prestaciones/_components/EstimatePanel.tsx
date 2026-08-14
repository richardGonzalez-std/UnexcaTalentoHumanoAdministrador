"use client";

import { useState } from "react";
import type { HistorialItem } from "../libs/historial";
import type { Desglose } from "../types/prestaciones";
import { formatearBs as fmt } from "../libs/moneda";

type Estado = "vacio" | "error" | "calculando" | "resultado";

export function EstimatePanel({
  estado,
  errorMensaje,
  resultado,
  desglose,
  compareOn,
  compareResultado,
  compareLabel,
  onToggleCompare,
  onDescargarPDF,
  historial,
}: {
  estado: Estado;
  errorMensaje: string;
  resultado: number | null;
  desglose: Desglose | null;
  compareOn: boolean;
  compareResultado: number | null;
  compareLabel: string;
  onToggleCompare: () => void;
  onDescargarPDF: () => void;
  historial: HistorialItem[];
}) {
  const [historialAbierto, setHistorialAbierto] = useState(false);

  return (
    <div className="w-[320px] shrink-0 rounded-[14px] border border-line bg-white p-[18px] print:hidden max-lg:w-full">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-ink-soft">Estimación en vivo</div>

      {estado === "vacio" && (
        <>
          <div className="mb-3 space-y-2">
            <div className="h-[11px] w-[88%] rounded bg-[#eef1f6]" />
            <div className="h-[11px] w-[65%] rounded bg-[#eef1f6]" />
            <div className="h-[11px] w-[75%] rounded bg-[#eef1f6]" />
          </div>
          <p className="text-[12px] leading-relaxed text-[#9aa9bd]">
            Selecciona el empleado e ingresa la fecha de egreso para ver la estimación.
          </p>
        </>
      )}

      {estado === "error" && (
        <>
          <div className="mb-3 flex items-start gap-2 rounded-[10px] border border-[#f5c6c2] bg-[#fdecea] p-[10px_11px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b3261e" strokeWidth={1.8} className="mt-px size-3.5 shrink-0">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
            </svg>
            <span className="text-[11.5px] font-medium text-[#b3261e]">{errorMensaje}</span>
          </div>
          <div className="space-y-2">
            <div className="h-[11px] w-[88%] rounded bg-[#eef1f6]" />
            <div className="h-[11px] w-[65%] rounded bg-[#eef1f6]" />
          </div>
        </>
      )}

      {estado === "calculando" && (
        <div className="flex flex-col items-center gap-3 py-7">
          <span className="size-6 animate-spin rounded-full border-[3px] border-line border-t-brand-600" />
          <div className="text-[11.5px] font-semibold text-ink-soft">Actualizando estimación…</div>
        </div>
      )}

      {estado === "resultado" && resultado !== null && desglose && (
        <>
          <div className="mb-2.5 space-y-1.5">
            <Fila label="Antigüedad" valor={fmt(desglose.prestacionAntiguedad)} />
            <Fila label="Bono vacacional" valor={fmt(desglose.bonoVacacional)} />
            <Fila label="Utilidades" valor={fmt(desglose.utilidades)} />
            {desglose.indemnizacion > 0 && <Fila label="Indemnización" valor={fmt(desglose.indemnizacion)} />}
            {desglose.totalDeducciones > 0 && <Fila label="Deducciones" valor={`− ${fmt(desglose.totalDeducciones)}`} />}
          </div>
          <div className="mb-2.5 flex h-[7px] overflow-hidden rounded">
            <Segmento base={desglose.prestacionAntiguedad} total={desglose.totalAsignaciones} color="#00337c" />
            <Segmento base={desglose.bonoVacacional} total={desglose.totalAsignaciones} color="#3a6cc4" />
            <Segmento base={desglose.utilidades} total={desglose.totalAsignaciones} color="#8aa3c6" />
            <Segmento base={desglose.indemnizacion} total={desglose.totalAsignaciones} color="#c5d5eb" />
          </div>
          <div className="mb-3 border-t-2 border-[#eef1f6] pt-2.5">
            <div className="text-[9.5px] font-bold uppercase text-ink-soft">Monto Neto</div>
            <div className="text-[21px] font-extrabold text-brand-600">{fmt(resultado)}</div>
          </div>

          {/* Art. 142 LOTTT: cuando la garantía ya depositada supera al cálculo por
              antigüedad, el bruto es exactamente ese histórico y el salario deja de
              incidir. Sin este aviso, el panel parece congelado al editar el sueldo. */}
          {desglose.baseAplicada === "HISTORICO" && (
            <div className="mb-2.5 rounded-[10px] border border-[#f1e3b8] bg-[#fbf3da] px-2.5 py-2 text-[10.5px] leading-snug text-[#8a6d1e]">
              Base aplicada: <strong>garantía histórica</strong> ({fmt(desglose.baseHistorico)}), mayor
              al cálculo por antigüedad ({fmt(desglose.baseCalculada)}) — Art. 142 LOTTT. Mientras
              gane el histórico, cambiar sueldo o primas no altera el monto.
            </div>
          )}

          {compareOn && compareResultado !== null && (
            <div className="mb-2.5 flex items-center justify-between rounded-lg bg-canvas px-2.5 py-2">
              <span className="text-[10.5px] font-semibold text-ink-soft">{compareLabel}</span>
              <span className="text-[11.5px] font-bold text-brand-600">{fmt(compareResultado)}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={onToggleCompare} className="h-8 rounded-lg border border-[#c5d5eb] bg-white text-[11px] font-semibold text-brand-600">
              {compareOn ? "Ocultar comparación" : "Comparar escenarios"}
            </button>
            <button type="button" onClick={onDescargarPDF} className="h-8 rounded-lg border-none bg-brand-600 text-[11px] font-semibold text-white">
              Descargar PDF
            </button>
            <button type="button" onClick={() => setHistorialAbierto((v) => !v)} className="h-8 rounded-lg border border-line bg-white text-[11px] font-semibold text-ink-soft">
              {historialAbierto ? "Ocultar historial" : "Ver historial"}
            </button>
          </div>

          {historialAbierto && (
            <div className="mt-2.5 space-y-1 border-t border-[#eef1f6] pt-2.5">
              {historial.slice(0, 4).map((h) => (
                <div key={h.id} className="flex justify-between text-[11px]">
                  <span className="font-semibold text-ink">{h.nombreEmpleado}</span>
                  <span className="text-ink-soft">{fmt(h.montoFinal)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between text-[11.5px] text-ink">
      <span>{label}</span>
      <span className="font-semibold">{valor}</span>
    </div>
  );
}

function Segmento({ base, total, color }: { base: number; total: number; color: string }) {
  const pct = total > 0 ? (base / total) * 100 : 0;
  return <div style={{ width: `${pct}%`, background: color }} />;
}
