package com.unexca.talentohumano.empleados;

import java.time.LocalDate;

public record EmpleadoResumenDto(
        Long id,
        String nombre,
        String cedula,
        String cargo,
        LocalDate fechaIngreso,
        String iniciales) {
}
