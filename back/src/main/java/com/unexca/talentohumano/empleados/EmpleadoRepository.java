package com.unexca.talentohumano.empleados;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByCedula(String cedula);

    @Query("""
        SELECT e FROM Empleado e WHERE e.activo = true AND (
            LOWER(e.cedula)          LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(e.primerNombre)    LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(e.apellidoPaterno) LIKE LOWER(CONCAT('%', :q, '%'))
        ) ORDER BY e.apellidoPaterno, e.primerNombre
        """)
    List<Empleado> buscar(@Param("q") String q, Pageable pageable);
}
