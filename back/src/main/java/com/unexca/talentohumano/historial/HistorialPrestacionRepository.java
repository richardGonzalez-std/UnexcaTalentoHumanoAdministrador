package com.unexca.talentohumano.historial;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialPrestacionRepository extends JpaRepository<HistorialPrestacion, Long> {
    List<HistorialPrestacion> findTop8ByCalculadoPorCedulaOrderByFechaDesc(String cedula);
}
