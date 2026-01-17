package com.uberbackend.repository;

import com.uberbackend.model.entity.Ride;
import com.uberbackend.model.enums.RideStatus;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Ride r WHERE r.id = :id")
    Optional<Ride> findByIdAndTenantIdWithLock(@Param("id") Long id);

    Optional<Ride> findByIdempotencyKeyAndPassengerId(String idempotencyKey, @NotBlank(message = "Passenger ID is required") Long passengerId);
}