# Spec de reemplazo y acoplamiento — Refactor de Prestaciones Sociales

> Ámbito: `front/src/app/dashboard/prestaciones/`
> Estado: los archivos del refactor ya están copiados en el repo (working tree, sin commitear).
> Fecha: 2026-07-27

## 1. Resumen

El refactor sustituye el formulario de una sola pantalla por un **wizard de 4 pasos con
estimación en vivo**. Conserva intactos el contrato de API (`libs/api.ts`) y los tipos
(`types/prestaciones.ts`), y añade **6 archivos nuevos** con funciones/acciones que hoy no
existen en la página de prestaciones.

| Archivo | Acción |
|---|---|
| `page.tsx` | **Reemplazado** (encabezado con estilos Tailwind + tokens; sin lógica nueva) |
| `libs/api.ts` | **Sin cambios** (idéntico) |
| `types/prestaciones.ts` | **Sin cambios** (idéntico) |
| `_components/PrestacionesForm.tsx` | **Reemplazado** (wizard + estimación en vivo) |
| `_components/Stepper.tsx` | **Nuevo** |
| `_components/EmployeeSearch.tsx` | **Nuevo** |
| `_components/EstimatePanel.tsx` | **Nuevo** |
| `libs/empleados.ts` | **Nuevo** (directorio mock + `buscarEmpleados`) |
| `libs/estimador.ts` | **Nuevo** (`estimarDesglose`) |
| `libs/historial.ts` | **Nuevo** (`obtenerHistorial` / `agregarAlHistorial`) |

Dependencias verificadas: los tokens de diseño usados (`brand-600`, `brand-300`, `canvas`,
`accent-soft`, `shadow-card-md`, `ink`, `ink-soft`, `line`) existen en el `@theme` de Tailwind v4
en `front/src/app/globals.css`. `DashboardShell` y `libs/session.ts` ya existían.

## 2. Funciones y acciones nuevas (no presentes en la página actual)

### 2.1 Wizard de 4 pasos — `Stepper.tsx` + `PrestacionesForm.tsx`
Reemplaza la grilla de 4 tarjetas simultáneas por un flujo paso a paso: **Empleado →
Remuneración → Prestaciones → Deducciones**, con navegación Atrás/Siguiente y barra de
progreso con marca de pasos completados.

### 2.2 Estimación en vivo (auto-cálculo con debounce) — `PrestacionesForm.tsx`
En lugar del `submit` manual, un `useEffect` recalcula automáticamente contra el backend real
(`calcularPrestaciones`) con **debounce de 500 ms** cada vez que cambian los datos mínimos
(`empleado` + `fechaEgreso`), sin importar el paso actual. Estados derivados:
`vacio | error | calculando | resultado`.
- **Cambio de semántica importante:** el botón final "Calcular Prestaciones" ya **no dispara el
  cálculo** (que es automático); ahora ejecuta `handleGuardarEnHistorial`, es decir, guarda el
  resultado en el historial.

### 2.3 Búsqueda de empleados — `EmployeeSearch.tsx` + `libs/empleados.ts`
`buscarEmpleados(query)` filtra por nombre o cédula sobre un **directorio mock** (`EMPLEADOS`,
5 registros). Al seleccionar un empleado se muestra su tarjeta (iniciales, cédula, cargo, fecha
de ingreso).
- **Cambio de datos:** `empleadoId` y `fechaIngreso` ya **no se capturan a mano**; se derivan del
  empleado seleccionado (`empleado.id`, `empleado.fechaIngreso`).

### 2.4 Panel de estimación — `EstimatePanel.tsx`
Panel lateral con: desglose por partidas (antigüedad, intereses, bono vacacional, utilidades),
barra apilada de composición, monto neto destacado, y **3 acciones**:
- **Comparar escenarios** (2.6)
- **Descargar PDF** (2.7)
- **Ver historial** (2.8)

### 2.5 Estimador de desglose — `libs/estimador.ts`
`estimarDesglose(datos, montoFinal)`: **heurística de cliente** que reparte el `montoFinal` del
backend entre las partidas LOTTT usando los datos del formulario como peso relativo.
Es solo visualización; el backend hoy solo devuelve el monto final.

### 2.6 Comparación de escenarios — `PrestacionesForm.tsx`
Al activar "Comparar", un segundo `useEffect` recalcula con el **motivo de terminación alterno**
(RENUNCIA ⇄ DESPIDO INJUSTIFICADO) y muestra ambos montos. Emite un POST adicional al backend.

### 2.7 Descargar PDF — `PrestacionesForm.tsx`
`handleDescargarPDF` → `window.print()`, con un bloque `print:block` oculto que renderiza
nombre, cédula y monto para la impresión/PDF.

### 2.8 Historial — `libs/historial.ts`
`obtenerHistorial` / `agregarAlHistorial`: persistencia en **`localStorage`** (clave
`th_prestaciones_historial`, máx. 8 registros) con datos **SEED** de ejemplo. Se muestra en el
panel y se alimenta al pulsar "Calcular Prestaciones".

## 3. Puntos de acoplamiento (mock → backend)

Estos son los puntos que hoy usan datos simulados y deben conectarse al backend. Cada archivo ya
documenta la sustitución esperada en comentarios.

| # | Origen mock | Reemplazo objetivo | Impacto |
|---|---|---|---|
| A | `libs/empleados.ts` (`EMPLEADOS`, `buscarEmpleados`) | `GET /api/empleados?q=` | Pendiente. `empleadoId` y `fechaIngreso` provienen del directorio; con mock solo funcionan ids 1–5. Mantener la forma `Empleado` como contrato. |
| B | `libs/historial.ts` (`localStorage` + `SEED`) | `GET`/`POST /api/prestaciones/historial` | Pendiente. Persistencia real por usuario/servidor en vez de navegador. |
| C | ~~`libs/estimador.ts` (`estimarDesglose`)~~ | **✅ HECHO — desglose real desde el backend** | Ver §6. |
| D | `libs/api.ts` (`POST /api/prestaciones/calcular`) | **Ya real** | Ahora devuelve `{ montoFinal, desglose }`. |

## 6. Acoplamiento C — desglose real (implementado)

El backend ahora devuelve el desglose calculado en el mismo `POST /api/prestaciones/calcular`,
y el frontend lo consume directamente. La heurística de cliente `libs/estimador.ts` fue
**eliminada**.

**Backend** (`back/.../prestaciones/`):
- `Desglose.java` (record) y `ResultadoLiquidacion.java` (record `{ montoFinal, desglose }`) nuevos.
- `PrestacionService.calcularPrestacionesSociales` ahora retorna `ResultadoLiquidacion`.
- `PrestacionController` retorna `ResultadoLiquidacion` (antes `Double`).
- El `montoFinal` es **numéricamente idéntico** al anterior; solo se agregó el desglose.

**Descomposición** (exacta, sin números inventados): el bruto (garantía de prestaciones,
`montoBasePrestaciones`) se reparte según la incidencia de cada partida en el salario integral
diario, de modo que las partidas suman exactamente el bruto:
```
prestacionAntiguedad + bonoVacacional + utilidades + indemnizacion == totalAsignaciones
montoFinal == totalAsignaciones − totalDeducciones
```
- `indemnizacion` = base adicional del Art. 92 LOTTT cuando el motivo duplica (0 en otros casos).
- `otrasDeudas` en el desglose refleja el descuento **efectivamente aplicado** (con tope legal 50 %).

**Frontend**:
- `types/prestaciones.ts`: nueva interfaz `Desglose` y `PrestacionesResult` extendido.
- `libs/api.ts`: parsea el objeto completo (`{ montoFinal, desglose }`).
- `_components/EstimatePanel.tsx`: filas Antigüedad / Bono vacacional / Utilidades, e
  Indemnización + Deducciones condicionales; barra apilada sobre `totalAsignaciones`.
- `_components/PrestacionesForm.tsx`: usa `r.desglose` (sin heurística).
- `libs/estimador.ts`: **eliminado**.

Validado: `./gradlew compileJava` OK y `tsc --noEmit` OK.

### Contrato final de la respuesta
```ts
export interface Desglose {
  prestacionAntiguedad: number; bonoVacacional: number; utilidades: number;
  indemnizacion: number; totalAsignaciones: number;
  anticipos: number; otrasDeudas: number; pensionAlimentaria: number; totalDeducciones: number;
}
export interface PrestacionesResult { montoFinal: number; desglose: Desglose; }
```

## 7. Correcciones adicionales

- **403 en el cálculo (bug "faltan datos"):** el backend exige el JWT en la cookie httpOnly
  `token` y valida vía `JwtCookieFilter`. Llamar al backend **directamente desde el navegador**
  (cross-origin a `:8080`) devolvía **403** porque la cookie no viajaba en esa llamada; el panel
  entraba en estado de error mostrando el mensaje genérico "faltan datos" aunque el formulario
  estuviera completo. Solución (mismo patrón que `dashboard/libs/session.ts`, que ya habla con el
  backend desde el servidor):
  - **`app/api/prestaciones/calcular/route.ts` (nuevo):** route handler `POST` que lee la cookie
    `token` con `cookies()` y **reenvía** la petición al backend, propagando el status.
  - **`libs/api.ts`:** vuelve a la ruta **relativa** `/api/prestaciones/calcular` (mismo origen →
    pega contra el route handler, sin CORS ni cookie cross-origin). *(Reemplaza el intento previo
    de usar `${NEXT_PUBLIC_API_URL}` directo, que era la causa del 403.)*
- **Mensaje de error diferenciado:** `EstimatePanel` recibe `errorMensaje`; el formulario distingue
  "falta la fecha de egreso" del error real de la petición, en vez de mostrar siempre "faltan datos".
- **Botón "Calcular Prestaciones":** `handleCalcularYGuardar` **calcula explícitamente** contra el
  backend, muestra el resultado/errores y guarda en el historial (antes solo guardaba en silencio
  si ya había resultado).
- **`libs/moneda.ts` (nuevo):** utilidades de bolívares — `limitarDecimales(monto, dec = 2)`
  (acota a céntimos sin cambiar la magnitud), `formatearBs`, y helpers de redondeo por magnitud
  `redondearA` / `aDecenas` / `aCentenas` / `aMiles` / `normalizarBs` (disponibles, pero **no** se
  aplican a los inputs porque aproximaban a enteros). `EstimatePanel` usa `formatearBs`.
- **`_components/MoneyInput.tsx` (nuevo):** input reutilizable para montos en Bs. Muestra el
  signo **"Bs."** dentro del campo y, **con debounce mientras se escribe** (700 ms tras dejar de
  teclear), **limita el valor a 2 decimales** vía `limitarDecimales`. Los 7 inputs monetarios del
  formulario (Sueldo Tabla, Primas, Promedio 6 meses, Histórico Acumulado, Anticipos, Otras
  Deudas, Pensión Alimentaria) usan este componente; los campos de "días" no son moneda y quedan
  como estaban.

## 4. Riesgos / a validar antes de dar por cerrado

1. **Carga al backend:** la estimación en vivo emite un POST por cada cambio (debounce 500 ms),
   y otro más cuando "Comparar" está activo. Confirmar que `/api/prestaciones/calcular` tolera
   la frecuencia; si no, subir el debounce o cachear por firma de `datos`.
2. **`fechaIngreso` real:** al derivarse del directorio mock, un empleado real no aparecerá hasta
   implementar el acoplamiento A. Es bloqueante para uso productivo.
3. **Semántica del botón final:** documentar/validar con negocio que "Calcular Prestaciones" ahora
   **guarda en historial** (el cálculo es automático). Considerar renombrarlo a "Guardar en historial".
4. **`crypto.randomUUID()` / `window.print()`:** solo cliente; OK bajo `"use client"`.
5. **Typecheck/lint:** correr `npm run lint` / `tsc --noEmit` en `front/` tras el merge.

## 5. Plan de merge

1. ✅ Copiar archivos del refactor (hecho, working tree).
2. Correr `tsc --noEmit` y `next lint` en `front/`.
3. Verificar visualmente `/dashboard/prestaciones` (wizard, estimación en vivo, comparación, PDF).
4. Abrir tickets para acoplamientos A, B, C.
5. Commit (no `push` sin visto bueno del usuario).
