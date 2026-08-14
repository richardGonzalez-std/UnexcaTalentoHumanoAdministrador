package com.unexca.talentohumano.prestaciones;

import org.springframework.stereotype.Service;
import java.time.Period;
import java.util.List;

@Service
public class PrestacionService {

    private static final List<String> MOTIVOS_INDEMNIZACION_DOBLE = List.of(
        "DESPIDO INJUSTIFICADO",
        "RETIRO JUSTIFICADO",
        "CAUSAS AJENAS"
    );

    public ResultadoLiquidacion calcularPrestacionesSociales(DatosLiquidacionRequest datos) {

        // Sin esta validación, un egreso anterior al ingreso produce un período
        // negativo y toda la liquidación sale en negativo (Period.between devuelve
        // años y meses negativos, que se propagan hasta el monto final).
        if (datos.fechaIngreso() == null || datos.fechaEgreso() == null) {
            throw new IllegalArgumentException("Se requieren la fecha de ingreso y la fecha de egreso.");
        }
        if (datos.fechaEgreso().isBefore(datos.fechaIngreso())) {
            throw new IllegalArgumentException(
                "La fecha de egreso no puede ser anterior a la fecha de ingreso.");
        }

        Period periodoLaborado = Period.between(datos.fechaIngreso(), datos.fechaEgreso());
        int anos = periodoLaborado.getYears();
        int meses = periodoLaborado.getMonths();
        int dias = periodoLaborado.getDays();

        int totalMesesCompletos = (anos * 12) + meses;

        double salarioNormalMensual;
        if (Boolean.TRUE.equals(datos.esSalarioVariable())) {
            salarioNormalMensual = datos.promedioSueldoUltimos6Meses();
        } else {
            salarioNormalMensual = datos.sueldoTabla() + datos.primas();
        }

        double salarioNormalDiario = salarioNormalMensual / 30.0;
        double alicuotaVacacional = (salarioNormalDiario * datos.diasBonoVacacional()) / 360.0;
        double alicuotaAguinaldos = (salarioNormalDiario * datos.diasAguinaldos()) / 360.0;

        double salarioIntegralDiario = salarioNormalDiario + alicuotaVacacional + alicuotaAguinaldos;

        double historicoAcumulado = datos.historicoAcumulado() != null ? datos.historicoAcumulado() : 0.0;

        // Base del cálculo (Art. 142 LOTTT): se paga el mayor entre la garantía ya
        // depositada y el cálculo legal por antigüedad.
        double baseCalculada;
        boolean ganaHistorico;

        if (anos == 0 && totalMesesCompletos < 3) {
            // Relación terminada dentro del primer trimestre: 5 días de salario por
            // mes trabajado o fracción, sin comparar contra el histórico.
            int mesesAPagar = totalMesesCompletos + (dias > 0 ? 1 : 0);
            baseCalculada = (mesesAPagar * 5) * salarioIntegralDiario;
            ganaHistorico = false;

        } else {
            long anosServicio = anos;
            if (meses > 6 || (meses == 6 && dias > 0)) {
                anosServicio++;
            }

            if (anosServicio == 0) {
                // De 3 a 6 meses el retroactivo del literal c) todavía da cero, porque
                // exige año completo o fracción mayor a 6 meses. Aplica la garantía del
                // literal a): 15 días por trimestre completo. Sin esto el trabajador de
                // ese tramo liquidaba en 0 sin importar su salario.
                long trimestres = totalMesesCompletos / 3;
                baseCalculada = (trimestres * 15) * salarioIntegralDiario;
            } else {
                baseCalculada = (anosServicio * 30) * salarioIntegralDiario;
            }

            ganaHistorico = historicoAcumulado > baseCalculada;
        }

        double montoBasePrestaciones = ganaHistorico ? historicoAcumulado : baseCalculada;

        String motivo = datos.motivoTerminacion() != null ? datos.motivoTerminacion().toUpperCase() : "";
        boolean indemnizacionDoble = MOTIVOS_INDEMNIZACION_DOBLE.contains(motivo);

        // Descomposición del bruto (garantía de prestaciones) según la incidencia
        // de cada partida en el salario integral. La suma de las tres partidas es
        // exactamente montoBasePrestaciones, sin importar si en el retroactivo ganó
        // el histórico acumulado o el cálculo por antigüedad.
        double factorNormal = salarioIntegralDiario > 0 ? salarioNormalDiario / salarioIntegralDiario : 1.0;
        double factorVacacional = salarioIntegralDiario > 0 ? alicuotaVacacional / salarioIntegralDiario : 0.0;
        double factorAguinaldos = salarioIntegralDiario > 0 ? alicuotaAguinaldos / salarioIntegralDiario : 0.0;

        double prestacionAntiguedad = montoBasePrestaciones * factorNormal;
        double bonoVacacional = montoBasePrestaciones * factorVacacional;
        double utilidades = montoBasePrestaciones * factorAguinaldos;

        // La indemnización (Art. 92 LOTTT) duplica la garantía cuando el motivo lo
        // amerita: el monto adicional es igual a la base de prestaciones.
        double indemnizacion = indemnizacionDoble ? montoBasePrestaciones : 0.0;

        double totalAsignaciones = prestacionAntiguedad + bonoVacacional + utilidades + indemnizacion;

        // Deducciones legales sobre el bruto.
        double anticipos = datos.anticipos() != null ? datos.anticipos() : 0.0;
        double netoAPagar = totalAsignaciones - anticipos;

        double descuentoOtrasDeudas = 0.0;
        if (datos.otrasDeudas() != null && datos.otrasDeudas() > 0) {
            double limiteDescuentoDeudas = netoAPagar * 0.50;
            descuentoOtrasDeudas = Math.min(datos.otrasDeudas(), limiteDescuentoDeudas);
            netoAPagar -= descuentoOtrasDeudas;
        }

        double pensionAlimentaria = 0.0;
        if (datos.pensionAlimentaria() != null && datos.pensionAlimentaria() > 0) {
            pensionAlimentaria = datos.pensionAlimentaria();
            netoAPagar -= pensionAlimentaria;
        }

        double totalDeducciones = anticipos + descuentoOtrasDeudas + pensionAlimentaria;

        Desglose desglose = new Desglose(
            prestacionAntiguedad,
            bonoVacacional,
            utilidades,
            indemnizacion,
            totalAsignaciones,
            anticipos,
            descuentoOtrasDeudas,
            pensionAlimentaria,
            totalDeducciones,
            ganaHistorico ? "HISTORICO" : "CALCULADA",
            historicoAcumulado,
            baseCalculada
        );

        return new ResultadoLiquidacion(netoAPagar, desglose);
    }

}
