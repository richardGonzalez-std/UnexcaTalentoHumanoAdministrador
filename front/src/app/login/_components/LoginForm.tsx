"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../libs/api";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cedula.trim() || !password.trim()) return;
    setError(null);
    setCargando(true);
    try {
      await login({ cedula, password, recordarme });
      router.push("/dashboard"); // área autenticada (placeholder por ahora)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.logo}>
          {/* logo blanco desde front/public/logo.png */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="UNEXCA" />
        </div>

        <div className={styles.card}>
          <div className={styles.head}>
            <div className={styles.kicker}>Talento Humano · UNEXCA</div>
            <h1 className={styles.title}>Iniciar sesión</h1>
            <p className={styles.sub}>Ingresa con tu cédula y contraseña.</p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="cedula">Cédula</label>
              <div className={styles.control}>
                <input
                  id="cedula"
                  type="text"
                  placeholder="V-12345678"
                  autoComplete="username"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  disabled={cargando}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.control}>
                <input
                  id="password"
                  className={styles.pwInput}
                  type={mostrar ? "text" : "password"}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={cargando}
                />
                <button
                  type="button"
                  className={`${styles.toggle} ${mostrar ? styles.on : ""}`}
                  aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setMostrar((v) => !v)}
                >
                  <svg className={styles.icoOn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg className={styles.icoOff} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.2-.95M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
                </button>
              </div>
            </div>

            <div className={styles.row}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  disabled={cargando}
                />
                <span className={styles.box}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                Recordarme
              </label>
            </div>

            <button type="submit" className={`${styles.btn} ${cargando ? styles.loading : ""}`} disabled={cargando}>
              <span className={styles.spin}></span>
              <span className={styles.btnLabel}>Ingresar</span>
            </button>

            {error && (
              <div className={`${styles.error} ${styles.show}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 17, height: 17, flex: "none" }}><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
