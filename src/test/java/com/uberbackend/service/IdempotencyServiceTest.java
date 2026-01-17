package com.uberbackend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private IdempotencyService idempotencyService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testIsKeyProcessed_WhenKeyExists() {
        // Arrange
        Long passengerId = 123L;
        String idempotencyKey = "test-key";
        when(redisTemplate.hasKey(anyString())).thenReturn(true);

        // Act
        boolean result = idempotencyService.isKeyProcessed(passengerId, idempotencyKey);

        // Assert
        assertTrue(result);
        verify(redisTemplate).hasKey("idempotency:123:test-key");
    }

    @Test
    void testIsKeyProcessed_WhenKeyDoesNotExist() {
        // Arrange
        Long passengerId = 123L;
        String idempotencyKey = "test-key";
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        // Act
        boolean result = idempotencyService.isKeyProcessed(passengerId, idempotencyKey);

        // Assert
        assertFalse(result);
    }

    @Test
    void testIsKeyProcessed_WhenKeyIsNull() {
        // Act
        boolean result = idempotencyService.isKeyProcessed(123L, null);

        // Assert
        assertFalse(result);
        verify(redisTemplate, never()).hasKey(anyString());
    }

    @Test
    void testMarkKeyAsProcessed() {
        // Arrange
        Long passengerId = 123L;
        String idempotencyKey = "test-key";
        Object result = "result-value";

        // Act
        idempotencyService.markKeyAsProcessed(passengerId, idempotencyKey, result);

        // Assert
        verify(valueOperations).set(eq("idempotency:123:test-key"), eq(result), anyLong(), any());
    }
}