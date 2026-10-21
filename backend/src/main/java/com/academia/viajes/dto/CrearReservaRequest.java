package com.academia.viajes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearReservaRequest(
    @NotNull(message = "Debe seleccionar un paquete") Long paqueteId,
    @NotBlank @Size(min = 3, max = 100) String nombreCliente,
    @NotBlank @Email @Size(max = 150) String correoCliente,
    @NotNull @Min(1) @Max(10) Integer viajeros
) {}
