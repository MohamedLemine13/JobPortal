# Job Portal - Developer Walkthrough

This document outlines the architecture, setup, and usage of the Job Portal backend.

## 🏗️ Project Architecture

The backend is built with Spring Boot 4 and PostgreSQL, following a standard layered architecture:

| Layer | Package | Description |
|-------|---------|-------------|
| **Controller** | `com.jobportal.controller` | REST API endpoints |
| **Service** | `com.jobportal.service` | Business logic and transaction management |
| **Repository** | `com.jobportal.repository` | Data access (Spring Data JPA) |
| **Entity** | `com.jobportal.entity` | Database models |
| **DTO** | `com.jobportal.dto` | Data Transfer Objects for API |
| **Security** | `com.jobportal.security` | JWT auth and Role-Based Access Control |

## 🚀 Getting Started

### Prerequisites
- JDK 21+
- PostgreSQL (Database `job_portal`)

### Configuration
Update `src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/job_portal
spring.datasource.username=postgres
spring.datasource.password=00000000
jwt.secret=your-super-secret-key...
```

### Running the Application
```bash
./mvnw spring-boot:run
```
*Note: The application will automatically migrate the database schema using Flyway on startup.*

## 🧪 API Endpoints

### Authentication
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`

### Jobs
- **List Jobs**: `GET /api/jobs` (Public)
- **Create Job**: `POST /api/jobs` (Employer)
- **Apply**: `POST /api/applications` (Job Seeker)

## 🛠️ Troubleshooting

- **ObjectMapper Error**: If you see an error about `ObjectMapper` bean missing, ensure `WebConfig` is present and `spring-boot-starter-web` is in `pom.xml`.
- **Database Connection**: Ensure Postgres is running and credentials match `application.properties`.
