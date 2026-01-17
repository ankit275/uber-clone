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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RideServiceTest {

    @Mock
    private RideRepository rideRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private RedisGeoService redisGeoService;

    @Mock
    private IdempotencyService idempotencyService;

    @Mock
    private KafkaEventProducer kafkaEventProducer;

    @InjectMocks
    private RideService rideService;

    private static final Long PASSENGER_ID = 101L;
    private static final Long DRIVER_ID = 200L;

    @Test
    void testCreateRide_Success() {
        // Arrange
        CreateRideRequest request = new CreateRideRequest();
        request.setPassengerId(PASSENGER_ID);
        request.setCity("nyc");
        request.setPickupLatitude(new BigDecimal("40.7128"));
        request.setPickupLongitude(new BigDecimal("-74.0060"));
        request.setDropoffLatitude(new BigDecimal("40.7589"));
        request.setDropoffLongitude(new BigDecimal("-73.9851"));

        when(redisGeoService.findNearbyDrivers(anyString(), anyDouble(), anyDouble(), anyDouble()))
            .thenReturn(java.util.List.of(String.valueOf(DRIVER_ID)));

        Driver driver = new Driver();
        driver.setStatus(DriverStatus.ONLINE);
        when(driverRepository.findByIdAndTenantIdWithLock(eq(DRIVER_ID)))
            .thenReturn(Optional.of(driver));

        Ride savedRide = new Ride();
        savedRide.setId(1L);
        savedRide.setPassengerId(PASSENGER_ID);
        savedRide.setDriverId(DRIVER_ID);
        savedRide.setStatus(RideStatus.ASSIGNED);
        savedRide.setPickupLatitude(request.getPickupLatitude());
        savedRide.setPickupLongitude(request.getPickupLongitude());
        when(rideRepository.save(any(Ride.class))).thenReturn(savedRide);

        // Act
        RideResponse response = rideService.createRide(request);

        // Assert
        assertNotNull(response);
        assertEquals(PASSENGER_ID, response.getPassengerId());
        assertEquals(DRIVER_ID, response.getDriverId());
        assertEquals(RideStatus.ASSIGNED, response.getStatus());
        verify(rideRepository).save(any(Ride.class));
        verify(kafkaEventProducer).sendRideEvent(any(RideEvent.class));
    }

    @Test
    void testCreateRide_WithIdempotencyKey() {
        // Arrange
        CreateRideRequest request = new CreateRideRequest();
        request.setPassengerId(PASSENGER_ID);
        request.setCity("nyc");
        request.setPickupLatitude(new BigDecimal("40.7128"));
        request.setPickupLongitude(new BigDecimal("-74.0060"));
        request.setIdempotencyKey("idempotency-key-123");

        Ride existingRide = new Ride();
        existingRide.setId(1L);
        existingRide.setPassengerId(PASSENGER_ID);

        when(idempotencyService.isKeyProcessed(eq(PASSENGER_ID), eq("idempotency-key-123")))
            .thenReturn(true);
        when(rideRepository.findByIdempotencyKeyAndPassengerId(eq("idempotency-key-123"), eq(PASSENGER_ID)))
            .thenReturn(Optional.of(existingRide));

        // Act
        RideResponse response = rideService.createRide(request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(rideRepository, never()).save(any(Ride.class));
    }

    @Test
    void testGetRide_Success() {
        // Arrange
        Long rideId = 1L;
        Ride ride = new Ride();
        ride.setId(rideId);
        ride.setPassengerId(PASSENGER_ID);

        when(rideRepository.findById(rideId))
            .thenReturn(Optional.of(ride));

        // Act
        RideResponse response = rideService.getRide(rideId);

        // Assert
        assertNotNull(response);
        assertEquals(rideId, response.getId());
    }

    @Test
    void testGetRide_NotFound() {
        // Arrange
        Long rideId = 1L;
        when(rideRepository.findById(rideId))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> rideService.getRide(rideId));
    }
}