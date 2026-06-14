package com.unexca.talentohumano.prestaciones;
import java.time.LocalDate;

public record DatosLiquidacionRequest(
    Long empleadoId,
    LocalDate fechaIngreso,
    LocalDate fechaEgreso,
    String motivoTerminacion,
    Double sueldoTabla,
    Double primas,
    Boolean esSalarioVariable,
    Double promedioSueldoUltimos6Meses,
    Integer diasBonoVacacional,
    Integer diasAguinaldos,
    Double historicoAcumulado,
    Double anticipos,
    Double otrasDeudas,
    Double pensionAlimentaria) {

}
