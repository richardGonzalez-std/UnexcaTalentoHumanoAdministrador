"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { calcularPrestaciones } from "../libs/api";
import type { DatosLiquidacionRequest, Desglose } from "../types/prestaciones";
import { MOTIVOS_TERMINACION } from "../types/prestaciones";
import type { Empleado } from "../libs/empleados";
import { EmployeeSearch } from "./EmployeeSearch";
import { Stepper } from "./Stepper";
import { EstimatePanel } from "./EstimatePanel";
import { agregarAlHistorial, obtenerHistorial, type HistorialItem } from "../libs/historial";
import { MoneyInput } from "./MoneyInput";

const PASOS = 4;

export default function PrestacionesForm() {
  const [paso, setPaso] = useState(1);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [fechaEgreso, setFechaEgreso] = useState("");
  const [motivoTerminacion, setMotivoTerminacion] = useState("RENUNCIA");
  const [sueldoTabla, setSueldoTabla] = useState(0);
  const [primas, setPrimas] = useState(0);
  const [esSalarioVariable, setEsSalarioVariable] = useState(false);
  const [promedioSueldoUltimos6Meses, setPromedioSueldoUltimos6Meses] = useState(0);
  const [diasBonoVacacional, setDiasBonoVacacional] = useState(15);
  const [diasAguinaldos, setDiasAguinaldos] = useState(45);
  const [historicoAcumulado, setHistoricoAcumulado] = useState(0);
  const [anticipos, setAnticipos] = useState(0);
  const [otrasDeudas, setOtrasDeudas] = useState(0);
  const [pensionAlimentaria, setPensionAlimentaria] = useState(0);

  const [resultado, setResultado] = useState<number | null>(null);
  const [desglose, setDesglose] = useState<Desglose | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const [compareOn, setCompareOn] = useState(false);
  const [compareResultado, setCompareResultado] = useState<number | null>(null);

  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  useEffect(() => setHistorial(obtenerHistorial()), []);

  // Confirmación efímera del guardado, para que el botón acuse recibo.
  const [guardado, setGuardado] = useState(false);
  useEffect(() => {
    if (!guardado) return;
    const t = setTimeout(() => setGuardado(false), 2500);
    return () => clearTimeout(t);
  }, [guardado]);

  // Un egreso anterior al ingreso da una antigüedad negativa y arrastra toda la
  // liquidación a negativo, así que no se pide la estimación con esas fechas.
  const fechasInvertidas = !!empleado && !!fechaEgreso && fechaEgreso < empleado.fechaIngreso;
  const datosCompletos = !!empleado && !!fechaEgreso && !fechasInvertidas;

  const datos: DatosLiquidacionRequest | null = useMemo(() => {
    if (!empleado || !fechaEgreso || fechaEgreso < empleado.fechaIngreso) return null;
    return {
      empleadoId: empleado.id,
      fechaIngreso: empleado.fechaIngreso,
      fechaEgreso,
      motivoTerminacion,
      sueldoTabla,
      primas,
      esSalarioVariable,
      promedioSueldoUltimos6Meses: esSalarioVariable ? promedioSueldoUltimos6Meses : undefined,
      diasBonoVacacional,
      diasAguinaldos,
      historicoAcumulado,
      anticipos: anticipos || undefined,
      otrasDeudas: otrasDeudas || undefined,
      pensionAlimentaria: pensionAlimentaria || undefined,
    };
  }, [
    empleado,
    fechaEgreso,
    motivoTerminacion,
    sueldoTabla,
    primas,
    esSalarioVariable,
    promedioSueldoUltimos6Meses,
    diasBonoVacacional,
    diasAguinaldos,
    historicoAcumulado,
    anticipos,
    otrasDeudas,
    pensionAlimentaria,
  ]);

  // Estimación en vivo: recalcula contra el backend real (con debounce) cada
  // vez que cambian los datos mínimos requeridos, sin importar en qué paso
  // del wizard esté el usuario.
  useEffect(() => {
    if (!datos) {
      setResultado(null);
      setDesglose(null);
      setErrorApi(null);
      return;
    }
    setCargando(true);
    setErrorApi(null);
    const t = setTimeout(async () => {
      try {
        const r = await calcularPrestaciones(datos);
        setResultado(r.montoFinal);
        setDesglose(r.desglose);
      } catch (err) {
        setErrorApi(err instanceof Error ? err.message : "No se pudo calcular");
        setResultado(null);
        setDesglose(null);
      } finally {
        setCargando(false);
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos]);

  const motivoAlterno = motivoTerminacion === "RENUNCIA" ? "DESPIDO INJUSTIFICADO" : "RENUNCIA";
  const motivoAlternoLabel = MOTIVOS_TERMINACION.find((m) => m.value === motivoAlterno)?.label ?? motivoAlterno;

  useEffect(() => {
    if (!compareOn || !datos) {
      setCompareResultado(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await calcularPrestaciones({ ...datos, motivoTerminacion: motivoAlterno });
        setCompareResultado(r.montoFinal);
      } catch {
        setCompareResultado(null);
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareOn, datos, motivoAlterno]);

  const estado: "vacio" | "error" | "calculando" | "resultado" = !empleado
    ? "vacio"
    : !fechaEgreso || fechasInvertidas
    ? "error"
    : cargando
    ? "calculando"
    : resultado !== null
    ? "resultado"
    : errorApi
    ? "error"
    : "vacio";

  // Distingue el error de datos faltantes del error de la petición al backend,
  // para no mostrar "faltan datos" cuando el formulario ya está completo.
  const errorMensaje = !fechaEgreso
    ? "Ingresa la fecha de egreso para completar la estimación."
    : fechasInvertidas
    ? `La fecha de egreso es anterior al ingreso del empleado (${empleado?.fechaIngreso}).`
    : errorApi ?? "No se pudo completar la estimación.";

  // El monto ya lo tiene la estimación en vivo, que se recalcula con cada cambio
  // y bloquea el botón mientras está en vuelo. Volver a pedirlo aquí repetiría la
  // misma petición para obtener el mismo número: este botón solo registra.
  function handleGuardar() {
    if (resultado === null || !empleado) return;
    setHistorial(
      agregarAlHistorial({ nombreEmpleado: empleado.nombre, motivoTerminacion, montoFinal: resultado })
    );
    setGuardado(true);
  }

  function handleDescargarPDF() {
    window.print();
  }

  return (
    <div className="w-full">
      <Stepper pasoActual={paso} />

      <div className="flex items-start gap-6 max-lg:flex-col">
        <div className="min-w-0 flex-1">
          <div className="rounded-[14px] border border-line bg-white p-6 shadow-card" style={{ minHeight: 300 }}>
            {paso === 1 && (
              <div>
                <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-brand-300">Paso 1 de {PASOS}</div>
                <h2 className="mb-4 text-[16px] font-bold text-ink">Datos del empleado</h2>
                <div className="mb-4">
                  <EmployeeSearch empleado={empleado} onSelect={setEmpleado} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Fecha Egreso">
                    <input
                      type="date"
                      value={fechaEgreso}
                      min={empleado?.fechaIngreso}
                      onChange={(e) => setFechaEgreso(e.target.value)}
                      className={campoClase((!fechaEgreso && !!empleado) || fechasInvertidas)}
                    />
                  </Campo>
                  <Campo label="Motivo Terminación">
                    <select value={motivoTerminacion} onChange={(e) => setMotivoTerminacion(e.target.value)} className={campoClase(false)}>
                      {MOTIVOS_TERMINACION.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </Campo>
                </div>
                {empleado && (!fechaEgreso || fechasInvertidas) && (
                  <div className="mt-4 flex items-center gap-2.5 rounded-[11px] border border-[#f5c6c2] bg-[#fdecea] px-[13px] py-[10px] text-[12px] font-medium text-[#b3261e]">
                    {fechasInvertidas
                      ? `La fecha de egreso no puede ser anterior al ingreso (${empleado.fechaIngreso}).`
                      : "Ingresa la fecha de egreso para continuar."}
                  </div>
                )}
              </div>
            )}

            {paso === 2 && (
              <div>
                <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-brand-300">Paso 2 de {PASOS}</div>
                <h2 className="mb-4 text-[16px] font-bold text-ink">Remuneración</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Sueldo Tabla">
                    <MoneyInput value={sueldoTabla} onChange={setSueldoTabla} />
                  </Campo>
                  <Campo label="Primas">
                    <MoneyInput value={primas} onChange={setPrimas} />
                  </Campo>
                </div>
                <label className="mt-4 flex items-center gap-3 rounded-[10px] bg-canvas p-3 text-sm font-medium text-ink">
                  <input type="checkbox" checked={esSalarioVariable} onChange={(e) => setEsSalarioVariable(e.target.checked)} className="size-4 rounded border-line text-brand-600" />
                  ¿Salario variable?
                </label>
                {esSalarioVariable && (
                  <div className="mt-4">
                    <Campo label="Promedio últimos 6 meses">
                      <MoneyInput value={promedioSueldoUltimos6Meses} onChange={setPromedioSueldoUltimos6Meses} />
                    </Campo>
                  </div>
                )}
              </div>
            )}

            {paso === 3 && (
              <div>
                <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-brand-300">Paso 3 de {PASOS}</div>
                <h2 className="mb-4 text-[16px] font-bold text-ink">Prestaciones</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Días Bono Vacacional" tooltip="Días adicionales pagados por cada año de servicio, para el disfrute vacacional.">
                    <input type="number" min={0} value={diasBonoVacacional} onChange={(e) => setDiasBonoVacacional(Number(e.target.value))} className={campoClase(false)} />
                  </Campo>
                  <Campo label="Días Utilidades" tooltip="Participación en los beneficios de la organización — mínimo 15 días de salario según la LOTTT.">
                    <input type="number" min={0} value={diasAguinaldos} onChange={(e) => setDiasAguinaldos(Number(e.target.value))} className={campoClase(false)} />
                  </Campo>
                </div>
                <div className="mt-4 max-w-[calc(50%-8px)]">
                  <Campo label="Histórico Acumulado" tooltip="Monto en bolívares ya depositado por garantía de prestaciones. Se compara contra el cálculo por antigüedad y se paga el mayor (Art. 142 LOTTT).">
                    <MoneyInput value={historicoAcumulado} onChange={setHistoricoAcumulado} />
                  </Campo>
                </div>
              </div>
            )}

            {paso === 4 && (
              <div>
                <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-brand-300">Paso 4 de {PASOS}</div>
                <h2 className="mb-4 text-[16px] font-bold text-ink">Deducciones</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Campo label="Anticipos">
                    <MoneyInput value={anticipos} onChange={setAnticipos} />
                  </Campo>
                  <Campo label="Otras Deudas">
                    <MoneyInput value={otrasDeudas} onChange={setOtrasDeudas} />
                  </Campo>
                </div>
                <div className="mt-4 max-w-[calc(50%-8px)]">
                  <Campo label="Pensión Alimentaria">
                    <MoneyInput value={pensionAlimentaria} onChange={setPensionAlimentaria} />
                  </Campo>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              type="button"
              disabled={paso === 1}
              onClick={() => setPaso((p) => Math.max(1, p - 1))}
              className="h-[38px] rounded-[9px] border border-line bg-white px-4 text-[12.5px] font-semibold text-brand-600 disabled:cursor-not-allowed disabled:text-[#9aa9bd]"
            >
              Atrás
            </button>
            {paso < PASOS ? (
              <button type="button" onClick={() => setPaso((p) => Math.min(PASOS, p + 1))} className="h-[38px] rounded-[9px] bg-brand-600 px-5 text-[12.5px] font-bold text-white">
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                disabled={cargando || !datosCompletos || resultado === null}
                onClick={handleGuardar}
                className="flex h-[38px] items-center gap-2 rounded-[9px] bg-brand-600 px-5 text-[12.5px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Calculando…
                  </>
                ) : guardado ? (
                  "Guardada en el historial ✓"
                ) : (
                  "Guardar liquidación"
                )}
              </button>
            )}
          </div>
        </div>

        <EstimatePanel
          estado={estado}
          errorMensaje={errorMensaje}
          resultado={resultado}
          desglose={desglose}
          compareOn={compareOn}
          compareResultado={compareResultado}
          compareLabel={motivoAlternoLabel}
          onToggleCompare={() => setCompareOn((v) => !v)}
          onDescargarPDF={handleDescargarPDF}
          historial={historial}
        />
      </div>

      {resultado !== null && empleado && (
        <div className="hidden print:block">
          <h1 className="mb-1 text-2xl font-bold">Liquidación de Prestaciones Sociales</h1>
          <p className="mb-6 text-sm text-ink-soft">
            {empleado.nombre} · {empleado.cedula}
          </p>
          <p className="text-3xl font-black text-brand-600">
            Bs. {resultado.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )}
    </div>
  );
}

function campoClase(error: boolean) {
  return `w-full rounded-[10px] border px-3 py-2 text-sm text-ink transition-[border-color,box-shadow] focus:outline-none focus:ring-4 focus:ring-brand-600/10 ${
    error ? "border-[#e59a94] bg-[#fdecea]" : "border-line bg-white focus:border-brand-600"
  }`;
}

function Campo({ label, tooltip, children }: { label: string; tooltip?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
        {tooltip && <InfoTip texto={tooltip} />}
      </label>
      {children}
    </div>
  );
}

function InfoTip({ texto }: { texto: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setAbierto(true)} onMouseLeave={() => setAbierto(false)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#8aa3c6" strokeWidth={2} className="size-3 cursor-help">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="#8aa3c6" stroke="none" />
      </svg>
      {abierto && (
        <span className="absolute bottom-full left-1/2 z-10 mb-1.5 w-56 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-2 text-[11px] normal-case leading-snug text-white shadow-card-md">
          {texto}
        </span>
      )}
    </span>
  );
}
