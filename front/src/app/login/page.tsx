// Página de inicio de sesión — ruta pública: /login
//
// NOTA: esto es solo el ANDAMIAJE (placeholder) del módulo. Confirma que la ruta
// y la estructura de carpetas (_components / types / libs) funcionan.
// El diseño real del formulario de login se definirá en la fase de diseño
// (brainstorming) antes de implementarlo.
//
// Es un Server Component por ahora. Cuando el formulario tenga estado/interacción
// (useState, onSubmit, etc.) habrá que marcarlo con 'use client' o, mejor, extraer
// el formulario a un componente cliente dentro de _components/.

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Módulo de login — en construcción
        </p>
      </div>
    </main>
  );
}
