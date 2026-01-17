package com.uberbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateTenantRequest {
    @NotBlank(message = "name is required")
    private String name;
    private String contactEmail;
}
