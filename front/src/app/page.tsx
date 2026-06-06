import type { Metadata } from "next";
import LoginForm from "./login/_components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión · Talento Humano UNEXCA",
};

export default function Home() {
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
