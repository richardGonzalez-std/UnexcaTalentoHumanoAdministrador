package com.unexca.talentohumano.config;

import com.unexca.talentohumano.login.JwtCookieFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración de seguridad para el monolito modular (login propio, sin OAuth2).
 *
 * - Las rutas /api/auth/** (login, logout) y la documentación quedan abiertas.
 * - El resto exige autenticación, que se obtiene del JWT en cookie httpOnly
 *   leído por {@link JwtCookieFilter}.
 * - CSRF deshabilitado. Con el front en otro dominio la cookie pasa a SameSite=None,
 *   así que esa ya no es la protección: lo que queda es que todos los endpoints que
 *   mutan estado reciben JSON, y un POST cross-site con Content-Type: application/json
 *   obliga al navegador a hacer preflight, que CORS rechaza si el origen no está en la
 *   lista. Si algún día se agrega un endpoint que acepte form-urlencoded, hay que
 *   habilitar tokens CSRF.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtCookieFilter jwtCookieFilter) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**",
                                 "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtCookieFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * @param origins orígenes autorizados, de la propiedad {@code app.cors.allowed-origins}
     *                (separados por coma). Por defecto los de desarrollo del Next.js local.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") List<String> origins) {
        CorsConfiguration c = new CorsConfiguration();
        // setAllowedOriginPatterns y no setAllowedOrigins: el segundo prohíbe comodines
        // cuando allowCredentials=true, y Vercel crea un subdominio nuevo por cada preview.
        c.setAllowedOriginPatterns(origins);
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }
}
