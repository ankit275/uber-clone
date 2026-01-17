package com.uberbackend.service;

import com.uberbackend.model.entity.Tenant;
import com.uberbackend.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    public Tenant registerTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    public Optional<Tenant> findById(Long id) {
        return tenantRepository.findById(id);
    }

    public Optional<Tenant> findByName(String name) {
        return tenantRepository.findByName(name);
    }
}
