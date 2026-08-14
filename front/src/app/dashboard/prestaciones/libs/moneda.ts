// Utilidades para montos en bolívares: redondeo ("normalización") a la unidad
// deseada y formateo con separadores es-VE.

/** Unidad de redondeo: 1 (unidades), 10 (decenas), 100 (centenas), 1000 (miles)… */
export type UnidadRedondeo = 1 | 10 | 100 | 1000 | 10000 | 100000;

/**
 * Redondea `monto` al múltiplo más cercano de `unidad`.
 * Ej.: redondearA(12 345,67, 100) → 12 300 ; redondearA(12 355, 100) → 12 400.
 */
export function redondearA(monto: number, unidad: UnidadRedondeo): number {
  if (!Number.isFinite(monto) || unidad <= 0) return monto;
  return Math.round(monto / unidad) * unidad;
}

/** Redondeo a la decena más cercana (múltiplos de 10). */
export const aDecenas = (monto: number): number => redondearA(monto, 10);

/** Redondeo a la centena más cercana (múltiplos de 100). */
export const aCentenas = (monto: number): number => redondearA(monto, 100);

/** Redondeo al millar más cercano (múltiplos de 1000). */
export const aMiles = (monto: number): number => redondearA(monto, 1000);

/**
 * Limita un monto a `decimales` posiciones (por defecto 2, céntimos de Bs.).
 * NO redondea a decenas/centenas: conserva la cifra tal cual, solo acota los
 * decimales. Ej.: limitarDecimales(1234.567) → 1234.57.
 */
export function limitarDecimales(monto: number, decimales = 2): number {
  if (!Number.isFinite(monto)) return monto;
  const factor = 10 ** decimales;
  return Math.round(monto * factor) / factor;
}

/**
 * Normaliza un monto en Bs. escogiendo automáticamente la unidad de redondeo
 * según su magnitud, para presentar cifras "redondas":
 *   < 1.000        → unidades
 *   1.000–9.999    → decenas
 *   10.000–99.999  → centenas
 *   ≥ 100.000      → miles
 */
export function normalizarBs(monto: number): number {
  if (!Number.isFinite(monto)) return monto;
  const abs = Math.abs(monto);
  if (abs >= 100000) return redondearA(monto, 1000);
  if (abs >= 10000) return redondearA(monto, 100);
  if (abs >= 1000) return redondearA(monto, 10);
  return Math.round(monto);
}

/**
 * Formatea un monto en bolívares con separadores es-VE.
 * Con `decimales = 0` queda ideal para mostrar montos ya normalizados.
 */
export function formatearBs(monto: number, decimales = 2): string {
  return `Bs. ${monto.toLocaleString("es-VE", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}`;
}
