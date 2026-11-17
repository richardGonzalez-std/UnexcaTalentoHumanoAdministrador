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

    @GetMapping("/count")
    public java.util.Map<String, Long> count() {
        return java.util.Map.of("total", repo.countByActivoTrue());
    }

    @GetMapping
    public List<EmpleadoResumenDto> buscar(
            @RequestParam(defaultValue = "") String q) {

        String term = q.trim();
        if (term.length() < 2) return List.of();

        return repo.buscar(escapeLike(term), PageRequest.of(0, 5))
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

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private static String join(String a, String b) {
        return ((a == null ? "" : a) + " " + (b == null ? "" : b)).trim();
    }

    private static String inicial(String s) {
        return (s == null || s.isBlank()) ? "" : s.trim().substring(0, 1);
    }
}
