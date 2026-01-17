package com.uberbackend.controller;

import com.uberbackend.dto.request.CreatePaymentRequest;
import com.uberbackend.model.entity.Payment;
import com.uberbackend.model.entity.Tenant;
import com.uberbackend.service.PaymentService;
import com.uberbackend.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<Payment> createPayment(@Valid @RequestBody CreatePaymentRequest request) {

        Payment payment = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }
}