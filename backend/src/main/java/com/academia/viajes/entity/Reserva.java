package com.academia.viajes.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "reservas")
public class Reserva {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "codigo", nullable = false, unique = true, updatable = false, length = 40)
    private String codigo;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paquete_id", nullable = false)
    private Paquete paquete;
    @Column(nullable = false, length = 100)
    private String nombreCliente;
    @Column(nullable = false, length = 150)
    private String correoCliente;
    @Column(nullable = false)
    private Integer viajeros;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalCop;
    @Column(nullable = false, length = 20)
    private String estado;
    @Column(nullable = false)
    private OffsetDateTime creadaEn;

    protected Reserva() {}

    public Reserva(String codigo, Paquete paquete, String nombreCliente,
                   String correoCliente, Integer viajeros, BigDecimal totalCop) {
        this.codigo = codigo;
        this.paquete = paquete;
        this.nombreCliente = nombreCliente;
        this.correoCliente = correoCliente;
        this.viajeros = viajeros;
        this.totalCop = totalCop;
        this.estado = "PENDIENTE";
        this.creadaEn = OffsetDateTime.now();
    }
    public String getCodigo() { return codigo; }
    public String getEstado() { return estado; }
    public BigDecimal getTotalCop() { return totalCop; }
    public OffsetDateTime getCreadaEn() { return creadaEn; }
}
