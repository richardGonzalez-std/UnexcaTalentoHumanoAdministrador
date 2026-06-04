package com.unexca.talentohumano.login;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwt =
        new JwtService("secreto-de-prueba-con-mas-de-32-bytes-ok!!", 120, 10080);

    @Test
    void generaYValidaToken() {
        String token = jwt.generar("V-12345678", 1L, false);
        var claims = jwt.validar(token);
        assertTrue(claims.isPresent());
        assertEquals("V-12345678", claims.get().cedula());
        assertEquals(1L, claims.get().empleadoId());
    }

    @Test
    void tokenAlteradoEsInvalido() {
        String token = jwt.generar("V-12345678", 1L, false);
        assertTrue(jwt.validar(token + "x").isEmpty());
    }
}
