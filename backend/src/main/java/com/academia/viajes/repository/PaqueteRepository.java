package com.academia.viajes.repository;

import com.academia.viajes.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaqueteRepository extends JpaRepository<Paquete, Long> {
    List<Paquete> findByActivoTrueOrderByIdAsc();
}
