# Guión de demostración — UnexcaTalentoHumanoAdministrador

Presentación en vivo del sistema ante el profesor de proyecto.
Duración objetivo: **12 minutos de demo + preguntas**.

Todos los montos de este guión fueron ejecutados contra el backend real y son los que
vas a ver en pantalla si seguís los pasos con los mismos datos.

---

## 0. Checklist previo (hacelo 10 minutos antes)

```bash
proyecto unexca          # levanta backend (8080) y frontend (3000)
proyecto status          # esperá a que los dos digan "escucha"
```

El backend de Spring tarda ~40 s en compilar y abrir el 8080. No empieces la
demostración hasta que `proyecto status` muestre `escucha` en las dos filas.

Verificá el login **antes** de la presentación:

| dato | valor |
|---|---|
| URL | `http://localhost:3000` |
| Cédula | `V-12345678` |
| Contraseña | `Unexca2026` |

> ⚠️ La `GUIA_DE_USUARIO_SISTEMA.md` dice que la contraseña es `admin123`: **está desactualizada**.
> La real es `Unexca2026` (la que siembra `DemoSeeder.java`). Si el usuario no existe en tu
> base, arrancá una vez con `APP_SEED_DEMO=true ./gradlew bootRun` para crearlo.

Preparación de la pantalla:
- Navegador con zoom al 100 %, ventana maximizada, sin pestañas de más.
- Tené una segunda pestaña abierta en `http://localhost:8080/swagger-ui.html`.
- Cerrá el resto de las aplicaciones: la demo es local y el profesor mira una sola pantalla.

---

## 1. Apertura — 45 segundos

> "El sistema automatiza los cálculos de prestaciones sociales del Departamento de Talento
> Humano de la UNEXCA. Hoy eso se hace en hojas de cálculo, sin trazabilidad y con riesgo de
> error en una liquidación que es un derecho laboral. Lo que voy a mostrar es el módulo de
> cálculo funcionando de punta a punta, con el motor legal en el backend."

Una sola frase de arquitectura, sin entrar en detalle todavía:

> "Son dos aplicaciones separadas: un backend en Spring Boot 4 con Java 26 que tiene el motor
> de cálculo y la seguridad, y un frontend en Next.js 16 que consume su API."

---

## 2. Autenticación y sesión — 2 minutos

**Qué hacés:**

1. Mostrá la pantalla de login. Señalá que el ingreso es **por cédula**, no por usuario y
   contraseña genéricos: es el estándar del sector público venezolano.
2. Ingresá una contraseña incorrecta a propósito.
   → Aparece *"Cédula o contraseña incorrectas"*.
3. Ingresá las credenciales correctas. Entra al dashboard.

**Qué decís mientras tanto:**

> "El mensaje de error es deliberadamente genérico: no dice si la cédula existe o no. Eso evita
> que alguien enumere qué cédulas están registradas probando una por una."

> "Las contraseñas se guardan con BCrypt, nunca en texto plano. Y la sesión viaja en una cookie
> `httpOnly`, así que ningún JavaScript de la página puede leer el token — es la defensa contra
> robo de sesión por XSS."

**Golpe de efecto (opcional, 30 s):** abrí DevTools → pestaña *Application* → *Cookies* →
`localhost:3000`. Mostrá la cookie `token` con la casilla **HttpOnly** tildada.

> "Acá está la cookie, marcada HttpOnly. Si abro la consola y escribo `document.cookie`, el token
> no aparece."

---

## 3. Dashboard — 1 minuto

Mostrá el panel: KPIs arriba, accesos rápidos a los módulos, solicitudes recientes.

**Sé explícito con lo que todavía no está** — es mejor decirlo vos que que te lo pregunten:

> "Los indicadores y las solicitudes recientes son datos de ejemplo: el módulo de Empleados
> todavía no expone su API, y las tarjetas marcadas *Próximamente* son los módulos siguientes.
> El único módulo conectado de verdad es Cálculo de Prestaciones, que es el que vengo a mostrar."

Hacé clic en la tarjeta **Cálculo de Prestaciones**.

---

## 4. El wizard, caso base — 3 minutos

Cargá estos datos exactos:

| paso | campo | valor |
|---|---|---|
| 1 | Empleado | José Rodríguez (`V-15.887.221`, ingreso 2015-06-01) |
| 1 | Fecha egreso | `2026-08-01` |
| 1 | Motivo | Renuncia |
| 2 | Sueldo tabla | `5000` |
| 2 | Primas | `1000` |
| 3 | Días bono vacacional / utilidades | `15` / `45` (quedan por defecto) |
| 3 | Histórico acumulado | `0` por ahora |

**Resultado esperado en el panel:**

| partida | monto |
|---|---|
| Antigüedad | Bs. 66.000,00 |
| Bono vacacional | Bs. 2.750,00 |
| Utilidades | Bs. 8.250,00 |
| **Monto neto** | **Bs. 77.000,00** |

**Lo que hay que remarcar:** el panel se actualiza **mientras escribís**, sin apretar ningún
botón.

> "Cada cambio dispara un recálculo contra el backend real, con medio segundo de espera para no
> golpear la API en cada tecla. El número que se ve no lo calcula el navegador: viene del motor
> legal en Java. El frontend no sabe nada de la LOTTT."

Volvé al Paso 2 y cambiá el sueldo de 5.000 a 6.000 delante del profesor, para que vea que el
neto se mueve solo.

---

## 5. El diferenciador: la comparación del Art. 142 — 2 minutos

Este es el punto más fuerte de la demo. Andá al Paso 3 y escribí `150000` en **Histórico Acumulado**.

**Resultado esperado:** el neto salta a **Bs. 150.000,00** y aparece un aviso ámbar:

> Base aplicada: **garantía histórica** (Bs. 150.000,00), mayor al cálculo por antigüedad
> (Bs. 77.000,00) — Art. 142 LOTTT. Mientras gane el histórico, cambiar sueldo o primas no
> altera el monto.

**Qué decís:**

> "El artículo 142 de la LOTTT ordena pagar **el mayor** entre lo que se depositó como garantía
> trimestral y el cálculo retroactivo con el último salario. Acá gana el histórico, así que el
> sistema paga ese monto."

> "Y este aviso resuelve un problema real de usabilidad que detecté probando: cuando gana el
> histórico, mover el sueldo no cambia el total — matemáticamente no puede — y el analista cree
> que el sistema está roto. En vez de dejarlo adivinando, la interfaz dice cuál de los dos
> términos ganó y por cuánto."

Si querés rematar: subí el sueldo hasta que el cálculo supere al histórico y el aviso desaparezca
solo, porque cambió el término ganador.

---

## 6. Motivo de terminación y deducciones — 2 minutos

**6.1 Indemnización del Art. 92.** Volvé al Paso 1, poné el histórico en `0` y cambiá el motivo a
**Despido injustificado**.

→ Aparece la partida **Indemnización Bs. 77.000,00** y el neto pasa a **Bs. 154.000,00**.

> "El despido injustificado y el retiro justificado duplican la prestación, según el artículo 92.
> El sistema lo aplica automáticamente según el motivo de egreso."

Mostrá el botón **Comparar escenarios** del panel: calcula en paralelo el escenario opuesto
(renuncia ⇄ despido) para ver la diferencia económica de una decisión administrativa.

**6.2 Tope legal de deducciones.** Volvé a Renuncia y en el Paso 4 cargá:

| campo | valor |
|---|---|
| Anticipos | `10000` |
| Otras deudas | `100000` |

**Resultado esperado:** deducciones **Bs. 43.500,00**, neto **Bs. 33.500,00**.

> "Cargué 100.000 de deudas, pero el sistema descontó solo 33.500. La ley no permite descontar
> más del 50 % del neto por deudas al patrono: el motor aplica ese tope solo. Si esto se hiciera
> en Excel, el tope depende de que el analista se acuerde."

---

## 7. Validaciones — 1 minuto

Volvé al Paso 1 e intentá poner una **fecha de egreso anterior al ingreso**.

- El calendario directamente no deja elegir días previos al ingreso del empleado.
- Si la tipeás igual, el formulario muestra *"La fecha de egreso no puede ser anterior al ingreso
  (2015-06-01)"* y **no se pide el cálculo**.
- El backend rechaza esa combinación por su cuenta con HTTP 400, aunque le llegue desde otro
  cliente.

> "La validación está en las dos capas. La del navegador es comodidad; la del backend es la que
> de verdad protege los datos, porque la API puede ser llamada por fuera de esta interfaz."

---

## 8. La API por debajo — 1 minuto

Cambiá a la pestaña de Swagger (`http://localhost:8080/swagger-ui.html`).

> "El backend documenta su API automáticamente con OpenAPI. Estos son los cuatro endpoints que
> existen hoy: login, logout, el de sesión actual, y el de cálculo."

| método | endpoint |
|---|---|
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/me` |
| POST | `/api/prestaciones/calcular` |

> "Todo lo que está fuera de `/api/auth/**` exige sesión válida. Si entro a `/dashboard` sin
> haber iniciado sesión, el servidor me devuelve al login antes de renderizar la página."

Podés demostrarlo abriendo `http://localhost:3000/dashboard` en una ventana de incógnito: rebota
al login.

---

## 9. Cierre — 1 minuto

> "Lo que está terminado es la autenticación, la sesión segura y el motor de cálculo de
> prestaciones con sus reglas legales. Lo que sigue, en orden: el CRUD real de empleados —hoy el
> buscador usa un directorio de ejemplo—, guardar el historial de liquidaciones en MySQL en lugar
> de en el navegador, roles y permisos, y el módulo de correspondencia."

---

## Preguntas probables y cómo responderlas

**"¿Los empleados salen de la base de datos?"**
No. El buscador del Paso 1 usa un directorio de ejemplo en el frontend (`libs/empleados.ts`). La
tabla `empleados` existe en MySQL y es la que autentica el login, pero el endpoint de búsqueda
todavía no está. Es el primer punto del roadmap.

**"¿Dónde se guardan las liquidaciones?"**
Hoy el historial vive en el `localStorage` del navegador, no en la base. Está identificado como
deuda técnica y el endpoint a construir es `POST /api/prestaciones/historial`.

**"¿Esto es seguro para producción?"**
Todavía no, y está documentado. Falta HTTPS con la cookie en `Secure=true`, límite de intentos de
login, y auditoría. Las credenciales de base de datos y el secreto del JWT ya salen de variables
de entorno, no están en el código.

**"¿Cómo sé que el cálculo es correcto?"**
Mostrá el desglose del panel: cada partida sale de una fórmula del artículo citado. El salario
integral diario es el normal diario más las alícuotas de bono vacacional y utilidades sobre 360
días; la garantía compara histórico contra retroactivo por el 142; la indemnización duplica por
el 92; el tope del 50 % es del descuento por deudas.

**"¿Por qué Java y no todo en JavaScript?"**
Separar el motor de cálculo en el backend permite que las reglas legales tengan un solo lugar de
verdad, auditable, y que ningún cliente pueda alterarlas. Además el cálculo no se puede
manipular desde el navegador.

**"¿Qué pasa si el backend está caído?"**
El panel muestra el mensaje de error del servidor en vez de un número inventado. Nunca muestra un
resultado que no venga del motor.

---

## Plan B

| si pasa esto | hacé esto |
|---|---|
| El 8080 no levanta | `proyecto logs unexca` y mostrá el error; seguí con capturas |
| El panel queda en "Actualizando estimación…" | Recargá con F5: la estimación se rearma sola |
| El panel muestra números que no cambian | Confirmá que no quedó un histórico cargado del ensayo anterior |
| MySQL no arranca | El login falla; sin base no hay demo. Verificalo en el checklist previo |

Tené a mano capturas de las tres pantallas clave (login, dashboard, wizard con el aviso del
Art. 142) por si falla la red o el equipo.

---

## Ensayo recomendado

Corré la demo completa **una vez** antes, con cronómetro, verificando estos cinco números:

| escenario | neto esperado |
|---|---|
| Renuncia, sin histórico | Bs. 77.000,00 |
| Despido injustificado | Bs. 154.000,00 |
| Renuncia + histórico 150.000 | Bs. 150.000,00 |
| Renuncia + anticipos 10.000 | Bs. 67.000,00 |
| + otras deudas 100.000 (tope 50 %) | Bs. 33.500,00 |

Si alguno no coincide, revisá que los días de bono vacacional y utilidades sigan en 15 y 45, y
que el empleado sea José Rodríguez con egreso 2026-08-01.
