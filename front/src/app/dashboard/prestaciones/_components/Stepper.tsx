const PASOS = ["Empleado", "Remuneración", "Prestaciones", "Deducciones"];

export function Stepper({ pasoActual }: { pasoActual: number }) {
  return (
    <div className="mb-5 flex items-center">
      {PASOS.map((label, i) => {
        const numero = i + 1;
        const completado = numero < pasoActual;
        const activo = numero === pasoActual;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-1.5">
              <div
                className={`grid size-6 shrink-0 place-items-center rounded-full text-[10.5px] font-bold ${
                  completado ? "bg-[#1a6f47] text-white" : activo ? "bg-brand-600 text-white" : "border border-line text-ink-soft"
                }`}
              >
                {completado ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.6} className="size-2.5">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  numero
                )}
              </div>
              <span className={`whitespace-nowrap text-[10px] font-semibold ${activo ? "text-ink" : "text-ink-soft"}`}>{label}</span>
            </div>
            {numero < PASOS.length && <div className="mx-2 h-px flex-1 bg-line" />}
          </div>
        );
      })}
    </div>
  );
}
