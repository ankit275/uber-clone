package com.uberbackend.dto.response;

import com.uberbackend.model.entity.Ride;
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
public class RideResponse {
    private Long id;
    private Long passengerId;
    private Long driverId;
    private RideStatus status;
    private BigDecimal pickupLatitude;
    private BigDecimal pickupLongitude;
    private BigDecimal dropoffLatitude;
    private BigDecimal dropoffLongitude;
    private String pickupAddress;
    private String dropoffAddress;
    private BigDecimal estimatedFare;
    private BigDecimal actualFare;

    public static RideResponse from(Ride ride) {
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