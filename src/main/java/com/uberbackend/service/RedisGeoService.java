package com.uberbackend.service;

import org.redisson.api.GeoUnit;
import org.redisson.api.RGeo;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class RedisGeoService {

    private static final String GEO_KEY_PREFIX = "drivers:geo:";

    @Autowired
    private RedissonClient redissonClient;

    public void updateDriverLocation(Long driverId, String city, double latitude, double longitude) {
        String key = GEO_KEY_PREFIX + city;
        RGeo<Long> geo = redissonClient.getGeo(key);
        geo.add(longitude, latitude, driverId);
    }

    public Collection<Long> findNearbyDrivers(String city, double latitude, double longitude, double radiusKm) {
        String key = GEO_KEY_PREFIX + city;
        RGeo<Long> geo = redissonClient.getGeo(key);
        return geo.radius(longitude, latitude, radiusKm, GeoUnit.KILOMETERS);
    }

    public void removeDriver(Long driverId, String city) {
        String key = GEO_KEY_PREFIX + city;
        RGeo<String> geo = redissonClient.getGeo(key);
        geo.remove(driverId);
    }
}