package com.unexca.talentohumano.prestaciones;

/**
 * Desglose de la liquidación de prestaciones sociales.
 *
 * <p>Las asignaciones descomponen la garantía de prestaciones (bruto) según la
 * incidencia de cada partida en el salario integral, de modo que
 * {@code prestacionAntiguedad + bonoVacacional + utilidades + indemnizacion}
 * es exactamente {@code totalAsignaciones}. Las deducciones reflejan los montos
 * efectivamente descontados (con el tope legal aplicado a "otras deudas").</p>
 *
 * <p>Los tres últimos campos exponen la comparación del Art. 142 LOTTT que fija
 * la base del cálculo. Importan para la interfaz: cuando gana el histórico, el
 * bruto es exactamente ese monto y el salario deja de incidir en el resultado,
 * cosa que de otro modo parece un error de la estimación en vivo.</p>
 */
public record Desglose(
    double prestacionAntiguedad,
    double bonoVacacional,
    double utilidades,
    double indemnizacion,
    double totalAsignaciones,
    double anticipos,
    double otrasDeudas,
    double pensionAlimentaria,
    double totalDeducciones,
    /** "HISTORICO" si la base fue la garantía ya depositada; "CALCULADA" si fue el cálculo legal. */
    String baseAplicada,
    /** Garantía histórica informada en la solicitud. */
    double baseHistorico,
    /** Base calculada por antigüedad con el salario integral actual. */
    double baseCalculada) {
}
