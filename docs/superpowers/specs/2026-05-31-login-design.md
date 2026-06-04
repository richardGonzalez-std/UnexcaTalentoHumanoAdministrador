# Diseño — Módulo de Login

**Fecha:** 2026-05-31
**Estado:** Propuesta (pendiente de revisión del usuario)
**Autor:** Richard + Claude

---

## 1. Objetivo

Permitir que el personal autorizado de Talento Humano (UNEXCA) inicie sesión en el
sistema con **cédula + contraseña**, autenticando contra la tabla `empleados` ya
existente, y estableciendo una sesión segura mediante un **JWT en cookie httpOnly**.

## 2. Alcance

### Incluye
- Pantalla de login en el frontend (`/login`).
- Endpoint de autenticación en el backend (`POST /api/auth/login`).
- Verificación de contraseña con **BCrypt** contra `empleados.password_hash`.
- Emisión de un **JWT** en **cookie httpOnly**.
- Opción "Recordarme" (controla la duración de la cookie).
- Endpoint de logout que limpia la cookie.

### NO incluye (fuera de alcance por ahora)
- Registro público de cuentas (las cuentas las crea un administrador).
- Recuperación de contraseña ("¿olvidó su contraseña?").
- El dashboard / pantalla destino tras el login (se redirige a un placeholder).
- Roles y permisos finos (se abordarán después).
- OAuth2 con proveedor externo (el starter está en el classpath para el futuro).

## 3. Decisiones tomadas (brainstorming)

| Tema | Decisión |
|---|---|
| Identificador | **Cédula** + contraseña |
| Creación de cuentas | Solo el **administrador** (sin registro público) |
| Elementos de la pantalla | Logo, mostrar/ocultar contraseña, "Recordarme", botón Ingresar |
| Sin | enlace de registro, sin "olvidó contraseña" |
| Layout | **Tarjeta centrada** sobre fondo oscuro, logo arriba |
| Mecanismo del token | **JWT en cookie httpOnly** (seguro) |

## 4. Experiencia de usuario (pantalla)

> **Diseño visual APROBADO:** Propuesta 4 — ver `docs/design-companion/login-unexca-v4/index.html`.
> Paleta **#002e6b → #2b3d4f** (degradado azul, sin glow), tipografía **Tektur 500**,
> **tarjeta blanca** centrada sobre fondo azul, **logo blanco** arriba (sobre la zona azul).
> El mockup HTML es la referencia fiel a convertir en el componente `LoginForm`.

### Disposición
```
            [ LOGO ]            (logo blanco sobre fondo oscuro)
        Talento Humano · UNEXCA

      ┌───────────────────────────┐
      │ Cédula                    │
      │ [ V-12345678            ] │
      │ Contraseña            👁  │   ← ícono mostrar/ocultar
      │ [ ••••••••••           ] │
      │ ☐ Recordarme              │
      │ [       Ingresar        ] │
      │  ⚠ mensaje de error aquí  │
      └───────────────────────────┘
```

### Estados de la UI
- **Normal:** campos editables, botón habilitado.
- **Cargando:** al enviar — botón muestra spinner y queda deshabilitado, campos bloqueados.
- **Error:** mensaje **"Cédula o contraseña incorrectas"** — *el mismo texto* tanto si la
  cédula no existe como si la contraseña es incorrecta (evita enumeración de usuarios).
- **Éxito:** redirección al destino post-login.

### Validación en cliente
- Cédula y contraseña requeridas (no enviar si están vacías).
- La validación de credenciales real ocurre en el backend.

## 5. Arquitectura

### 5.1 Frontend (`/front`, Next.js 16 App Router)

Estructura por colocation en `src/app/login/`:

```
src/app/login/
├── page.tsx                 # Server Component; monta <LoginForm/>
├── _components/
│   └── LoginForm.tsx        # Client Component ('use client'); estado del formulario
├── types/
│   └── auth.ts              # LoginRequest, LoginResponse
└── libs/
    └── api.ts               # wrapper de fetch (credentials: 'include')
```

- `page.tsx` permanece como Server Component (ligero); solo el `LoginForm` es cliente.
- `LoginForm.tsx` maneja: estado de campos, mostrar/ocultar contraseña, "Recordarme",
  envío, estados de carga/error.

### 5.2 Backend (`/back`, Spring Boot 4 — módulo `login`)

```
com.unexca.talentohumano.login/
├── LoginController.java          # @RestController, POST /api/auth/login, POST /api/auth/logout
├── LoginService.java             # lógica: valida credenciales (reutiliza EmpleadoRepository)
├── LoginRequest.java             # record (cedula, password, recordarme)
├── LoginResponse.java            # record (id, nombreCompleto) — datos NO sensibles
└── CredencialesInvalidasException.java
```

Más, en `com.unexca.talentohumano.config`:
- `SecurityConfig.java` (ya existe, hoy permitAll) → ajustar: permitir `/api/auth/**` sin
  autenticación y exigir autenticación (JWT) en el resto.
- Un componente para **emitir/validar JWT** (usando el soporte de Spring Security / Nimbus,
  ya presente en el classpath vía `oauth2-jose`).
- Un `PasswordEncoder` (BCrypt) como `@Bean`.

> **Principio (CLASE 7):** `LoginService` **reutiliza** `EmpleadoRepository`; el login NO
> tiene repositorio propio. Necesitará un método `Optional<Empleado> findByCedula(String)`
> en `EmpleadoRepository`.

### 5.3 Mecanismo de autenticación (httpOnly cookie)

```
1. LoginForm  ──POST /api/auth/login {cedula, password}──►  LoginController
                                                              │
2.                                LoginService.autenticar()   │
                                  - findByCedula(cedula)       │
                                  - BCrypt.matches(pwd, hash)  │
                                  - si falla → 401 (mensaje genérico)
                                  - si ok → genera JWT         │
3.  Set-Cookie: token=<JWT>; HttpOnly; SameSite=Lax; Path=/; Max-Age=...
    Respuesta body: { id, nombreCompleto }                     │
4.  LoginForm recibe 200 → redirige al destino post-login
5.  Peticiones siguientes envían la cookie automáticamente;
    un filtro JWT en el backend valida el token y autentica la petición.
```

- **"Recordarme" marcado** → cookie persistente (`Max-Age` largo, p. ej. 7 días).
- **"Recordarme" desmarcado** → cookie de sesión (se borra al cerrar el navegador).
- **Cookie:** `HttpOnly` (no accesible por JS → resistente a XSS), `SameSite=Lax`,
  `Secure` en producción (HTTPS).
- **CORS:** el backend debe permitir el origen del front (`http://localhost:3000`) con
  `allowCredentials=true`; el front hace `fetch(..., { credentials: 'include' })`.
  - Nota de entorno: `localhost:3000` y `localhost:8080` son *same-site* (mismo host
    `localhost`), por lo que `SameSite=Lax` funciona en desarrollo. En producción con
    dominios distintos habrá que revisar `SameSite`/`Secure`.

## 6. Contrato de la API

### `POST /api/auth/login`
**Request:**
```json
{ "cedula": "V-12345678", "password": "secreto", "recordarme": true }
```
**Respuesta 200 (éxito):** `Set-Cookie: token=...; HttpOnly; ...`
```json
{ "id": 1, "nombreCompleto": "Ana López" }
```
**Respuesta 401 (fallo):**
```json
{ "mensaje": "Cédula o contraseña incorrectas" }
```

### `POST /api/auth/logout`
- Limpia la cookie (`Max-Age=0`). Respuesta 204.

## 7. Manejo de errores

- Credenciales inválidas → `CredencialesInvalidasException` → **401** vía
  `@RestControllerAdvice` (mensaje genérico, sin distinguir cédula vs contraseña).
- Validación de entrada (campos vacíos) → 400 con mensaje claro.
- El `LoginService` **no conoce HTTP** (CLASE 3): lanza excepción de dominio; el
  controller/advice la traduce a 401.

## 8. Datos de prueba

Como las cuentas son admin-only, para poder probar el login sembraremos **un empleado
de prueba** con su `password_hash` generado con BCrypt (p. ej. cédula `V-12345678`,
contraseña conocida). Vía script SQL o un `CommandLineRunner` de desarrollo.

## 9. Pruebas

- **Backend:** test de `LoginService` (mock de `EmpleadoRepository`): credenciales
  correctas → devuelve empleado; cédula inexistente → excepción; contraseña incorrecta →
  excepción. Test de integración del endpoint (200 + cookie; 401 sin cookie).
- **Frontend:** verificación manual del flujo (campos, error, redirección) y, si se
  configura, un test del `LoginForm`.

## 10. Supuestos y preguntas abiertas

1. **Destino post-login:** se redirige a `/` (placeholder) hasta que exista el dashboard.
   *(A confirmar más adelante.)*
2. **Duración de "Recordarme":** propuesto 7 días persistente / sesión si no. *(Ajustable.)*
3. **Librería JWT:** se usará el soporte de Spring Security (Nimbus, ya en el classpath).
   *(A confirmar en el plan.)*
4. **Hash de contraseñas existentes:** los `password_hash` deben estar en BCrypt; el
   seeding de prueba lo garantiza.

## 11. Secuencia de construcción (alto nivel)

> El plan detallado paso a paso se hará con la skill `writing-plans`.

1. **Backend — fundamentos de auth:** `PasswordEncoder` (BCrypt), `findByCedula` en el
   repositorio, generación/validación de JWT, ajuste de `SecurityConfig`.
2. **Backend — endpoint:** DTOs, `LoginService`, `LoginController`, manejo de excepciones,
   cookie httpOnly. Sembrar empleado de prueba.
3. **Verificar backend:** login correcto devuelve cookie; login incorrecto da 401.
4. **Frontend — base:** `types/auth.ts`, `libs/api.ts`.
5. **Frontend — UI:** `LoginForm.tsx` (campos, estados, mostrar/ocultar, recordarme),
   cablear `page.tsx`.
6. **Verificar end-to-end:** login desde el navegador → cookie puesta → redirección.

---

## Apéndice — Principios de Spring aplicados (referencia de aprendizaje)
- **Capas (CLASE 1–3):** Controller (HTTP) → Service (dominio) → Repository (datos). El
  Service no conoce HTTP.
- **Repository por entidad (CLASE 7):** login reutiliza `EmpleadoRepository`.
- **DTOs como `record` (CLASE 5):** `LoginRequest`/`LoginResponse`; nunca se expone la
  entidad `Empleado` directa.
- **Optional (CLASE 3.1):** `findByCedula` devuelve `Optional<Empleado>`, resuelto con
  `orElseThrow`.
