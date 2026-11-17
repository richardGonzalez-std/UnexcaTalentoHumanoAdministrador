package com.unexca.talentohumano.historial;

public record HistorialPrestacionDto(
        Long id,
        String nombreEmpleado,
        String motivoTerminacion,
        Double montoFinal,
        String fecha) {
}
