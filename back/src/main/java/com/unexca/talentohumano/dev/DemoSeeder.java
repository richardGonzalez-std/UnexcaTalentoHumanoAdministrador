package com.unexca.talentohumano.dev;

import com.unexca.talentohumano.empleados.Empleado;
import com.unexca.talentohumano.empleados.EmpleadoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
public class DemoSeeder implements CommandLineRunner {

    private final EmpleadoRepository repo;
    private final PasswordEncoder encoder;

    public DemoSeeder(EmpleadoRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (repo.findByCedula("V-12345678").isPresent()) return;
        Empleado e = new Empleado();
        e.setCedula("V-12345678");
        e.setPrimerNombre("Ana");
        e.setSegundoNombre("María");
        e.setApellidoPaterno("López");
        e.setApellidoMaterno("Pérez");
        e.setCorreo("ana.lopez@unexca.edu.ve");
        e.setTelefono("0414-1234567");
        e.setDireccion("Caracas");
        e.setPasswordHash(encoder.encode("Unexca2026"));
        e.setActivo(true);
        repo.save(e);
        System.out.println(">>> Empleado de prueba creado: V-12345678 / Unexca2026");
    }
}
