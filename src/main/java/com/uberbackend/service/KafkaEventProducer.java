package com.uberbackend.service;

import com.uberbackend.event.RideEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class KafkaEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(KafkaEventProducer.class);
    private static final String RIDE_EVENTS_TOPIC = "ride-events";

    @Autowired
    private KafkaTemplate<String, RideEvent> kafkaTemplate;

    public void sendRideEvent(RideEvent event) {
        String key = event.getPassengerId() + ":" + event.getRideId();
        CompletableFuture<SendResult<String, RideEvent>> future = 
            kafkaTemplate.send(RIDE_EVENTS_TOPIC, key, event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("Sent ride event with key=[{}] offset=[{}]", key, result.getRecordMetadata().offset());
            } else {
                logger.error("Unable to send ride event with key=[{}] due to: {}", key, ex.getMessage());
            }
        });
    }
}