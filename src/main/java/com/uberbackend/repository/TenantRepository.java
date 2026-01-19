package com.uberbackend.repository;

import com.uberbackend.model.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    // Optionally find by name
    Optional<Tenant> findByName(String name);

    // Find by contactEmail
    Optional<Tenant> findByContactEmail(String contactEmail);
}
