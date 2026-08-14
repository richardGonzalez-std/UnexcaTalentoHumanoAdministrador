"use client";

import { useState } from "react";
import { buscarEmpleados, type Empleado } from "../libs/empleados";

export function EmployeeSearch({
  empleado,
  onSelect,
}: {
  empleado: Empleado | null;
  onSelect: (empleado: Empleado | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const resultados = buscarEmpleados(query);

  if (empleado) {
    return (
      <div className="flex items-center gap-3 rounded-[11px] border border-line bg-white p-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
          style={{ background: "linear-gradient(168deg,#002e6b,#2b3d4f)" }}
        >
          {empleado.iniciales}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold text-ink">{empleado.nombre}</div>
          <div className="truncate text-[11.5px] text-ink-soft">
            {empleado.cedula} · {empleado.cargo} · Ingresó el{" "}
            {new Date(empleado.fechaIngreso).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="text-[12px] font-semibold text-brand-600 hover:text-brand">
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex h-10 items-center gap-2 rounded-[10px] border border-line bg-canvas px-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="#9aa9bd" strokeWidth={1.9} className="size-4 shrink-0">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M20 20l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Buscar por nombre o cédula…"
          className="w-full bg-transparent text-[13px] text-ink placeholder-[#9aa9bd] focus:outline-none"
        />
      </div>
      {open && resultados.length > 0 && (
        <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-[10px] border border-line bg-white shadow-card-md">
          {resultados.map((e) => (
            <button
              key={e.id}
              type="button"
              onMouseDown={() => {
                onSelect(e);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-canvas"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[9.5px] font-bold text-brand-600">
                {e.iniciales}
              </span>
              <span className="text-[12px] font-semibold text-ink">{e.nombre}</span>
              <span className="ml-auto shrink-0 text-[11px] text-ink-soft">{e.cedula}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
