package com.unexca.talentohumano.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad.
 *
 * ESTADO ACTUAL (desarrollo): todos los endpoints están abiertos (permitAll) para
 * poder construir y probar el CRUD y Swagger sin autenticación.
 *
 * PENDIENTE (fase de login): cambiar las reglas para exigir autenticación en las
 * rutas protegidas — p. ej. dejar /api/auth/** abierto y exigir authenticated()
 * en el resto — y elegir el mecanismo (OAuth2 client vs JWT propio).
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // API REST sin estado: deshabilitamos CSRF (se usará token/credenciales, no formularios).
            .csrf(csrf -> csrf.disable())
            // No usamos sesión de servidor; cada petición se autenticará por sí misma (más adelante).
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // DEV: por ahora, todo abierto.
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll());

        return http.build();
    }
}
