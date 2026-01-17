package com.uberbackend.model.entity;

import com.uberbackend.model.enums.RideStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "rides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Ride extends BaseEntity {

    @Column(nullable = false)
    private Long passengerId;
    private Long driverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RideStatus status = RideStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal pickupLatitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal pickupLongitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal dropoffLatitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal dropoffLongitude;

    @Column(length = 500)
    private String pickupAddress;

    @Column(length = 500)
    private String dropoffAddress;

    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedFare;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualFare;

    @Column(length = 50)
    private String idempotencyKey;

    private String city;
}