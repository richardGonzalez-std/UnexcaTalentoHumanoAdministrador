package com.unexca.talentohumano.prestaciones;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prestaciones")
public class PrestacionController {
    private final PrestacionService prestacionService;

    public PrestacionController(PrestacionService prestacionService) {
        this.prestacionService = prestacionService;
    }

    @PostMapping("/calcular")
    public ResponseEntity<Double> calcularPrestaciones(@RequestBody DatosLiquidacionRequest request) {
        
        double montoFinal = prestacionService.calcularPrestacionesSociales(request);
        
        return ResponseEntity.ok(montoFinal);
    }

}
