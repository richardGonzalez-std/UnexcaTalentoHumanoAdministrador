package com.unexca.talentohumano.empleados;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@Table(name = "empleados")
public class Empleado {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "primer_nombre");
    private String primerNombre;
    @Column(name = "segundo_nombre")
    private String segundoNombre;
    @Column(name = "apellido_paterno")
    private String apellidoPaterno;
    @Column(name = "apellido_materno")
    private String apellidoMaterno;
    @Column(nullable = false, unique = true)
    @Column(name = "cedula")
    private String cedula;
    @Column(name = "telefono")
    private String telefono;
    @Column(nullable = false, unique = true)
    @Column(name = "correo")
    @Email
    private String correo;
    @Column(name = "direccion")
    private String direccion;
    @Column(nullable = false)
    private String passwordHash;
    @Column(nullable = false)
    private Boolean activo = true;
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getPrimerNombre() {
        return primerNombre;
    }
    public void setPrimerNombre(String primerNombre) {
        this.primerNombre = primerNombre;
    }

    public String getSegundoNombre() {
        return segundoNombre;
    }
    public void setSegundoNombre(String segundoNombre) {
        this.segundoNombre = segundoNombre;
    }

    public String getApellidoPaterno() {
        return apellidoPaterno;
    }
    public void setApellidoPaterno(String apellidoPaterno) {
        this.apellidoPaterno = apellidoPaterno;
    }

    public String getApellidoMaterno() {
        return apellidoMaterno;
    }
    public void setApellidoMaterno(String apellidoMaterno) {
        this.apellidoMaterno = apellidoMaterno;
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

    public String getPasswordHash() {
    return passwordHash;
    }
    public void setPasswordHash(String passwordHash; ) {
    this.passwordHash = passwordHash;
    }

    public Boolean getActivo() {
    return activo;
    }
    public void setActivo(Boolean activo) {
    this.activo = activo;
    }
}