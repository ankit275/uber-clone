package com.uberbackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "Ride ID is required")
    private Long rideId;

    private String paymentMethod;

    private String idempotencyKey;
}