package com.unexca.talentohumano.login;

import com.unexca.talentohumano.empleados.Empleado;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private static final String COOKIE = "token";

    private final LoginService loginService;
    private final JwtService jwtService;

    public LoginController(LoginService loginService, JwtService jwtService) {
        this.loginService = loginService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        Empleado e = loginService.autenticar(req.cedula(), req.password());
        String token = jwtService.generar(e.getCedula(), e.getId(), req.recordarme());

        ResponseCookie cookie = ResponseCookie.from(COOKIE, token)
                .httpOnly(true)
                .secure(false)          // poner true en producción (HTTPS)
                .sameSite("Lax")
                .path("/")
                .maxAge(req.recordarme() ? jwtService.expSegundos(true) : -1)
                .build();

        String nombre = (safe(e.getPrimerNombre()) + " " + safe(e.getApellidoPaterno())).trim();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new LoginResponse(e.getId(), nombre));
    }

    /** Usuario autenticado actual, resuelto desde el JWT de la cookie. 401 si no hay sesión. */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<Empleado> emp = loginService.porCedula(auth.getName());
        if (emp.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(toMe(emp.get()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from(COOKIE, "")
                .httpOnly(true).path("/").maxAge(0).sameSite("Lax").build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private static MeResponse toMe(Empleado e) {
        String nombre = (safe(e.getPrimerNombre()) + " " + safe(e.getApellidoPaterno())).trim();
        String iniciales = (inicial(e.getPrimerNombre()) + inicial(e.getApellidoPaterno())).toUpperCase();
        return new MeResponse(e.getId(), nombre, e.getCedula(), e.getCorreo(),
                iniciales.isBlank() ? "?" : iniciales);
    }

    private static String inicial(String s) {
        return (s == null || s.isBlank()) ? "" : s.trim().substring(0, 1);
    }

    private static String safe(String s) { return s == null ? "" : s; }
}
