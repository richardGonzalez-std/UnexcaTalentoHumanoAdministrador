package com.unexca.talentohumano.historial;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GuardarHistorialRequest(
        @NotBlank String nombreEmpleado,
        @NotBlank String motivoTerminacion,
        @NotNull  Double montoFinal) {
}
