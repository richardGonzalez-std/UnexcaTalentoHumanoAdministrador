package com.unexca.talentohumano.login;

/** Datos del usuario autenticado para el panel, resueltos desde el JWT de la cookie. */
public record MeResponse(
        Long id,
        String nombreCompleto,
        String cedula,
        String correo,
        String iniciales) {}
