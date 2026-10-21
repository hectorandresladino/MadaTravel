package com.academia.viajes.controller;

import com.academia.viajes.dto.CrearReservaRequest;
import com.academia.viajes.dto.ReservaResponse;
import com.academia.viajes.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservas")
public class ReservaController {
    private final ReservaService service;
    public ReservaController(ReservaService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponse crear(@Valid @RequestBody CrearReservaRequest request) {
        return service.crear(request);
    }
}
