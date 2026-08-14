export interface DatosLiquidacionRequest {
  empleadoId: number;
  fechaIngreso: string; // YYYY-MM-DD
  fechaEgreso: string; // YYYY-MM-DD
  motivoTerminacion: string;
  sueldoTabla: number;
  primas: number;
  esSalarioVariable: boolean;
  promedioSueldoUltimos6Meses?: number;
  diasBonoVacacional: number;
  diasAguinaldos: number;
  historicoAcumulado: number;
  anticipos?: number;
  otrasDeudas?: number;
  pensionAlimentaria?: number;
}

export interface Desglose {
  prestacionAntiguedad: number;
  bonoVacacional: number;
  utilidades: number;
  indemnizacion: number;
  totalAsignaciones: number;
  anticipos: number;
  otrasDeudas: number;
  pensionAlimentaria: number;
  totalDeducciones: number;
  /** Cuál de los dos términos del Art. 142 LOTTT fijó la base del cálculo. */
  baseAplicada: "HISTORICO" | "CALCULADA";
  /** Garantía histórica informada en el Paso 3. */
  baseHistorico: number;
  /** Base calculada por antigüedad con el salario integral actual. */
  baseCalculada: number;
}

export interface PrestacionesResult {
  montoFinal: number;
  desglose: Desglose;
}

export interface MotivosTerminacion {
  label: string;
  value: string;
}

export const MOTIVOS_TERMINACION: MotivosTerminacion[] = [
  { label: "Renuncia", value: "RENUNCIA" },
  { label: "Despido injustificado", value: "DESPIDO INJUSTIFICADO" },
  { label: "Retiro justificado", value: "RETIRO JUSTIFICADO" },
  { label: "Causas ajenas", value: "CAUSAS AJENAS" },
  { label: "Jubilación", value: "JUBILACION" },
  { label: "Muerte", value: "MUERTE" },
  { label: "Incapacidad permanente", value: "INCAPACIDAD PERMANENTE" },
];
