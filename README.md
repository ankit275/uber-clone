# Uber Backend - Ride Hailing API

A comprehensive Spring Boot 3 backend for ride-hailing services with multi-tenant support, real-time updates, and event-driven architecture.

## Features

- ✅ **Multi-tenant Support** - Tenant isolation using header-based routing
- ✅ **RESTful APIs** - Complete CRUD operations for rides, drivers, trips, and payments
- ✅ **PostgreSQL + JPA** - Persistent data storage with JPA/Hibernate
- ✅ **Redis** - Caching and geo-spatial indexing for driver location
- ✅ **Kafka** - Asynchronous event processing
- ✅ **Idempotency** - Prevents duplicate requests
- ✅ **Transactions & Locking** - Pessimistic locking for data consistency
- ✅ **WebSocket** - Real-time notifications for ride updates
- ✅ **Docker Support** - Complete docker-compose setup
- ✅ **Unit Tests** - Comprehensive test coverage

## Prerequisites

- Java 17+
- Maven 3.6+
- Docker & Docker Compose (for running services)

## Quick Start

### Using Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Kafka + Zookeeper (port 9092)
   - Spring Boot Application (port 8080)

2. **Check application health:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

### Manual Setup

1. **Start dependencies manually:**
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Kafka on port 9092

2. **Update application.yml** with your database credentials

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

## API Endpoints

All requests require the `X-Tenant-Id` header for multi-tenant support.

### Rides

- **POST /rides** - Create a new ride
  ```json
  {
    "passengerId": "passenger-1",
    "pickupLatitude": 40.7128,
    "pickupLongitude": -74.0060,
    "dropoffLatitude": 40.7589,
    "dropoffLongitude": -73.9851,
    "pickupAddress": "123 Main St",
    "dropoffAddress": "456 Park Ave",
    "idempotencyKey": "unique-key-123"
  }
  ```

- **GET /rides/{id}** - Get ride details

### Drivers

- **POST /drivers/{id}/location** - Update driver location
  ```json
  {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```

- **POST /drivers/{id}/accept?rideId={rideId}** - Accept a ride

### Trips

- **POST /trips/{id}/end** - End a trip

### Payments

- **POST /payments** - Process payment
  ```json
  {
    "rideId": 1,
    "passengerId": "passenger-1",
    "amount": 25.50,
    "paymentMethod": "credit_card",
    "idempotencyKey": "payment-key-123"
  }
  ```

## WebSocket

Connect to WebSocket for real-time updates:

```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
  // Subscribe to ride updates
  stompClient.subscribe('/topic/rides/{rideId}', function(message) {
    const rideEvent = JSON.parse(message.body);
    console.log('Ride update:', rideEvent);
  });
});
```

## Architecture

### Multi-Tenancy
- Tenant ID is extracted from `X-Tenant-Id` header
- All entities include `tenantId` field
- Data is isolated per tenant at the database level

### Idempotency
- Idempotency keys are stored in Redis with TTL of 24 hours
- Duplicate requests with the same key return the original response

### Transactions & Locking
- Pessimistic locking (`PESSIMISTIC_WRITE`) is used for critical operations
- Prevents race conditions in ride assignment and payment processing

### Event-Driven
- Kafka topics: `ride-events`
- Events are consumed and forwarded via WebSocket to clients

### Geo-Spatial Indexing
- Driver locations are stored in Redis Geo indexes
- Nearby drivers are found using radius queries

## Configuration

Environment variables (via `application.yml` or environment):

- `DB_USERNAME` - PostgreSQL username (default: `uberuser`)
- `DB_PASSWORD` - PostgreSQL password (default: `uberpass`)
- `REDIS_HOST` - Redis host (default: `localhost`)
- `REDIS_PORT` - Redis port (default: `6379`)
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka bootstrap servers (default: `localhost:9092`)
- `SERVER_PORT` - Application port (default: `8080`)

## Testing

Run unit tests:
```bash
mvn test
```

## Project Structure

```
src/
├── main/
│   ├── java/com/uberbackend/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── consumer/        # Kafka consumers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── event/           # Event models
│   │   ├── model/           # Entity models
│   │   ├── repository/      # JPA repositories
│   │   └── service/         # Business logic
│   └── resources/
│       └── application.yml  # Configuration
└── test/                    # Unit tests
```

## Deployment

### Build Docker Image
```bash
docker build -t uber-backend:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

### Production Considerations

1. **Database**: Use managed PostgreSQL service (RDS, Cloud SQL, etc.)
2. **Redis**: Use managed Redis service (ElastiCache, Memorystore, etc.)
3. **Kafka**: Use managed Kafka service (MSK, Confluent Cloud, etc.)
4. **Secrets**: Use secret management (AWS Secrets Manager, Vault, etc.)
5. **Monitoring**: Add APM (New Relic, Datadog, etc.)
6. **Scaling**: Use horizontal pod autoscaling in Kubernetes
7. **Security**: Enable HTTPS, add authentication/authorization
8. **Rate Limiting**: Implement rate limiting per tenant

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.