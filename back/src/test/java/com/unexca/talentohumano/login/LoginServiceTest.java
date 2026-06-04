package com.unexca.talentohumano.login;

import com.unexca.talentohumano.empleados.Empleado;
import com.unexca.talentohumano.empleados.EmpleadoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LoginServiceTest {

    private final EmpleadoRepository repo = mock(EmpleadoRepository.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final LoginService service = new LoginService(repo, encoder);

    private Empleado empleadoConPassword(String plano) {
        Empleado e = new Empleado();
        e.setId(1L);
        e.setCedula("V-12345678");
        e.setPrimerNombre("Ana");
        e.setApellidoPaterno("López");
        e.setPasswordHash(encoder.encode(plano));
        e.setActivo(true);
        return e;
    }

    @Test
    void autenticaConCredencialesCorrectas() {
        when(repo.findByCedula("V-12345678")).thenReturn(Optional.of(empleadoConPassword("secreto")));
        Empleado e = service.autenticar("V-12345678", "secreto");
        assertEquals(1L, e.getId());
    }

    @Test
    void rechazaCedulaInexistente() {
        when(repo.findByCedula("V-0")).thenReturn(Optional.empty());
        assertThrows(CredencialesInvalidasException.class,
                () -> service.autenticar("V-0", "x"));
    }

    @Test
    void rechazaPasswordIncorrecta() {
        when(repo.findByCedula("V-12345678")).thenReturn(Optional.of(empleadoConPassword("secreto")));
        assertThrows(CredencialesInvalidasException.class,
                () -> service.autenticar("V-12345678", "malo"));
    }
}
