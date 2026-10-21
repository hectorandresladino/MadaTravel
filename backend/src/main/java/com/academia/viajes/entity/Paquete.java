package com.academia.viajes.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "paquetes")
public class Paquete {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String nombre;
    @Column(nullable = false, length = 90)
    private String destino;
    @Column(nullable = false, length = 90)
    private String pais;
    @Column(nullable = false)
    private Integer duracionDias;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal precioCop;
    @Column(nullable = false, length = 600)
    private String descripcion;
    @Column(nullable = false)
    private Boolean activo;

    protected Paquete() {}
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getDestino() { return destino; }
    public String getPais() { return pais; }
    public Integer getDuracionDias() { return duracionDias; }
    public BigDecimal getPrecioCop() { return precioCop; }
    public String getDescripcion() { return descripcion; }
    public Boolean getActivo() { return activo; }
}
