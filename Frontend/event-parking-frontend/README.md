# VenueFlow — Event & Parking Reservation System

VenueFlow is a full-stack Event and Parking Reservation System designed to simplify event discovery, seat reservation, parking reservation, booking, payment, and administration.

This repository contains the Angular frontend application.

## Project Overview

VenueFlow provides separate experiences for Customers and Administrators.

Customers can browse events, reserve seats and parking slots, complete bookings and payments, and view their booking history, payments, and notifications.

Administrators can manage venues, event categories, events, customers, bookings, payments, notifications, seats, and parking slots through dedicated management dashboards.

## Main Features

### Public Features

- Home page
- Browse available events
- View event details
- Customer registration
- Customer login
- Email verification
- Forgot password
- Reset password
- Responsive 404 Not Found page

### Customer Features

- Customer dashboard
- Browse and view events
- Seat selection
- Parking slot selection
- Booking checkout
- Payment processing
- My Bookings
- Booking Details
- My Payments
- My Notifications
- Customer profile and authentication state handling

### Administrator Features

- Admin Dashboard
- Venue Management
- Category Management
- Event Management
- Customer Management
- Booking Management
- Payment Management
- Notification Management
- Seat Management
- Parking Slot Management

## Technology Stack

### Frontend

- Angular 22
- TypeScript
- HTML5
- CSS3
- RxJS
- Angular Router
- Angular Forms
- Angular HttpClient
- npm

### Backend

The backend is maintained in a separate repository and uses:

- ASP.NET Core Web API
- .NET 8
- Entity Framework Core
- SQL Server / LocalDB
- JWT Authentication
- Swagger / OpenAPI
- xUnit
- Moq

## Repositories

### Frontend

```text
https://github.com/RoshniConsal/Event-Parking-Reservation-System.git
```

### Backend

```text
https://github.com/mathia02/Event--parking-angular-backend.git
```

## Frontend Project Structure

```text
Event-Parking-Reservation-System/
│
├── Frontend/
│   └── event-parking-frontend/
│       │
│       ├── public/
│       │   └── branding/
│       │
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/
│       │   │   │   ├── guards/
│       │   │   │   ├── interceptors/
│       │   │   │   ├── models/
│       │   │   │   └── services/
│       │   │   │
│       │   │   ├── features/
│       │   │   │   ├── auth/
│       │   │   │   ├── bookings/
│       │   │   │   ├── categories/
│       │   │   │   ├── customers/
│       │   │   │   ├── dashboard/
│       │   │   │   ├── events/
│       │   │   │   ├── notifications/
│       │   │   │   ├── parking/
│       │   │   │   ├── payments/
│       │   │   │   ├── seats/
│       │   │   │   └── venues/
│       │   │   │
│       │   │   ├── layouts/
│       │   │   └── shared/
│       │   │
│       │   ├── environments/
│       │   │   ├── environment.ts
│       │   │   └── environment.production.ts
│       │   │
│       │   ├── main.ts
│       │   └── styles.css
│       │
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
└── README.md
```

## Prerequisites

Before running the frontend, install:

- Node.js 24
- npm
- Angular CLI
- Git

Verify installation:

```bash
node --version
npm --version
ng version
git --version
```

## Clone the Frontend Repository

```bash
git clone https://github.com/RoshniConsal/Event-Parking-Reservation-System.git
```

Move into the Angular project:

```bash
cd Event-Parking-Reservation-System/Frontend/event-parking-frontend
```

## Install Dependencies

```bash
npm install
```

On Windows CMD or PowerShell, if required:

```bash
npm.cmd install
```

## Development Environment

Development API configuration is located in:

```text
src/environments/environment.ts
```

Default development API:

```text
https://localhost:7080/api
```

Make sure the ASP.NET Core backend is running before testing API-dependent frontend features.

## Run the Frontend

```bash
npm start
```

On Windows:

```bash
npm.cmd start
```

The application will be available at:

```text
http://localhost:4200
```

## Run the Backend

Clone the backend repository separately:

```bash
git clone https://github.com/mathia02/Event--parking-angular-backend.git
```

Move into the API project:

```bash
cd Event--parking-angular-backend/Backend/EventParking.Api
```

Run the backend:

```bash
dotnet run --launch-profile https
```

Default development endpoints:

```text
HTTPS: https://localhost:7080
HTTP:  http://localhost:5080
Swagger: https://localhost:7080/swagger/index.html
```

## Production Environment

Frontend production configuration is located in:

```text
src/environments/environment.production.ts
```

Before deployment, replace:

```text
https://YOUR-PRODUCTION-BACKEND-URL/api
```

with the deployed backend API URL.

The Angular production environment is configured using `fileReplacements` in:

```text
angular.json
```

The backend production configuration is stored in:

```text
Backend/EventParking.Api/appsettings.Production.json
```

Before deployment, replace:

```text
https://YOUR-PRODUCTION-FRONTEND-URL
```

with the deployed Angular frontend URL.

Production secrets such as database connection strings and JWT signing keys must be provided through secure environment configuration and must not be committed to GitHub.

## Build the Frontend

Create a production build:

```bash
npm run build
```

On Windows:

```bash
npm.cmd run build
```

Production output will be generated under:

```text
dist/event-parking-frontend
```

## Backend Build

From the backend repository root:

```bash
dotnet restore EventParkingReservationSystem.sln
dotnet build EventParkingReservationSystem.sln --configuration Release
```

## Backend Tests

```bash
dotnet test EventParkingReservationSystem.sln --configuration Release
```

## Authentication and Authorization

VenueFlow uses JWT-based authentication.

Supported roles:

- Administrator
- Customer

Angular route guards and authentication state services are used to protect role-specific pages.

JWT signing keys and development passwords must not be committed to source control.

## Core Booking Flow

The customer reservation flow is:

```text
Browse Event
     ↓
View Event Details
     ↓
Select Seats
     ↓
Select Parking
     ↓
Booking Checkout
     ↓
Create Booking
     ↓
Payment
     ↓
Booking Confirmation
```

## Important Business Rules

- Only active and eligible customers can create bookings.
- Only available seats can be selected.
- Only available parking slots can be selected.
- Pending booking holds can expire automatically.
- Free bookings can be confirmed without payment.
- Paid bookings are confirmed after successful payment.
- Confirmed paid bookings cannot be cancelled because refund functionality is not currently supported.
- Seats and parking slots are released when eligible bookings are cancelled or expired.
- Events cannot overlap at the same venue.

## API Integration

The Angular frontend communicates with the ASP.NET Core backend using HTTP services.

Main API areas include:

```text
/api/auth
/api/bookings
/api/categories
/api/customers
/api/dashboard
/api/events
/api/notifications
/api/parking-slots
/api/payments
/api/seats
/api/venues
/api/health
```

## Health Check

Backend health endpoint:

```text
GET /api/health
```

Example development URL:

```text
https://localhost:7080/api/health
```

## Git Workflow

The project uses feature branches for development.

Example:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

After completing a feature:

```bash
git add .
git commit -m "feat: describe your change"
git push -u origin feature/your-feature-name
```

Then create a Pull Request into:

```text
develop
```

## Final Verification

Before completing the project, verify:

```bash
npm install
npm run build
```

and verify the backend:

```bash
dotnet restore EventParkingReservationSystem.sln
dotnet build EventParkingReservationSystem.sln --configuration Release
dotnet test EventParkingReservationSystem.sln --configuration Release
```

After both applications are running, complete the full Administrator and Customer regression test.

## Security Notes

- Never commit JWT signing keys.
- Never commit database passwords.
- Never commit real customer passwords.
- Use .NET User Secrets for local backend development secrets.
- Use secure environment variables or hosting-provider secrets in production.
- Swagger is intended for Development mode.
- Production CORS must contain the deployed Angular application URL.

## Application Branding

Application Name:

```text
VenueFlow
```

VenueFlow provides a unified experience for managing events, seats, parking reservations, bookings, payments, and notifications.

## Status

Frontend implementation: Complete

Backend implementation: Complete

Production configuration: Prepared

Final full-system regression testing: Pending