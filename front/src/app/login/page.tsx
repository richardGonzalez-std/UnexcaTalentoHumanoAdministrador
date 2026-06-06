import { redirect } from "next/navigation";

// La pantalla de login vive en la raíz "/". Esta ruta queda como alias y
// redirige a "/" para tener una única fuente de verdad.
export default function LoginPage() {
  redirect("/");
}
