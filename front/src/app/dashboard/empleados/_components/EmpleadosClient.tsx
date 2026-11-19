"use client";

import { useState, useEffect, useCallback } from "react";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Empleado {
  id: number;
  primerNombre: string;
  segundoNombre: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  cedula: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  cargo: string | null;
  tipoPersonal: "DOCENTE" | "ADMINISTRATIVO" | null;
  fechaIngreso: string | null;
  activo: boolean;
  iniciales: string;
}

type Filtro = "all" | "DOCENTE" | "ADMINISTRATIVO" | "inactive";

interface FormData {
  primerNombre: string;
  segundoNombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  cedula: string;
  correo: string;
  telefono: string;
  direccion: string;
  cargo: string;
  tipoPersonal: "DOCENTE" | "ADMINISTRATIVO";
  fechaIngreso: string;
  activo: boolean;
}

const FORM_VACÍO: FormData = {
  primerNombre: "",
  segundoNombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  cedula: "",
  correo: "",
  telefono: "",
  direccion: "",
  cargo: "",
  tipoPersonal: "DOCENTE",
  fechaIngreso: "",
  activo: true,
};

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function fmtFecha(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${parseInt(day)} ${MESES[parseInt(m) - 1]}. ${y}`;
}

function nombreCompleto(e: Empleado) {
  return `${e.primerNombre} ${e.apellidoPaterno}`;
}

// ── Componente principal ─────────────────────────────────────────────────────

export function EmpleadosClient() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("all");
  const [busqueda, setBusqueda] = useState("");

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(FORM_VACÍO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Carga de datos ──────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/empleados/lista");
      if (res.ok) setEmpleados(await res.json());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtrado ────────────────────────────────────────────────────────────

  const filas = empleados.filter((e) => {
    if (filtro === "DOCENTE" && e.tipoPersonal !== "DOCENTE") return false;
    if (filtro === "ADMINISTRATIVO" && e.tipoPersonal !== "ADMINISTRATIVO") return false;
    if (filtro === "inactive" && e.activo) return false;
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      return (
        nombreCompleto(e).toLowerCase().includes(q) ||
        e.cedula.toLowerCase().includes(q) ||
        (e.cargo ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: empleados.length,
    docentes: empleados.filter((e) => e.tipoPersonal === "DOCENTE").length,
    administrativos: empleados.filter((e) => e.tipoPersonal === "ADMINISTRATIVO").length,
    inactivos: empleados.filter((e) => !e.activo).length,
  };

  // ── Drawer ──────────────────────────────────────────────────────────────

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_VACÍO);
    setError(null);
    setDrawerAbierto(true);
  }

  function abrirEditar(e: Empleado) {
    setEditandoId(e.id);
    setForm({
      primerNombre: e.primerNombre ?? "",
      segundoNombre: e.segundoNombre ?? "",
      apellidoPaterno: e.apellidoPaterno ?? "",
      apellidoMaterno: e.apellidoMaterno ?? "",
      cedula: e.cedula ?? "",
      correo: e.correo ?? "",
      telefono: e.telefono ?? "",
      direccion: e.direccion ?? "",
      cargo: e.cargo ?? "",
      tipoPersonal: e.tipoPersonal === "ADMINISTRATIVO" ? "ADMINISTRATIVO" : "DOCENTE",
      fechaIngreso: e.fechaIngreso ?? "",
      activo: e.activo,
    });
    setError(null);
    setDrawerAbierto(true);
  }

  function cerrarDrawer() {
    setDrawerAbierto(false);
  }

  function setField<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function guardar() {
    if (!form.primerNombre.trim() || !form.apellidoPaterno.trim() || !form.cedula.trim() || !form.correo.trim()) {
      setError("Los campos marcados con * son obligatorios.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        ...form,
        fechaIngreso: form.fechaIngreso || null,
      };
      let res: Response;
      if (editandoId === null) {
        res = await fetch("/api/empleados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/empleados/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Error al guardar. Verificá los datos.");
        return;
      }
      cerrarDrawer();
      await cargar();
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(e: Empleado) {
    try {
      const res = await fetch(`/api/empleados/${e.id}/activo`, { method: "PATCH" });
      if (res.ok) {
        const actualizado: Empleado = await res.json();
        setEmpleados((prev) => prev.map((x) => (x.id === e.id ? actualizado : x)));
      }
    } catch {}
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-brand-300">
            Panel principal › Empleados
          </div>
          <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold tracking-[-0.5px] text-ink">
            Empleados
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-bold text-brand-600">
              {stats.total}
            </span>
          </h1>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-1.5 rounded-[9px] bg-brand px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo empleado
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 flex flex-wrap gap-2.5">
        {(
          [
            { key: "all", label: "Total", num: stats.total, icon: "people" },
            { key: "DOCENTE", label: "Docentes", num: stats.docentes, icon: "cap" },
            { key: "ADMINISTRATIVO", label: "Administrativos", num: stats.administrativos, icon: "work" },
            { key: "inactive", label: "Inactivos", num: stats.inactivos, icon: "off" },
          ] as const
        ).map(({ key, label, num, icon }) => (
          <button
            key={key}
            onClick={() => setFiltro(key)}
            className={`flex min-w-[112px] items-center gap-2.5 rounded-[11px] border px-3.5 py-2.5 text-left shadow-card transition-all ${
              filtro === key
                ? "border-brand shadow-[0_0_0_3px_rgba(0,46,107,0.07),var(--shadow-card)]"
                : "border-line bg-white hover:border-brand-300"
            }`}
            style={{ background: filtro === key ? "white" : undefined }}
          >
            <div
              className={`grid size-8 shrink-0 place-items-center rounded-[8px] transition-colors ${
                filtro === key ? "bg-brand text-white" : "bg-accent-soft text-brand"
              }`}
            >
              <StatIcon name={icon} />
            </div>
            <div>
              <div className="text-[17px] font-extrabold tabular-nums text-ink">{num}</div>
              <div className="text-[11px] font-medium text-ink-soft">{label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="mb-3.5">
        <div className="relative max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o cargo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 w-full rounded-[9px] border border-line bg-white py-0 pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-brand-300 focus:border-brand-300 focus:ring-2 focus:ring-brand/[0.07]"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-[13px] border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                {["Empleado", "Cédula", "Tipo", "Cargo", "Fecha ingreso", "Estado", ""].map((h) => (
                  <th
                    key={h}
                    className="border-b border-line bg-canvas px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.04em] text-ink-soft"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-ink-soft">
                    Cargando empleados…
                  </td>
                </tr>
              ) : filas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-ink-soft">
                    No se encontraron empleados.
                  </td>
                </tr>
              ) : (
                filas.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0 hover:bg-canvas">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="grid size-[34px] shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                          style={{ background: "linear-gradient(168deg,#002e6b,#2b3d4f)" }}
                        >
                          {e.iniciales}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-ink">{nombreCompleto(e)}</div>
                          <div className="text-[11px] text-ink-soft">{e.cargo ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] tabular-nums text-ink-soft">{e.cedula}</td>
                    <td className="px-4 py-3">
                      {e.tipoPersonal ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            e.tipoPersonal === "DOCENTE"
                              ? "bg-accent-soft text-brand"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {e.tipoPersonal === "DOCENTE" ? "Docente" : "Administrativo"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-ink-soft">{e.cargo ?? "—"}</td>
                    <td className="px-4 py-3 text-[12px] tabular-nums text-ink-soft">{fmtFecha(e.fechaIngreso)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          e.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {e.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => abrirEditar(e)}
                          title="Editar"
                          className="grid size-[30px] place-items-center rounded-[7px] border border-line text-ink-soft transition-all hover:border-brand-300 hover:bg-accent-soft hover:text-brand"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleActivo(e)}
                          title={e.activo ? "Desactivar" : "Activar"}
                          className={`grid size-[30px] place-items-center rounded-[7px] border border-line text-ink-soft transition-all ${
                            e.activo
                              ? "hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                              : "hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                          }`}
                        >
                          {e.activo ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                              <line x1="22" y1="2" x2="2" y2="22" />
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                              <polyline points="16 11 18 13 22 9" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3 text-[12px] text-ink-soft">
          {filas.length === empleados.length
            ? `${empleados.length} empleados`
            : `${filas.length} de ${empleados.length} empleados`}
        </div>
      </div>

      {/* Overlay + Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-[rgba(13,20,32,0.5)] transition-opacity ${
          drawerAbierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={cerrarDrawer}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-card-lg transition-transform duration-200 ${
          drawerAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera drawer */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 pb-3.5 pt-5">
          <div className="text-[15px] font-bold text-ink">
            {editandoId === null ? "Nuevo empleado" : "Editar empleado"}
          </div>
          <button
            onClick={cerrarDrawer}
            className="grid size-8 place-items-center rounded-[8px] border border-line text-ink-soft transition-all hover:border-brand-300 hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Cuerpo drawer */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          {/* Datos personales */}
          <fieldset>
            <legend className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-brand-300">
              Datos personales
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primer nombre *" value={form.primerNombre} onChange={(v) => setField("primerNombre", v)} placeholder="Ej. Ana" />
              <Field label="Segundo nombre" value={form.segundoNombre} onChange={(v) => setField("segundoNombre", v)} placeholder="Ej. María" />
              <Field label="Apellido paterno *" value={form.apellidoPaterno} onChange={(v) => setField("apellidoPaterno", v)} placeholder="Ej. López" />
              <Field label="Apellido materno" value={form.apellidoMaterno} onChange={(v) => setField("apellidoMaterno", v)} placeholder="Ej. Pérez" />
              <Field label="Cédula *" value={form.cedula} onChange={(v) => setField("cedula", v)} placeholder="V-12.345.678" colSpan />
            </div>
          </fieldset>

          {/* Datos laborales */}
          <fieldset>
            <legend className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-brand-300">
              Datos laborales
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="mb-1.5 text-[11.5px] font-semibold text-ink-soft">Tipo de personal *</div>
                <div className="flex gap-2">
                  {(["DOCENTE", "ADMINISTRATIVO"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setField("tipoPersonal", t)}
                      className={`flex flex-1 items-center gap-2 rounded-[8px] border-[1.5px] px-3 py-2 transition-all ${
                        form.tipoPersonal === t
                          ? t === "DOCENTE"
                            ? "border-brand bg-accent-soft"
                            : "border-purple-600 bg-purple-50"
                          : "border-line"
                      }`}
                    >
                      <span
                        className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          form.tipoPersonal === t
                            ? t === "DOCENTE"
                              ? "border-brand bg-brand"
                              : "border-purple-600 bg-purple-600"
                            : "border-line"
                        }`}
                      >
                        {form.tipoPersonal === t && (
                          <span className="block size-[5px] rounded-full bg-white" />
                        )}
                      </span>
                      <span className="text-[12.5px] font-semibold text-ink">
                        {t === "DOCENTE" ? "Docente" : "Administrativo"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Cargo" value={form.cargo} onChange={(v) => setField("cargo", v)} placeholder="Ej. Matemáticas" />
              <Field label="Fecha de ingreso" value={form.fechaIngreso} onChange={(v) => setField("fechaIngreso", v)} type="date" />
              <div className="col-span-2 flex items-center justify-between rounded-[8px] border border-line bg-canvas px-3 py-2.5">
                <div>
                  <div className="text-[12.5px] font-semibold text-ink">Empleado activo</div>
                  <div className="text-[11px] text-ink-soft">Desactivar lo excluye de búsquedas</div>
                </div>
                <button
                  type="button"
                  onClick={() => setField("activo", !form.activo)}
                  className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors ${
                    form.activo ? "bg-brand" : "bg-line"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                      form.activo ? "translate-x-[18px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </fieldset>

          {/* Contacto */}
          <fieldset>
            <legend className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-brand-300">
              Contacto
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Correo electrónico *" value={form.correo} onChange={(v) => setField("correo", v)} placeholder="ana@unexca.edu.ve" type="email" colSpan />
              <Field label="Teléfono" value={form.telefono} onChange={(v) => setField("telefono", v)} placeholder="0414-1234567" />
              <Field label="Dirección" value={form.direccion} onChange={(v) => setField("direccion", v)} placeholder="Ej. Caracas, Miranda" />
            </div>
          </fieldset>

          {error && (
            <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Pie drawer */}
        <div className="flex shrink-0 justify-end gap-2.5 border-t border-line px-6 py-3.5">
          <button
            onClick={cerrarDrawer}
            className="rounded-[9px] border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft transition-all hover:border-brand-300 hover:text-ink"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-1.5 rounded-[9px] bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {guardando ? (
              "Guardando…"
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Guardar empleado
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente auxiliar de campo ─────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  colSpan,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "col-span-2" : ""}>
      <label className="mb-1 block text-[11.5px] font-semibold text-ink-soft">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-[8px] border border-line bg-canvas px-3 text-[13px] text-ink outline-none placeholder:text-brand-300 focus:border-brand-300 focus:ring-2 focus:ring-brand/[0.07]"
      />
    </div>
  );
}

// ── Iconos de stats ──────────────────────────────────────────────────────────

function StatIcon({ name }: { name: string }) {
  if (name === "people")
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    );
  if (name === "cap")
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  if (name === "work")
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    );
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="22" y1="2" x2="2" y2="22" />
    </svg>
  );
}
