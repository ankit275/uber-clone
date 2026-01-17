package com.uberbackend.model.entity;

import com.uberbackend.model.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Driver extends BaseEntity {

    // Tenant id moved to concrete entities (BaseEntity was generalized).
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    private String name;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String licenseNumber;

    @Column(nullable = false)
    private String vehicleModel;

    @Column(nullable = false)
    private String vehiclePlateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DriverStatus status = DriverStatus.OFFLINE;

    @Column(precision = 10, scale = 7)
    private BigDecimal currentLatitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal currentLongitude;

    private String city;

    @Column(name = "location_updated_at")
    private java.time.LocalDateTime locationUpdatedAt;
}