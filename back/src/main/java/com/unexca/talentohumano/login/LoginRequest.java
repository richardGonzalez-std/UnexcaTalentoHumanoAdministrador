package com.unexca.talentohumano.login;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "La cédula es obligatoria") String cedula,
        @NotBlank(message = "La contraseña es obligatoria") String password,
        boolean recordarme
) {}
