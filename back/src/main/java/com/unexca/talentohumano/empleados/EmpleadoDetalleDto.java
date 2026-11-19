package com.unexca.talentohumano.empleados;

public record EmpleadoDetalleDto(
        Long id,
        String primerNombre,
        String segundoNombre,
        String apellidoPaterno,
        String apellidoMaterno,
        String cedula,
        String correo,
        String telefono,
        String direccion,
        String cargo,
        String tipoPersonal,   // "DOCENTE" | "ADMINISTRATIVO" | null — String para evitar problemas de serialización Jackson 3
        String fechaIngreso,   // "YYYY-MM-DD" | null
        Boolean activo,
        String iniciales
) {}
