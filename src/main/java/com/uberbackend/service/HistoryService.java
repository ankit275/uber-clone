package com.uberbackend.service;

import com.uberbackend.dto.response.RideResponse;
import com.uberbackend.dto.response.DriverHistoryResponse;
import com.uberbackend.dto.response.DriverSummaryResponse;
import com.uberbackend.model.entity.Driver;
import com.uberbackend.model.entity.Ride;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoryService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<RideResponse> getDriverRideHistory(Long driverId) {
        List<Ride> rides = entityManager.createQuery(
                "SELECT r FROM Ride r WHERE r.driverId = :driverId ORDER BY r.createdAt DESC",
                Ride.class)
            .setParameter("driverId", driverId)
            .getResultList();
        return rides.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<RideResponse> getTenantRideHistory(Long tenantId) {
        List<Ride> rides = entityManager.createQuery(
                "SELECT r FROM Ride r, Driver d WHERE r.driverId = d.id AND d.tenantId = :tenantId ORDER BY r.createdAt DESC",
                Ride.class)
            .setParameter("tenantId", tenantId)
            .getResultList();
        return rides.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public DriverHistoryResponse getDriverHistoryWithDetails(Long driverId) {
        Driver driver = entityManager.find(Driver.class, driverId);
        if (driver == null) {
            throw new RuntimeException("Driver not found: " + driverId);
        }

        DriverSummaryResponse driverDto = DriverSummaryResponse.builder()
            .id(driver.getId())
            .tenantId(driver.getTenantId())
            .name(driver.getName())
            .phoneNumber(driver.getPhoneNumber())
            .vehicleModel(driver.getVehicleModel())
            .status(driver.getStatus())
            .city(driver.getCity())
            .build();

        List<RideResponse> rides = getDriverRideHistory(driverId);

        return DriverHistoryResponse.builder()
            .driver(driverDto)
            .rides(rides)
            .build();
    }

    private RideResponse mapToResponse(Ride ride) {
        return RideResponse.builder()
            .id(ride.getId())
            .passengerId(ride.getPassengerId())
            .driverId(ride.getDriverId())
            .status(ride.getStatus())
            .pickupLatitude(ride.getPickupLatitude())
            .pickupLongitude(ride.getPickupLongitude())
            .dropoffLatitude(ride.getDropoffLatitude())
            .dropoffLongitude(ride.getDropoffLongitude())
            .pickupAddress(ride.getPickupAddress())
            .dropoffAddress(ride.getDropoffAddress())
            .estimatedFare(ride.getEstimatedFare())
            .actualFare(ride.getActualFare())
            .build();
    }
}
