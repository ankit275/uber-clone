package com.uberbackend.service;

import com.uberbackend.dto.request.CreateRideRequest;
import com.uberbackend.dto.response.RideResponse;
import com.uberbackend.event.RideEvent;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;

@Service
@RequiredArgsConstructor
public class RideService {

    private static final Logger logger = LoggerFactory.getLogger(RideService.class);
    private static final double SEARCH_RADIUS_KM = 5.0;
    private static final BigDecimal BASE_FARE = new BigDecimal("2.50");
    private static final BigDecimal PER_KM_FARE = new BigDecimal("1.20");

    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;
    private final RedisGeoService redisGeoService;
    private final IdempotencyService idempotencyService;
    private final KafkaEventProducer kafkaEventProducer;

    @Transactional
    public RideResponse createRide(CreateRideRequest request) {

        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            if (idempotencyService.isKeyProcessed(request.getPassengerId(), request.getIdempotencyKey())) {
                Ride existingRide = rideRepository.findByIdempotencyKeyAndPassengerId(request.getIdempotencyKey(), request.getPassengerId()).orElseThrow(() -> new RuntimeException("Idempotency key processed but ride not found"));
                return mapToResponse(existingRide);
            }
        }

        Collection<String> nearbyDriverIds = redisGeoService.findNearbyDrivers(
            request.getCity(),
            request.getPickupLatitude().doubleValue(),
            request.getPickupLongitude().doubleValue(),
            SEARCH_RADIUS_KM
        );

        Long assignedDriverId = null;
        if (!nearbyDriverIds.isEmpty()) {
            // Find first available driver
            for (String driverIdStr : nearbyDriverIds) {
                try {
                    Long driverId = Long.parseLong(driverIdStr);
                    Driver driver = driverRepository.findByIdAndTenantIdWithLock(driverId)
                        .orElse(null);
                    if (driver != null && driver.getStatus() == DriverStatus.ONLINE) {
                        assignedDriverId = driverId;
                        break;
                    }
                } catch (NumberFormatException nfe) {
                    // skip invalid member
                }
            }
        }

        // Calculate estimated fare
        BigDecimal estimatedFare = calculateEstimatedFare(
            request.getPickupLatitude(),
            request.getPickupLongitude(),
            request.getDropoffLatitude(),
            request.getDropoffLongitude()
        );

        // Create ride
        Ride ride = Ride.builder()
            .passengerId(request.getPassengerId())
            .driverId(assignedDriverId)
            .status(assignedDriverId != null ? RideStatus.ASSIGNED : RideStatus.PENDING)
            .pickupLatitude(request.getPickupLatitude())
            .pickupLongitude(request.getPickupLongitude())
            .dropoffLatitude(request.getDropoffLatitude())
            .dropoffLongitude(request.getDropoffLongitude())
            .pickupAddress(request.getPickupAddress())
            .dropoffAddress(request.getDropoffAddress())
            .estimatedFare(estimatedFare)
            .city(request.getCity())
            .idempotencyKey(request.getIdempotencyKey())
            .build();

        ride = rideRepository.save(ride);

        // Mark idempotency key as processed
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            idempotencyService.markKeyAsProcessed(request.getPassengerId(), request.getIdempotencyKey(), ride.getId());
        }

        // Publish event
        RideEvent event = RideEvent.builder()
            .rideId(ride.getId())
            .passengerId(ride.getPassengerId())
            .driverId(ride.getDriverId())
            .status(ride.getStatus())
            .pickupLatitude(ride.getPickupLatitude())
            .pickupLongitude(ride.getPickupLongitude())
            .dropoffLatitude(ride.getDropoffLatitude())
            .dropoffLongitude(ride.getDropoffLongitude())
            .fare(ride.getEstimatedFare())
            .timestamp(LocalDateTime.now())
            .eventType("CREATED")
            .build();
        kafkaEventProducer.sendRideEvent(event);

        logger.info("Created ride: id={}, passengerId={}, driverId={}", 
            ride.getId(), ride.getPassengerId(), ride.getDriverId());

        return mapToResponse(ride);
    }

    @Transactional
    public RideResponse getRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found: " + rideId));
        return mapToResponse(ride);
    }

    @Transactional
    public RideResponse endRide(Long rideId) {
        Ride ride = rideRepository.findById(rideId)
            .orElseThrow(() -> new RuntimeException("Ride not found: " + rideId));

        ride.setStatus(RideStatus.COMPLETED);
        ride = rideRepository.save(ride);

        logger.info("Ended ride: id={}", ride.getId());
        return mapToResponse(ride);
    }

    private BigDecimal calculateEstimatedFare(BigDecimal pickupLat, BigDecimal pickupLon, 
                                             BigDecimal dropoffLat, BigDecimal dropoffLon) {
        if (dropoffLat == null || dropoffLon == null) {
            return BASE_FARE;
        }
        // Simple distance calculation (Haversine formula simplified)
        // In production, use proper distance calculation
        double distanceKm = Math.abs(dropoffLat.doubleValue() - pickupLat.doubleValue()) * 111.0;
        return BASE_FARE.add(PER_KM_FARE.multiply(new BigDecimal(distanceKm)));
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