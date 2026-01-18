package com.uberbackend.service;

import com.uberbackend.dto.request.CreatePaymentRequest;
import com.uberbackend.model.entity.Payment;
import com.uberbackend.model.entity.Ride;
import com.uberbackend.model.enums.PaymentStatus;
import com.uberbackend.repository.PaymentRepository;
import com.uberbackend.repository.RideRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final RideRepository rideRepository;
    private final IdempotencyService idempotencyService;

    @Transactional
    public Payment createPayment(CreatePaymentRequest request) {

        Ride ride = rideRepository.findByIdAndTenantIdWithLock(request.getRideId()).orElseThrow(() -> new RuntimeException("Ride not found: " + request.getRideId()));

        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            if (idempotencyService.isKeyProcessed(request.getRideId(), request.getIdempotencyKey())) {
                return paymentRepository.findByIdempotencyKey(request.getIdempotencyKey())
                    .orElseThrow(() -> new RuntimeException("Idempotency key processed but payment not found"));
            }
        }
        Payment payment = Payment.builder()
            .ride(ride)
            .passengerId(ride.getPassengerId())
            .amount(ride.getEstimatedFare())
            .paymentMethod(request.getPaymentMethod())
            .idempotencyKey(request.getIdempotencyKey())
            .build();

        payment = paymentRepository.save(payment);

        try {
            payment.setStatus(PaymentStatus.PROCESSING);
            payment = paymentRepository.save(payment);

            Thread.sleep(100); // Simulate API call

            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(UUID.randomUUID().toString());
            payment.setProcessedAt(LocalDateTime.now());
            payment = paymentRepository.save(payment);

            idempotencyService.markKeyAsProcessed(ride.getId(), request.getIdempotencyKey(), payment.getId());

            logger.info("Payment processed successfully: paymentId={}, rideId={}, amount={}", 
                payment.getId(), request.getRideId(), ride.getActualFare());

        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
            payment = paymentRepository.save(payment);
            logger.error("Payment processing failed: paymentId={}, error={}", payment.getId(), e.getMessage());
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }

        return payment;
    }
}