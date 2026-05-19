package com.unexca.empleados;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity 
public class Empleado {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String primernombre;
    private String segundonombre;
    private String apellidopaterno;
    private String apellidomaterno;
    private String cedula;
    private Double telefono;
    private String correo;
    private String direccion;
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getPrimernombre() {
        return primernombre;
    }
    public void setPrimernombre(String primernombre) {
        this.primernombre = primernombre;
    }

    public String getSegundonombre() {
        return segundonombre;
    }
    public void setSegundonombre(String segundonombre) {
        this.segundonombre = segundonombre;
    }

    public String getApellidopaterno() {
        return apellidopaterno;
    }
    public void setApellidopaterno(String apellidopaterno) {
        this.apellidopaterno = apellidopaterno;
    }

    public String getApellidomaterno() {
        return apellidomaterno;
    }
    public void setApellidomaterno(String apellidomaterno) {
        this.apellidomaterno = apellidomaterno;
    }

    public String getCedula() {
        return cedula;
    }
    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public Double getTelefono() {
        return telefono;
    }
    public void setTelefono(Double telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    
    public String getDireccion() {
        return direccion;
    }
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}