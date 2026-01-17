package com.uberbackend.model.enums;

import lombok.Getter;

@Getter
public enum TripStatus {
    PENDING,
    STARTED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}