package com.uberbackend.model.enums;

import lombok.Getter;

@Getter
public enum RideStatus {
    PENDING,
    ASSIGNED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}