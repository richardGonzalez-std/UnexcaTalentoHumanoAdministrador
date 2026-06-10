import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "./login/_components/LoginForm";
import { obtenerUsuario } from "@/app/dashboard/libs/session";

export const metadata: Metadata = {
  title: "Iniciar sesión · Talento Humano UNEXCA",
};

export default async function Home() {
  // Si ya hay sesión válida (cookie aún viva — incluida la persistente de
  // "Recordarme"), entra directo al panel en vez de mostrar el login.
  if (await obtenerUsuario()) redirect("/dashboard");

  return (
    <>
      {/* Fuente Tektur (diseño Propuesta 4) */}
      <link
        href="https://fonts.googleapis.com/css2?family=Tektur:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <LoginForm />
    </>
  );
}
