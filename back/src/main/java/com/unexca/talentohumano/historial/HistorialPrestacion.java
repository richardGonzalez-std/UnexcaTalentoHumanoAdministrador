package com.unexca.talentohumano.historial;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_prestaciones")
public class HistorialPrestacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreEmpleado;

    @Column(nullable = false)
    private String motivoTerminacion;

    @Column(nullable = false)
    private Double montoFinal;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(nullable = false)
    private String calculadoPorCedula;

    public Long getId() { return id; }

    public String getNombreEmpleado() { return nombreEmpleado; }
    public void setNombreEmpleado(String v) { this.nombreEmpleado = v; }

    public String getMotivoTerminacion() { return motivoTerminacion; }
    public void setMotivoTerminacion(String v) { this.motivoTerminacion = v; }

    public Double getMontoFinal() { return montoFinal; }
    public void setMontoFinal(Double v) { this.montoFinal = v; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime v) { this.fecha = v; }

    public String getCalculadoPorCedula() { return calculadoPorCedula; }
    public void setCalculadoPorCedula(String v) { this.calculadoPorCedula = v; }
}
