package com.uberbackend.model.entity;

import com.uberbackend.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payment_passenger_status", columnList = "passenger_id, status"),
    @Index(name = "idx_payment_ride", columnList = "passenger_id,ride_id"),
    @Index(name = "idx_payment_idempotency", columnList = "idempotency_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;

    @Column(nullable = false)
    private Long passengerId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(length = 50)
    private String paymentMethod;

    @Column(length = 100)
    private String transactionId;

    @Column(length = 50, unique = true)
    private String idempotencyKey;

    @Column
    private LocalDateTime processedAt;

    @Column(length = 500)
    private String failureReason;
}