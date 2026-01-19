package com.uberbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdentityResponse {
    private Long tenantId;
    private Long driverId;
    private boolean isDriver;
}
