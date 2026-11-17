package com.unexca.talentohumano.historial;

import java.time.LocalDateTime;

public record HistorialPrestacionDto(
        Long id,
        String nombreEmpleado,
        String motivoTerminacion,
        Double montoFinal,
        LocalDateTime fecha) {
}
