"use client";

import { useEffect, useState } from "react";
import { limitarDecimales } from "../libs/moneda";

/**
 * Input de monto en bolívares. Muestra el signo "Bs." dentro del campo y, con
 * un debounce mientras se escribe, limita el valor a 2 decimales (céntimos),
 * sin alterar la magnitud de la cifra.
 */
export function MoneyInput({
  value,
  onChange,
  delay = 700,
}: {
  value: number;
  onChange: (n: number) => void;
  delay?: number;
}) {
  const [texto, setTexto] = useState(value ? String(value) : "");

  // Refleja cambios externos del valor (reset, normalización remota, etc.).
  useEffect(() => {
    if (Number(texto) !== value) setTexto(value ? String(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Normalización con debounce: se dispara cuando el usuario deja de escribir.
  useEffect(() => {
    if (texto === "") return;
    const n = Number(texto);
    if (Number.isNaN(n)) return;
    const t = setTimeout(() => {
      const norm = limitarDecimales(n);
      if (norm !== n) {
        setTexto(String(norm));
        onChange(norm);
      }
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, delay]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-soft">
        Bs.
      </span>
      <input
        type="number"
        min={0}
        step="0.01"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          onChange(Number(e.target.value));
        }}
        className="w-full rounded-[10px] border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink transition-[border-color,box-shadow] focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
      />
    </div>
  );
}
