package com.uberbackend.service;

import com.uberbackend.dto.request.UpdateDriverLocationRequest;
import com.uberbackend.dto.response.DriverHistoryResponse;
import com.uberbackend.model.entity.Driver;
import com.uberbackend.model.entity.Ride;
import com.uberbackend.model.enums.DriverStatus;
import com.uberbackend.model.enums.RideStatus;
import com.uberbackend.repository.DriverRepository;
import com.uberbackend.repository.RideRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private static final Logger logger = LoggerFactory.getLogger(DriverService.class);

    private final DriverRepository driverRepository;
    private final RideRepository rideRepository;
    private final RedisGeoService redisGeoService;

    @Transactional
    public void updateDriverLocation(Long driverId, UpdateDriverLocationRequest request) {
        Driver driver = driverRepository.findByIdAndTenantIdWithLock(driverId)
            .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));

        driver.setCurrentLatitude(request.getLatitude());
        driver.setCurrentLongitude(request.getLongitude());
        driver.setLocationUpdatedAt(LocalDateTime.now());
        driver.setCity(request.getCity());

        driverRepository.save(driver);

        // Update Redis geo index if driver is online
        if (driver.getStatus() == DriverStatus.ONLINE) {
            redisGeoService.updateDriverLocation(
                driver.getId(),
                driver.getCity(),
                request.getLatitude().doubleValue(),
                request.getLongitude().doubleValue()
            );
            logger.debug("Updated driver location in Redis geo index: driverId={}", driverId);
        }

        logger.info("Updated driver location: driverId={}, lat={}, lon={}", 
            driverId, request.getLatitude(), request.getLongitude());
    }

    @Transactional
    public void acceptRide(Long driverId, Long rideId) {
        // Lock driver to prevent concurrent modifications
        Driver driver = driverRepository.findByIdAndTenantIdWithLock(driverId)
            .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));

        if (driver.getStatus() != DriverStatus.ONLINE) {
            throw new IllegalStateException("Driver must be online to accept rides");
        }

        // Lock ride to prevent concurrent modifications
        var rideOpt = rideRepository.findByIdAndTenantIdWithLock(rideId);
        if (rideOpt.isEmpty()) {
            throw new RuntimeException("Ride not found: " + rideId);
        }

        Ride ride = rideOpt.get();
        
        if (ride.getStatus() != RideStatus.PENDING) {
            throw new IllegalStateException("Ride is not available for acceptance. Status: " + ride.getStatus());
        }

        // Update ride
        ride.setDriverId(driverId);
        ride.setStatus(RideStatus.ASSIGNED);
        rideRepository.save(ride);

        // Update driver status
        driver.setStatus(DriverStatus.IN_RIDE);
        driverRepository.save(driver);

        // Remove driver from geo index (not available for new rides)
        redisGeoService.removeDriver(driverId, driver.getCity());

        logger.info("Driver accepted ride: driverId={}, rideId={}", 
            driverId, rideId);
    }

    @Transactional
    public Driver createDriver(Driver driver) {
        // Ensure uniqueness by phone number globally (previous per-tenant id removed)
        var existing = driverRepository.findAll().stream()
            .filter(d -> driver.getPhoneNumber().equals(d.getPhoneNumber()))
            .findAny();
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Driver already exists with phone: " + driver.getPhoneNumber());
        }

        driver.setStatus(DriverStatus.OFFLINE);
        return driverRepository.save(driver);
    }

    @Transactional
    public void updateDriverStatus(Long driverId, String status) {
        DriverStatus newStatus;
        try {
            newStatus = DriverStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status. Allowed: ONLINE, OFFLINE");
        }

        Driver driver = driverRepository.findByIdAndTenantIdWithLock(driverId)
            .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));

        driver.setStatus(newStatus);
        driverRepository.save(driver);
        logger.info("Updated driver status: driverId={}, status={}", driverId, newStatus);
    }

    @Transactional
    public DriverHistoryResponse getDriverDetail(Long driverId) {
        Driver driver = driverRepository.findByIdAndTenantIdWithLock(driverId)
            .orElseThrow(() -> new RuntimeException("Driver not found: " + driverId));
        List<Ride> history = rideRepository.findByDriverIdOrderByCreatedAtDesc(driverId); // order by createdAt desc

        return DriverHistoryResponse.from(driver, history);
    }
}