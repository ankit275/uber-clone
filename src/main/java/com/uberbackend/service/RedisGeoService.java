package com.uberbackend.service;

import lombok.RequiredArgsConstructor;
import org.redisson.api.GeoUnit;
import org.redisson.api.RGeo;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
@RequiredArgsConstructor
public class RedisGeoService {

    private static final String GEO_KEY_PREFIX = "drivers:geo:";

    private final RedissonClient redissonClient;

    public void updateDriverLocation(Long driverId, String city, double lat, double lon) {
        String key = GEO_KEY_PREFIX + city;
        RGeo<String> geo = redissonClient.getGeo(key);

        geo.add(lon, lat, driverId.toString());
    }

    public Collection<String> findNearbyDrivers(
            String city, double lat, double lon, double radiusKm) {

        String key = GEO_KEY_PREFIX + city;
        RGeo<String> geo = redissonClient.getGeo(key);

        return geo.radius(lon, lat, radiusKm, GeoUnit.KILOMETERS);
    }

    public void removeDriver(Long driverId, String city) {
        String key = GEO_KEY_PREFIX + city;
        RGeo<String> geo = redissonClient.getGeo(key);

        geo.remove(driverId.toString());
    }
}