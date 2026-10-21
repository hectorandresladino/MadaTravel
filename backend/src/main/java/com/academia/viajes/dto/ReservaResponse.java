package com.academia.viajes.dto;

import com.academia.viajes.entity.Reserva;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ReservaResponse(String codigo, String estado, BigDecimal totalCop, OffsetDateTime creadaEn) {
    public static ReservaResponse from(Reserva r) {
        return new ReservaResponse(r.getCodigo(), r.getEstado(), r.getTotalCop(), r.getCreadaEn());
    }
}
