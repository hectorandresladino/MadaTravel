package com.academia.viajes.service;

import com.academia.viajes.dto.CrearReservaRequest;
import com.academia.viajes.entity.Paquete;
import com.academia.viajes.entity.Reserva;
import com.academia.viajes.exception.RecursoNoEncontradoException;
import com.academia.viajes.repository.PaqueteRepository;
import com.academia.viajes.repository.ReservaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {
    @Mock PaqueteRepository paquetes;
    @Mock ReservaRepository reservas;
    @InjectMocks ReservaService service;

    @Test
    void noPermiteReservarPaqueteInexistente() {
        when(paquetes.findById(999L)).thenReturn(Optional.empty());
        assertThrows(RecursoNoEncontradoException.class, () ->
                service.crear(new CrearReservaRequest(999L, "Ana Pérez", "ana@example.com", 2)));
        verifyNoInteractions(reservas);
    }
}
