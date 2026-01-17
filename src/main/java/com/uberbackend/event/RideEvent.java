package com.uberbackend.event;

import com.uberbackend.model.enums.RideStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideEvent {
    private Long rideId;
    private Long passengerId;
    private Long driverId;
    private RideStatus status;
    private BigDecimal pickupLatitude;
    private BigDecimal pickupLongitude;
    private BigDecimal dropoffLatitude;
    private BigDecimal dropoffLongitude;
    private BigDecimal fare;
    private LocalDateTime timestamp;
    private String eventType; // CREATED, UPDATED, COMPLETED, CANCELLED
}