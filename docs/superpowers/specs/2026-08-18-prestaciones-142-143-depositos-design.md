# Prestaciones 142 + 143 con depósitos de garantía — Diseño

- **Fecha:** 2026-08-18
- **Estado:** Aprobado (pendiente de plan de implementación)
- **Ámbito:** `back/.../prestaciones`, `back/.../empleados`, `front/.../dashboard/prestaciones`

## 1. Contexto y motivación

La auditoría técnico-legal (comparativa contra `finiquitojusto.com` y el texto de la LOTTT)
mostró que nuestro motor liquida **por debajo** del criterio del Art. 142 literal d, porque:

- La **garantía trimestral (142-a)** y los **días adicionales (142-b)** no se computan: dependen
  de que llegue `historicoAcumulado` como un número suelto en el request; si llega en 0, solo
  pagamos el retroactivo (142-c) y omitimos "pagar el monto mayor" (142-d).
- Los **intereses sobre prestaciones (143)** no se calculan.

Este diseño cierra esa brecha del **núcleo de prestaciones (Art. 142 + 143)** persistiendo los
depósitos reales de garantía por empleado y sumándolos en el cálculo.

## 2. Alcance

**Dentro:**
- Art. 142 a, b, c, d, e — garantía depositada (a+b) vs retroactivo (c), pagar el mayor (d),
  tramo < 3 meses = 5 días/mes (e).
- Art. 143 — intereses sobre prestaciones.
- Art. 92 — doblete por despido injustificado / causa ajena (ya existe, se conserva).
- Deducciones y tope del 50 % (ya existe, se conserva).
- Ingesta de los depósitos históricos: por archivo (command) y por UI (botón/endpoint).

**Fuera (otro módulo del ERP):**
- Vacaciones fraccionadas (196), bono vacacional fraccionado (192), utilidades fraccionadas
  (131/140), salarios pendientes. Los "días de bono vacacional" y "días de aguinaldos" siguen
  siendo **solo alícuotas del salario integral**, no conceptos pagables aquí.

## 3. Decisiones tomadas

1. **Modelo del histórico:** snapshot del **monto ya depositado** por trimestre (no timeline de
   salarios ni recomputo a salario actual). El motor **suma** esos montos.
2. **Días adicionales (142-b):** se consideran **incluidos** en los montos depositados (a+b
   juntos); el motor no los computa aparte.
3. **Intereses (143):** una **tasa anual configurable** (property/override) en v1; la tabla de
   tasas BCV por período queda como trabajo futuro.
4. **Back-compat:** si el empleado **no tiene depósitos** cargados, se usa el `historicoAcumulado`
   del request como fallback (comportamiento actual), para no romper lo existente.

## 4. Modelo de datos

Nueva entidad `DepositoGarantia` → tabla `garantia_depositos`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint identity | PK |
| `empleado_id` | bigint | FK → `empleados(id)` |
| `periodo` | varchar | `YYYY-Tn` (año + trimestre) **o** fecha ISO; clave de unicidad con empleado |
| `monto_depositado` | numeric | Bs. realmente depositado (incluye a+b) |
| `fecha_deposito` | date | Para el cálculo de intereses (143) |
| `created_at` | timestamp | Auditoría |

- Índice único `(empleado_id, periodo)` → idempotencia de la carga.
- `DepositoGarantiaRepository extends JpaRepository`: `findByEmpleadoId(Long)`,
  `existsByEmpleadoIdAndPeriodo(...)`.

## 5. Motor de cálculo (`PrestacionService`)

El service pasa a **inyectar `DepositoGarantiaRepository`** (deja de ser función pura).

```
garantiaDepositada = Σ monto_depositado de los depósitos del empleado         // 142 a+b
si no hay depósitos → garantiaDepositada = request.historicoAcumulado ?? 0    // fallback (dec. 4)

intereses = interés sobre los depósitos, tasa anual configurable,             // 143
            acumulado por depósito desde su fecha hasta fechaEgreso (compuesto anual)

retroactivo (baseCalculada) = 30 × añosServicio × salarioIntegralDiario       // 142-c (ya existe)
  · <3 meses  → 5 días/mes (142-e, ya existe)
  · 3–6 meses → 15 días/trimestre (142-a al salario actual, ya existe)

prestacionesBase = max(garantiaDepositada, retroactivo)                       // 142-d
baseAplicada = "DEPOSITOS" | "CALCULADA"

// se conservan sin cambios:
doblete Art. 92, descomposición del bruto, deducciones y tope del 50 %.
netoAPagar = prestacionesBase (×2 si doblete) + intereses − deducciones
```

> `intereses` se suma al neto (es un concepto pagable del 143). Fórmula v1 documentada como
> aproximación; una tabla de tasas por período la refinaría después.

## 6. Contrato de respuesta

`Desglose` gana campos (aditivo, no rompe el front actual):
- `garantiaDepositada: double` — suma de depósitos (o fallback).
- `intereses: double` — intereses del 143.
- (`baseAplicada` pasa a poder valer `"DEPOSITOS"`.)

`ResultadoLiquidacion` sigue `{ montoFinal, desglose }`.

## 7. Ingesta de históricos

Servicio compartido **`ImportadorGarantiaService`**:
- Parsea **CSV** con cabecera `cedula,periodo,monto[,fecha_deposito]`.
- Valida: empleado existe (por cédula), `monto ≥ 0`, `periodo` bien formado, no duplicado
  (`(empleado, periodo)`).
- Inserta los válidos; devuelve `ResultadoImport { cargadas, omitidas, errores[] }`.
- **Idempotente:** un `(empleado, periodo)` ya cargado se omite (no duplica).

Dos vías que usan el servicio:

1. **Command (backfill masivo).** `CommandLineRunner` gateado por propiedad, al estilo de
   `DemoSeeder`: `APP_IMPORT_GARANTIA=/ruta/historicos.csv` (o `-Dapp.import-garantia=…`) →
   al arrancar carga el archivo y loguea el resumen. Desactivado por defecto.
2. **UI (carga puntual).**
   - `POST /api/empleados/{id}/garantia/import` (multipart CSV) → `ImportadorGarantiaService` →
     resumen. Botón **"Importar históricos"** en la ficha del empleado.
   - `POST /api/empleados/{id}/garantia` → alta de un depósito suelto.
   - `GET /api/empleados/{id}/garantia` → listar depósitos del empleado.

   Endpoints en un **`GarantiaController` nuevo** (paquete `empleados` o `prestaciones`),
   protegidos por el `JwtCookieFilter` existente (auth requerida).

## 8. Frontend

- Ficha/panel del empleado: lista de depósitos + botón **"Importar históricos"** (sube CSV al
  endpoint) + alta manual.
- `EstimatePanel`: nuevas filas **Intereses** y indicador **garantía depositada vs retroactivo**
  (aprovecha `baseAplicada`).
- El input manual "Histórico Acumulado" queda como **override/fallback** (o se oculta cuando el
  empleado ya tiene depósitos).
- Las llamadas nuevas pasan por route handlers de Next (mismo patrón de proxy/cookie ya adoptado).

## 9. Back-compat y migración

- La tabla la crea Hibernate (`ddl-auto=update`) al arrancar.
- `historicoAcumulado` del request se mantiene como fallback → los cálculos actuales no cambian
  hasta que se carguen depósitos.
- El `Runner` de comparación (scratchpad) ya no compila contra el service (ahora necesita repo);
  no es productivo, se ignora.

## 10. Testing

- **Motor:** con y sin depósitos; `max(depositos, retroactivo)` (142-d); intereses; tramo <3m
  (142-e); tramo 3–6m; doblete (92); deducciones con tope. Mockear el repo.
- **ImportadorGarantiaService:** CSV válido, filas inválidas, duplicados (idempotencia), cédula
  inexistente.
- **Endpoints:** import multipart, alta, listado; auth requerida.

## 11. Riesgos / a definir en implementación

- **Fórmula de intereses (143):** v1 = interés compuesto anual por depósito con tasa única. Validar
  el criterio exacto con RRHH; dejar la tasa configurable y preparar (sin implementar) la tabla por
  período.
- **`periodo`:** definir formato único (`YYYY-Tn` recomendado) y su validación.
- **Formato CSV:** fijar separador y encoding (UTF-8) y documentarlo para el backfill.
- **Alcance del módulo:** este spec NO incluye truncos (196/192/131/140) ni salarios pendientes;
  si el negocio los quiere aquí, es otro spec.
