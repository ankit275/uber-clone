package com.uberbackend.dto.response;

import com.uberbackend.model.entity.Driver;
import com.uberbackend.model.enums.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverSummaryResponse {
    private Long id;
    private Long tenantId;
    private String name;
    private String phoneNumber;
    private String vehicleModel;
    private DriverStatus status;
    private String city;

    public static DriverSummaryResponse from(Driver driver) {
        return DriverSummaryResponse.builder()
                .id(driver.getId())
                .tenantId(driver.getTenantId())
                .name(driver.getName())
                .phoneNumber(driver.getPhoneNumber())
                .vehicleModel(driver.getVehicleModel())
                .status(driver.getStatus())
                .city(driver.getCity())
                .build();
    }
}
