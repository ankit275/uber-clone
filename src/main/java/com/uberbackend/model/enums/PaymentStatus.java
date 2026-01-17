package com.uberbackend.model.enums;

import lombok.Getter;

@Getter
public enum PaymentStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    REFUNDED
}