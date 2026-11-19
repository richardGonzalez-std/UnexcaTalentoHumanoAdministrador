package com.unexca.talentohumano.empleados;

import jakarta.validation.constraints.NotBlank;

public record GuardarEmpleadoRequest(
        @NotBlank String primerNombre,
        String segundoNombre,
        @NotBlank String apellidoPaterno,
        String apellidoMaterno,
        @NotBlank String cedula,
        @NotBlank String correo,
        String telefono,
        String direccion,
        String cargo,
        String tipoPersonal,   // "DOCENTE" | "ADMINISTRATIVO"
        String fechaIngreso,   // "YYYY-MM-DD" | null
        Boolean activo
) {}
