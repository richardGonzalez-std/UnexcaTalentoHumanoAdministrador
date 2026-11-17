package com.unexca.talentohumano.empleados;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoRepository repo;

    public EmpleadoController(EmpleadoRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<EmpleadoResumenDto> buscar(
            @RequestParam(defaultValue = "") String q) {

        if (q.isBlank()) return List.of();

        return repo.buscar(q.trim(), PageRequest.of(0, 5))
                   .stream()
                   .map(EmpleadoController::toDto)
                   .toList();
    }

    private static EmpleadoResumenDto toDto(Empleado e) {
        String nombre = join(e.getPrimerNombre(), e.getApellidoPaterno());
        String iniciales = (inicial(e.getPrimerNombre()) + inicial(e.getApellidoPaterno())).toUpperCase();
        return new EmpleadoResumenDto(
                e.getId(),
                nombre,
                e.getCedula(),
                e.getCargo(),
                e.getFechaIngreso(),
                iniciales.isBlank() ? "?" : iniciales);
    }

    private static String join(String a, String b) {
        return ((a == null ? "" : a) + " " + (b == null ? "" : b)).trim();
    }

    private static String inicial(String s) {
        return (s == null || s.isBlank()) ? "" : s.trim().substring(0, 1);
    }
}
