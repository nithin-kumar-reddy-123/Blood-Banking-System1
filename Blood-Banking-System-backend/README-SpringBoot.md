# Spring Boot Backend for Blood Banking System

This project implements the backend using Spring Boot with the following structure:

- `src/main/java/com/bloodbank/BloodBankingSystemApplication.java` - main Spring Boot application class
- `src/main/java/com/bloodbank/entity/Donor.java` - donor entity
- `src/main/java/com/bloodbank/entity/BloodRequest.java` - request entity
- `src/main/java/com/bloodbank/repository/DonorRepository.java` - JPA repository for donors
- `src/main/java/com/bloodbank/repository/BloodRequestRepository.java` - JPA repository for requests
- `src/main/java/com/bloodbank/service/DonorService.java` - donor business logic
- `src/main/java/com/bloodbank/service/BloodRequestService.java` - request business logic
- `src/main/java/com/bloodbank/controller/DonorController.java` - donor API endpoints
- `src/main/java/com/bloodbank/controller/RequestController.java` - request API endpoints

## Endpoints

- `GET /api/donors`
- `POST /api/donors`
- `POST /api/donors/login`
- `GET /api/requests`
- `POST /api/requests`

## Run locally

1. Open `Blood-Banking-System-backend`
2. Run `./mvnw clean package` on macOS/Linux or `mvnw.cmd clean package` on Windows
3. Run `./mvnw spring-boot:run` on macOS/Linux or `mvnw.cmd spring-boot:run` on Windows

The application starts on `http://localhost:8081`.

## Notes

- Uses H2 in-memory database by default.
- CORS is configured for `http://localhost:5173`.
- The H2 console is available at `/h2-console`.
