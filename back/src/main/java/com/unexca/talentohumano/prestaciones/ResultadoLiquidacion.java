package com.unexca.talentohumano.prestaciones;

/**
 * Resultado del cálculo de prestaciones sociales: el monto neto a pagar más el
 * desglose de las partidas que lo componen.
 */
public record ResultadoLiquidacion(
    double montoFinal,
    Desglose desglose) {
}
