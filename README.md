# VenueVista — EventPro Ticketing & Venue Management System

A full-stack event ticketing and venue management web application built with Spring Boot and Angular.

## Features

- **User Registration & Login** — JWT-based authentication with role-based access (USER / ADMIN)
- **Event Browsing** — Users can browse, search, and filter events by name, category, and city
- **Seat Selection & Booking** — Interactive seat layout with real-time availability, seat type display (VIP, Premium, Regular)
- **Ticket Management** — View booking history, ticket details, print tickets, cancel bookings
- **Venue Management** — Admin can create/edit/delete venues and configure seating layouts
- **Event Management** — Admin can create/edit/delete events with full details
- **Admin Dashboard** — Overview with total events, venues, users, bookings, and revenue
- **Sales Analytics** — Event-wise ticket sales and revenue calculated from actual booking data
- **Booking Validation** — Backend validates seats, prevents double booking, calculates prices server-side

## Tech Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Backend  | Java 17, Spring Boot 3.2, Spring Security, JWT    |
| Frontend | Angular 17, TypeScript, HTML, CSS                 |
| Database | MySQL                                             |
| ORM      | Hibernate / Spring Data JPA                       |
| Auth     | BCrypt password hashing, JWT tokens                |

## Architecture

```
Angular (Frontend)
      ↓ HTTP / REST
Spring Boot (Backend)
      ↓ JPA / Hibernate
MySQL Database
```

### Backend Structure

```
src/main/java/com/venuevista/
├── controller/     — REST API endpoints
├── service/        — Business logic
├── repository/     — Data access (JPA)
├── entity/         — Database entities
├── dto/            — Data transfer objects
├── security/       — JWT, auth filter, user details
├── config/         — Security config, data seeder
└── exception/      — Global exception handling
```

### Frontend Structure

```
src/app/
├── core/
│   ├── services/       — AuthService, EventService, VenueService, BookingService, AdminService
│   ├── guards/         — AuthGuard, AdminGuard
│   └── interceptors/   — JWT Auth Interceptor
├── home/               — Home page
├── auth/               — Login, Register
├── events/             — Event list, Event details, Event booking (seat selection)
├── bookings/           — My bookings, Booking details (ticket view)
└── admin/              — Dashboard, Events management, Venues management, Bookings, Analytics
```

## Database Setup

1. Install MySQL and create a database:

```sql
CREATE DATABASE venuevista;
```

2. The application uses `spring.jpa.hibernate.ddl-auto=update`, so tables are created automatically on first run.

## Environment Variables

| Variable     | Default                              | Description           |
|-------------|--------------------------------------|-----------------------|
| DB_URL      | jdbc:mysql://localhost:3306/venuevista | MySQL connection URL  |
| DB_USERNAME | root                                 | MySQL username        |
| DB_PASSWORD | root                                 | MySQL password        |
| JWT_SECRET  | (auto-generated)                     | JWT signing key       |

You can set these as environment variables or edit `application.properties` directly.

## How to Run

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend starts at: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npx ng serve
```

Frontend starts at: `http://localhost:4200`

## API Endpoints

### Authentication
| Method | Endpoint              | Description    | Auth     |
|--------|----------------------|----------------|----------|
| POST   | /api/auth/register   | Register user  | No       |
| POST   | /api/auth/login      | Login          | No       |

### Events
| Method | Endpoint           | Description       | Auth     |
|--------|-------------------|-------------------|----------|
| GET    | /api/events       | List/search events | No       |
| GET    | /api/events/{id}  | Get event details  | No       |
| POST   | /api/events       | Create event       | ADMIN    |
| PUT    | /api/events/{id}  | Update event       | ADMIN    |
| DELETE | /api/events/{id}  | Delete event       | ADMIN    |

### Venues
| Method | Endpoint                    | Description          | Auth     |
|--------|----------------------------|----------------------|----------|
| GET    | /api/venues                | List venues          | No       |
| GET    | /api/venues/{id}           | Get venue            | No       |
| POST   | /api/venues                | Create venue         | ADMIN    |
| PUT    | /api/venues/{id}           | Update venue         | ADMIN    |
| DELETE | /api/venues/{id}           | Delete venue         | ADMIN    |
| GET    | /api/venues/{id}/seats     | Get seats            | No       |
| POST   | /api/venues/{id}/seats     | Configure seats      | ADMIN    |
| DELETE | /api/venues/{id}/seats     | Delete all seats     | ADMIN    |

### Bookings
| Method | Endpoint                    | Description         | Auth     |
|--------|----------------------------|---------------------|----------|
| POST   | /api/bookings              | Create booking      | USER     |
| GET    | /api/bookings/my           | My bookings         | USER     |
| GET    | /api/bookings/{id}         | Booking details     | USER     |
| PUT    | /api/bookings/{id}/cancel  | Cancel booking      | USER     |

### Admin
| Method | Endpoint                     | Description          | Auth     |
|--------|------------------------------|----------------------|----------|
| GET    | /api/admin/dashboard         | Dashboard stats      | ADMIN    |
| GET    | /api/admin/analytics/sales   | Event sales data     | ADMIN    |
| GET    | /api/admin/bookings          | All bookings         | ADMIN    |
| GET    | /api/admin/users             | All users            | ADMIN    |

## Default Login Credentials

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@venuevista.com   | Admin@123  |
| User  | user@venuevista.com    | User@123   |

## Sample Data

On first run, the application automatically seeds:
- 1 Admin user + 1 regular User
- 3 Venues with configured seats
- 5 Events
- 1 Sample booking with 2 tickets
