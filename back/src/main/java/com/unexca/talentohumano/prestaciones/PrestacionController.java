package com.unexca.talentohumano.prestaciones;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prestaciones")
public class PrestacionController {
    // 1. Declaramos el Cerebro
    private final PrestacionService prestacionService;

    // 2. Inyección de Dependencias (Spring conecta los cables aquí)
    public PrestacionController(PrestacionService prestacionService) {
        this.prestacionService = prestacionService;
    }

    // 3. El Endpoint (La ruta web exacta)
    @PostMapping("/calcular")
    public ResponseEntity<Double> calcularPrestaciones(@RequestBody DatosLiquidacionRequest request) {
        
        // Le pasamos la caja de datos al servicio para que haga la magia
        double montoFinal = prestacionService.calcularPrestacionesSociales(request);
        
        // Devolvemos el número con un código de estado HTTP 200 (OK)
        return ResponseEntity.ok(montoFinal);
    }

}
