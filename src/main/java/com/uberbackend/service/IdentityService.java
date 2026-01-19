package com.uberbackend.service;

import com.uberbackend.dto.response.IdentityResponse;
import com.uberbackend.model.entity.Driver;
import com.uberbackend.model.entity.Tenant;
import com.uberbackend.repository.DriverRepository;
import com.uberbackend.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdentityService {

    private final TenantRepository tenantRepository;
    private final DriverRepository driverRepository;

    public Optional<IdentityResponse> lookupByEmail(String email) {
        // Find tenant by contact email
        Optional<Tenant> tenantOpt = tenantRepository.findByContactEmail(email);
        if (tenantOpt.isEmpty()) {
            return Optional.empty();
        }
        Tenant tenant = tenantOpt.get();

        // Attempt to find any driver under this tenant (fast-path; schema has no driver email)
        Optional<Driver> driverOpt = driverRepository.findAll().stream()
                .filter(d -> tenant.getId().equals(d.getTenantId()))
                .findFirst();

        IdentityResponse resp = new IdentityResponse(
                tenant.getId(),
                driverOpt.map(Driver::getId).orElse(null),
                driverOpt.isPresent()
        );
        return Optional.of(resp);
    }
}
