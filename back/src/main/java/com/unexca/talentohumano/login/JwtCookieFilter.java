package com.unexca.talentohumano.login;

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

@Component
public class JwtCookieFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtCookieFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            for (Cookie c : cookies) {
                if ("token".equals(c.getName())) {
                    jwtService.validar(c.getValue()).ifPresent(claims -> {
                        var auth = new UsernamePasswordAuthenticationToken(
                                claims.cedula(), null, List.of());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
                    break;
                }
            }
        }
        chain.doFilter(request, response);
    }
}
