package com.uberbackend.consumer;

import com.uberbackend.event.RideEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class RideEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(RideEventConsumer.class);

    private final SimpMessagingTemplate messagingTemplate;

    public RideEventConsumer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "ride-events", groupId = "uber-backend-group")
    public void consumeRideEvent(RideEvent event) {
        logger.info("Consuming ride event: rideId={}, status={}, eventType={}", 
            event.getRideId(), event.getStatus(), event.getEventType());
        
        // Send WebSocket notification to passenger
        String destination = "/topic/rides/" + event.getRideId();
        messagingTemplate.convertAndSend(destination, event);
        
        // Send notification to driver if assigned
        if (event.getDriverId() != null) {
            String driverDestination = "/topic/drivers/" + event.getDriverId() + "/rides";
            messagingTemplate.convertAndSend(driverDestination, event);
        }
    }
}