package com.uberbackend.service;

import com.uberbackend.event.RideEvent;
import com.uberbackend.model.entity.Driver;
import com.uberbackend.model.entity.Ride;
import com.uberbackend.model.entity.Trip;
import com.uberbackend.model.enums.DriverStatus;
import com.uberbackend.model.enums.TripStatus;
import com.uberbackend.repository.DriverRepository;
import com.uberbackend.repository.RideRepository;
import com.uberbackend.repository.TripRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;
    private final KafkaEventProducer kafkaEventProducer;

    private static final Logger logger = LoggerFactory.getLogger(TripService.class);

    @Transactional
    public void endTrip(Long tripId) {
        Trip trip = tripRepository.findByIdAndTenantIdWithLock(tripId).orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));

        if (trip.getStatus() != TripStatus.STARTED) {
            throw new IllegalStateException("Trip cannot be ended. Status: " + trip.getStatus());
        }

        Ride ride = rideRepository.findByIdAndTenantIdWithLock(trip.getRide().getId()).orElseThrow(() -> new RuntimeException("Ride not found"));

        trip.setStatus(TripStatus.COMPLETED);
        trip.setCompletedAt(LocalDateTime.now());
        tripRepository.save(trip);

        // Update driver status back to online
        if (trip.getDriverId() != null) {
            var driverOpt = driverRepository.findByIdAndTenantIdWithLock(trip.getDriverId());
            if (driverOpt.isPresent()) {
                Driver driver = driverOpt.get();
                driver.setStatus(DriverStatus.ONLINE);
                driverRepository.save(driver);
                logger.info("Driver status set back to ONLINE: driverId={}", trip.getDriverId());
            }
        }

        RideEvent event = RideEvent.builder()
            .rideId(ride.getId())
            .passengerId(ride.getPassengerId())
            .driverId(ride.getDriverId())
            .status(ride.getStatus())
            .fare(ride.getActualFare() != null ? ride.getActualFare() : ride.getEstimatedFare())
            .timestamp(LocalDateTime.now())
            .eventType("COMPLETED")
            .build();
        kafkaEventProducer.sendRideEvent(event);

        logger.info("Trip completed: tripId={}, rideId={}", tripId, ride.getId());
    }

    public Trip startTrip(Long rideId) {
        Ride ride = rideRepository.findByIdAndTenantIdWithLock(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));

        if(ride.getStatus() != com.uberbackend.model.enums.RideStatus.ASSIGNED) {
            throw new IllegalStateException("Ride is not available for start trip. Status: " + ride.getStatus());
        }

        Trip trip = new Trip();
        trip.setRide(ride);
        trip.setDriverId(ride.getDriverId());
        trip.setStatus(TripStatus.STARTED);
        trip.setStartedAt(LocalDateTime.now());
        tripRepository.save(trip);

        return trip;
    }
}