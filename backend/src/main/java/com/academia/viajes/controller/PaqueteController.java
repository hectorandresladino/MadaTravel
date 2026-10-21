package com.academia.viajes.controller;

import com.academia.viajes.dto.PaqueteResponse;
import com.academia.viajes.exception.RecursoNoEncontradoException;
import com.academia.viajes.repository.PaqueteRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/paquetes")
public class PaqueteController {
    private final PaqueteRepository paquetes;
    public PaqueteController(PaqueteRepository paquetes) { this.paquetes = paquetes; }

    @GetMapping
    public List<PaqueteResponse> listar() {
        return paquetes.findByActivoTrueOrderByIdAsc().stream().map(PaqueteResponse::from).toList();
    }

    @GetMapping("/{id}")
    public PaqueteResponse buscar(@PathVariable Long id) {
        return paquetes.findById(id).filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .map(PaqueteResponse::from)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paquete no encontrado"));
    }
}
