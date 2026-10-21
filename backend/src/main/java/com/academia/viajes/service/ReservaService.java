package com.academia.viajes.service;

import com.academia.viajes.dto.CrearReservaRequest;
import com.academia.viajes.dto.ReservaResponse;
import com.academia.viajes.entity.Paquete;
import com.academia.viajes.entity.Reserva;
import com.academia.viajes.exception.RecursoNoEncontradoException;
import com.academia.viajes.repository.PaqueteRepository;
import com.academia.viajes.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class ReservaService {
    private final PaqueteRepository paquetes;
    private final ReservaRepository reservas;

    public ReservaService(PaqueteRepository paquetes, ReservaRepository reservas) {
        this.paquetes = paquetes;
        this.reservas = reservas;
    }

    @Transactional
    public ReservaResponse crear(CrearReservaRequest request) {
        Paquete paquete = paquetes.findById(request.paqueteId())
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .orElseThrow(() -> new RecursoNoEncontradoException("Paquete no disponible"));
        String codigo = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Reserva reserva = new Reserva(
                codigo, paquete, request.nombreCliente().trim(),
                request.correoCliente().trim().toLowerCase(), request.viajeros(),
                paquete.getPrecioCop().multiply(java.math.BigDecimal.valueOf(request.viajeros())));
        return ReservaResponse.from(reservas.save(reserva));
    }
}
