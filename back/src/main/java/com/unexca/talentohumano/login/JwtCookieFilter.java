package com.unexca.talentohumano.login;

import com.unexca.talentohumano.empleados.EmpleadoRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el JWT de la cookie "token", valida su firma y autentica la petición.
 *
 * Además de la firma, revalida contra la base de datos que el empleado siga
 * existiendo y esté ACTIVO. Esto da revocación efectiva: si una cuenta se
 * desactiva, sus tokens emitidos dejan de funcionar en la siguiente petición
 * (sin esperar a que el JWT expire).
 */
@Component
public class JwtCookieFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final EmpleadoRepository empleadoRepository;

    public JwtCookieFilter(JwtService jwtService, EmpleadoRepository empleadoRepository) {
        this.jwtService = jwtService;
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            for (Cookie c : cookies) {
                if ("token".equals(c.getName())) {
                    jwtService.validar(c.getValue())
                        // El token es válido en firma/expiración; ahora exigimos que el
                        // empleado exista y esté activo (revocación al desactivar la cuenta).
                        .flatMap(claims -> empleadoRepository.findByCedula(claims.cedula()))
                        .filter(emp -> Boolean.TRUE.equals(emp.getActivo()))
                        .ifPresent(emp -> {
                            var auth = new UsernamePasswordAuthenticationToken(
                                    emp.getCedula(), null, List.of());
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        });
                    break;
                }
            }
        }
        chain.doFilter(request, response);
    }
}
