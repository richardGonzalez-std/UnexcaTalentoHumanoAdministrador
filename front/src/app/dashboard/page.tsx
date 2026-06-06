import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel · Talento Humano UNEXCA",
};

// Área autenticada — placeholder. Aquí irá el panel real (empleados,
// prestaciones, correspondencia, administración) más adelante.
export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(168deg, #002e6b 0%, #2b3d4f 100%)",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        padding: 28,
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          Talento Humano · UNEXCA
        </h1>
        <p style={{ opacity: 0.8 }}>Panel — en construcción</p>
      </div>
    </main>
  );
}
