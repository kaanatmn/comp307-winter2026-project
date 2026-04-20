# How to Run

This application requires three standard components to run:
- PostgreSQL database,
- Java Spring Boot backend,
- React/Node.js frontend.

---

## Prerequisites

Before starting, ensure your machine has the following installed:

1. Java Development Kit (JDK) 17 or higher
2. Node.js (v16 or higher)
3. PostgreSQL (running locally on the default port 5432)

---

## Step 1: Database Setup

The application uses Hibernate to automatically generate all database tables.
You do not need to run any SQL scripts; you only need to create an empty database.

1. Open your PostgreSQL terminal (psql) or pgAdmin.
2. Create a new database named `mcgill_booking`:

```sql
CREATE DATABASE mcgill_booking;
```

---

## Step 2: Configure Backend Credentials

You must tell the Spring Boot backend how to log into your local PostgreSQL instance.

1. Navigate to the backend resources folder: `backend/src/main/resources/`
2. Open the `application.properties` file.
3. Update the username and password to match your local PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mcgill_booking
spring.datasource.username=YOUR_LOCAL_POSTGRES_USERNAME  # <-- CHANGE THIS
spring.datasource.password=YOUR_LOCAL_POSTGRES_PASSWORD  # <-- CHANGE THIS

# Note: The server will run on port 8088 to avoid common port 8080 conflicts.
server.port=8088
```

---

## Step 3: Start the Spring Boot Backend

1. Open a terminal and navigate to the root of the backend directory.

2. Use the included Maven wrapper to start the server (this ensures the correct Maven version is used automatically):

   - On Mac/Linux: `./mvnw spring-boot:run`
   - On Windows (PowerShell/CMD): `mvnw.cmd spring-boot:run`

3. Wait for the console to display `Started BookingApplication`. The backend is now running securely on http://localhost:8088 and the database tables have been generated.

---

## Step 4: Start the React Frontend

1. Open a new, separate terminal window and navigate to the root of the frontend directory.

2. Install the necessary Node dependencies:

```bash
   npm install
```

3. Start the Vite development server:

```bash
   npm run dev
```

4. The terminal will display a local URL. Open your browser and navigate to: http://localhost:5173

