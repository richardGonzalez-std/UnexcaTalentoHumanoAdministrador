package com.unexca.talentohumano.login;

import com.unexca.talentohumano.empleados.Empleado;
import com.unexca.talentohumano.empleados.EmpleadoRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LoginService {

    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginService(EmpleadoRepository empleadoRepository, PasswordEncoder passwordEncoder) {
        this.empleadoRepository = empleadoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Empleado autenticar(String cedula, String password) {
        return empleadoRepository.findByCedula(cedula)
                .filter(e -> passwordEncoder.matches(password, e.getPasswordHash()))
                // Cuenta desactivada no puede iniciar sesión. Mismo mensaje genérico que
                // credenciales inválidas: no revelamos si la cuenta existe pero está inactiva.
                .filter(e -> Boolean.TRUE.equals(e.getActivo()))
                .orElseThrow(() -> new CredencialesInvalidasException(
                        "Cédula o contraseña incorrectas"));
    }

    /** Empleado activo a partir de su cédula (para resolver la sesión actual del JWT). */
    public Optional<Empleado> porCedula(String cedula) {
        return empleadoRepository.findByCedula(cedula)
                .filter(e -> Boolean.TRUE.equals(e.getActivo()));
    }
}
