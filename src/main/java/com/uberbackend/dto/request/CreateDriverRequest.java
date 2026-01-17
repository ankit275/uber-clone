package com.uberbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDriverRequest {

    @NotBlank(message = "phoneNumber is required")
    @Size(min = 6, max = 20)
    private String phoneNumber;

    @NotBlank(message = "licenseNumber is required")
    private String licenseNumber;

    @NotBlank(message = "vehicleModel is required")
    private String vehicleModel;

    @NotBlank(message = "vehiclePlateNumber is required")
    private String vehiclePlateNumber;

    // Optional: tenantId can be provided explicitly in the request
    private Long tenantId;
}
