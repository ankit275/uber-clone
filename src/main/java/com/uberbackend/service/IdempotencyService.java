package com.uberbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class IdempotencyService {

    private static final String IDEMPOTENCY_KEY_PREFIX = "idempotency:";
    private static final long IDEMPOTENCY_TTL_HOURS = 24;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public boolean isKeyProcessed(Long passengerId, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return false;
        }
        String key = IDEMPOTENCY_KEY_PREFIX + passengerId + ":" + idempotencyKey;
        return redisTemplate.hasKey(key);
    }

    public void markKeyAsProcessed(Long passengerId, String idempotencyKey, Object result) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }
        String key = IDEMPOTENCY_KEY_PREFIX + passengerId + ":" + idempotencyKey;
        redisTemplate.opsForValue().set(key, result, IDEMPOTENCY_TTL_HOURS, TimeUnit.HOURS);
    }

    public Object getProcessedResult(Long tenantId, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }
        String key = IDEMPOTENCY_KEY_PREFIX + tenantId + ":" + idempotencyKey;
        return redisTemplate.opsForValue().get(key);
    }
}