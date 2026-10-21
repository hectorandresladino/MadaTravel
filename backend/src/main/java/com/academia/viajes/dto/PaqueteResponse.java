package com.academia.viajes.dto;

import com.academia.viajes.entity.Paquete;
import java.math.BigDecimal;

public record PaqueteResponse(
    Long id, String nombre, String destino, String pais,
    Integer duracionDias, BigDecimal precioCop, String descripcion
) {
    public static PaqueteResponse from(Paquete p) {
        return new PaqueteResponse(p.getId(), p.getNombre(), p.getDestino(), p.getPais(),
                p.getDuracionDias(), p.getPrecioCop(), p.getDescripcion());
    }
}
