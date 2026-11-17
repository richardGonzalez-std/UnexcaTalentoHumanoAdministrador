package com.unexca.talentohumano.historial;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/historial/prestaciones")
public class HistorialController {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final HistorialPrestacionRepository repo;

    public HistorialController(HistorialPrestacionRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<HistorialPrestacionDto> listar(Authentication auth) {
        return repo.findTop8ByCalculadoPorCedulaOrderByFechaDesc(auth.getName())
                   .stream()
                   .map(h -> new HistorialPrestacionDto(
                           h.getId(), h.getNombreEmpleado(),
                           h.getMotivoTerminacion(), h.getMontoFinal(),
                           h.getFecha().format(ISO)))
                   .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HistorialPrestacionDto guardar(
            @Valid @RequestBody GuardarHistorialRequest req,
            Authentication auth) {

        HistorialPrestacion h = new HistorialPrestacion();
        h.setNombreEmpleado(req.nombreEmpleado());
        h.setMotivoTerminacion(req.motivoTerminacion());
        h.setMontoFinal(req.montoFinal());
        h.setCalculadoPorCedula(auth.getName());
        repo.save(h);

        return new HistorialPrestacionDto(
                h.getId(), h.getNombreEmpleado(),
                h.getMotivoTerminacion(), h.getMontoFinal(),
                h.getFecha().format(ISO));
    }
}
