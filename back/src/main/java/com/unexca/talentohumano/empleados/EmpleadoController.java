package com.unexca.talentohumano.empleados;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoRepository repo;

    public EmpleadoController(EmpleadoRepository repo) {
        this.repo = repo;
    }

    // ── Endpoints existentes (usados por el wizard de prestaciones) ──────────

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
                   .map(EmpleadoController::toResumenDto)
                   .toList();
    }

    // ── CRUD para la pantalla de Empleados ───────────────────────────────────

    @GetMapping("/lista")
    public List<EmpleadoDetalleDto> listar(
            @RequestParam(required = false) String tipo,
            @RequestParam(defaultValue = "false") boolean inactivos) {

        List<Empleado> empleados;
        if (inactivos) {
            empleados = repo.findByActivoFalseOrderByApellidoPaternoAscPrimerNombreAsc();
        } else if (tipo != null && !tipo.isBlank()) {
            try {
                TipoPersonal tp = TipoPersonal.valueOf(tipo.toUpperCase());
                empleados = repo.findByTipoPersonalOrderByApellidoPaternoAscPrimerNombreAsc(tp);
            } catch (IllegalArgumentException e) {
                empleados = repo.findAllByOrderByApellidoPaternoAscPrimerNombreAsc();
            }
        } else {
            empleados = repo.findAllByOrderByApellidoPaternoAscPrimerNombreAsc();
        }
        return empleados.stream().map(EmpleadoController::toDetalleDto).toList();
    }

    @GetMapping("/{id}")
    public EmpleadoDetalleDto obtener(@PathVariable Long id) {
        return toDetalleDto(repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmpleadoDetalleDto crear(@Valid @RequestBody GuardarEmpleadoRequest req) {
        Empleado e = new Empleado();
        aplicar(req, e);
        e.setPasswordHash(""); // empleado de datos, no usuario del sistema
        repo.save(e);
        return toDetalleDto(e);
    }

    @PutMapping("/{id}")
    public EmpleadoDetalleDto actualizar(
            @PathVariable Long id,
            @Valid @RequestBody GuardarEmpleadoRequest req) {

        Empleado e = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        aplicar(req, e);
        repo.save(e);
        return toDetalleDto(e);
    }

    @PatchMapping("/{id}/activo")
    public EmpleadoDetalleDto toggleActivo(@PathVariable Long id) {
        Empleado e = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        e.setActivo(!Boolean.TRUE.equals(e.getActivo()));
        repo.save(e);
        return toDetalleDto(e);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static void aplicar(GuardarEmpleadoRequest req, Empleado e) {
        e.setPrimerNombre(req.primerNombre());
        e.setSegundoNombre(req.segundoNombre());
        e.setApellidoPaterno(req.apellidoPaterno());
        e.setApellidoMaterno(req.apellidoMaterno());
        e.setCedula(req.cedula());
        e.setCorreo(req.correo());
        e.setTelefono(req.telefono());
        e.setDireccion(req.direccion());
        e.setCargo(req.cargo());
        e.setActivo(req.activo() == null ? true : req.activo());
        if (req.tipoPersonal() != null && !req.tipoPersonal().isBlank()) {
            try {
                e.setTipoPersonal(TipoPersonal.valueOf(req.tipoPersonal().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (req.fechaIngreso() != null && !req.fechaIngreso().isBlank()) {
            try {
                e.setFechaIngreso(LocalDate.parse(req.fechaIngreso()));
            } catch (Exception ignored) {}
        } else {
            e.setFechaIngreso(null);
        }
    }

    private static EmpleadoDetalleDto toDetalleDto(Empleado e) {
        String iniciales = (inicial(e.getPrimerNombre()) + inicial(e.getApellidoPaterno())).toUpperCase();
        return new EmpleadoDetalleDto(
                e.getId(),
                e.getPrimerNombre(), e.getSegundoNombre(),
                e.getApellidoPaterno(), e.getApellidoMaterno(),
                e.getCedula(), e.getCorreo(), e.getTelefono(), e.getDireccion(),
                e.getCargo(),
                e.getTipoPersonal() == null ? null : e.getTipoPersonal().name(),
                e.getFechaIngreso() == null ? null : e.getFechaIngreso().toString(),
                e.getActivo(),
                iniciales.isBlank() ? "?" : iniciales);
    }

    private static EmpleadoResumenDto toResumenDto(Empleado e) {
        String nombre = join(e.getPrimerNombre(), e.getApellidoPaterno());
        String iniciales = (inicial(e.getPrimerNombre()) + inicial(e.getApellidoPaterno())).toUpperCase();
        return new EmpleadoResumenDto(
                e.getId(), nombre, e.getCedula(),
                e.getCargo(), e.getFechaIngreso(),
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
