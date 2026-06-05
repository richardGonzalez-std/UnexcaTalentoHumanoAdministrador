import type { Metadata } from "next";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión · Talento Humano UNEXCA",
};

export default function LoginPage() {
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
