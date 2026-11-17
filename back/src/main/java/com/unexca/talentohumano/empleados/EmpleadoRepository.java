package com.unexca.talentohumano.empleados;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByCedula(String cedula);

    long countByActivoTrue();

    // :q debe llegar ya escapado (% y _ escapados con \) desde el caller.
    @Query("""
        SELECT e FROM Empleado e WHERE e.activo = true AND (
            LOWER(e.cedula)          LIKE LOWER(CONCAT('%', :q, '%')) ESCAPE '\\' OR
            LOWER(e.primerNombre)    LIKE LOWER(CONCAT('%', :q, '%')) ESCAPE '\\' OR
            LOWER(e.apellidoPaterno) LIKE LOWER(CONCAT('%', :q, '%')) ESCAPE '\\'
        ) ORDER BY e.apellidoPaterno, e.primerNombre
        """)
    List<Empleado> buscar(@Param("q") String q, Pageable pageable);
}
