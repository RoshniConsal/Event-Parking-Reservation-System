\# VenueFlow — Event \& Parking Reservation System



VenueFlow is a full-stack Event and Parking Reservation System developed using Angular and ASP.NET Core Web API.



The system allows customers to browse events, select seats, reserve parking, create bookings, make payments, and receive notifications. Administrators can manage the complete event reservation workflow through dedicated management dashboards.



\---



\## Project Overview



VenueFlow provides two main user roles:



\- Customer

\- Administrator



The frontend and backend are maintained in separate GitHub repositories.



\### Frontend Repository



```text

https://github.com/RoshniConsal/Event-Parking-Reservation-System.git

```



\### Backend Repository



```text

https://github.com/mathia02/Event--parking-angular-backend.git

```



\---



\## Technology Stack



\### Frontend



\- Angular 22

\- TypeScript

\- HTML5

\- CSS3

\- RxJS

\- Angular Router

\- Angular Forms

\- Angular HttpClient

\- npm



\### Backend



\- ASP.NET Core Web API

\- .NET 8

\- Entity Framework Core

\- SQL Server / LocalDB

\- JWT Authentication

\- Swagger / OpenAPI

\- xUnit

\- Moq



\---



\## Main Features



\### Public



\- Home page

\- Browse events

\- View event details

\- Customer registration

\- Login

\- Email verification

\- Forgot password

\- Reset password

\- Responsive 404 page



\### Customer



\- Customer Dashboard

\- Event browsing

\- Event details

\- Seat selection

\- Parking selection

\- Booking checkout

\- Payment

\- My Bookings

\- Booking Details

\- My Payments

\- My Notifications



\### Administrator



\- Admin Dashboard

\- Venue Management

\- Category Management

\- Event Management

\- Customer Management

\- Booking Management

\- Payment Management

\- Notification Management

\- Seat Management

\- Parking Management



\---



\## Booking Flow



```text

Browse Events

&#x20;     ↓

Event Details

&#x20;     ↓

Seat Selection

&#x20;     ↓

Parking Selection

&#x20;     ↓

Booking Checkout

&#x20;     ↓

Create Booking

&#x20;     ↓

Payment

&#x20;     ↓

Booking Confirmation

```



\---



\## Frontend Project Location



```text

Frontend/event-parking-frontend

```



Main frontend structure:



```text

Frontend/

└── event-parking-frontend/

&#x20;   ├── public/

&#x20;   ├── src/

&#x20;   │   ├── app/

&#x20;   │   │   ├── core/

&#x20;   │   │   ├── features/

&#x20;   │   │   ├── layouts/

&#x20;   │   │   └── shared/

&#x20;   │   ├── environments/

&#x20;   │   ├── main.ts

&#x20;   │   └── styles.css

&#x20;   ├── angular.json

&#x20;   ├── package.json

&#x20;   └── tsconfig.json

```



\---



\## Requirements



Install:



\- Node.js 24

\- npm

\- Angular CLI

\- .NET 8 SDK

\- SQL Server LocalDB or SQL Server

\- Git



Verify:



```bash

node --version

npm --version

ng version

dotnet --version

git --version

```



\---



\## Clone Frontend



```bash

git clone https://github.com/RoshniConsal/Event-Parking-Reservation-System.git

```



Move to the Angular project:



```bash

cd Event-Parking-Reservation-System/Frontend/event-parking-frontend

```



Install dependencies:



```bash

npm install

```



Windows:



```bash

npm.cmd install

```



\---



\## Run Frontend



```bash

npm start

```



Windows:



```bash

npm.cmd start

```



Frontend development URL:



```text

http://localhost:4200

```



\---



\## Clone Backend



```bash

git clone https://github.com/mathia02/Event--parking-angular-backend.git

```



Move to the API project:



```bash

cd Event--parking-angular-backend/Backend/EventParking.Api

```



Run:



```bash

dotnet run --launch-profile https

```



Default development endpoints:



```text

HTTPS:   https://localhost:7080

HTTP:    http://localhost:5080

Swagger: https://localhost:7080/swagger/index.html

```



\---



\## Development Environment



Frontend development configuration:



```text

Frontend/event-parking-frontend/src/environments/environment.ts

```



Default API URL:



```text

https://localhost:7080/api

```



The backend must be running before testing API-dependent frontend features.



\---



\## Production Environment



Frontend production configuration:



```text

Frontend/event-parking-frontend/src/environments/environment.production.ts

```



Before deployment, replace:



```text

https://YOUR-PRODUCTION-BACKEND-URL/api

```



with the actual deployed backend API URL.



Backend production configuration:



```text

Backend/EventParking.Api/appsettings.Production.json

```



Before deployment, replace:



```text

https://YOUR-PRODUCTION-FRONTEND-URL

```



with the deployed Angular frontend URL.



Production secrets such as JWT signing keys, database credentials, and passwords must be stored using secure hosting configuration and must not be committed to GitHub.



\---



\## Frontend Production Build



```bash

cd Frontend/event-parking-frontend

npm run build

```



Windows:



```bash

npm.cmd run build

```



Build output:



```text

dist/event-parking-frontend

```



\---



\## Backend Release Build



From the backend repository root:



```bash

dotnet restore EventParkingReservationSystem.sln

dotnet build EventParkingReservationSystem.sln --configuration Release

```



\---



\## Backend Tests



```bash

dotnet test EventParkingReservationSystem.sln --configuration Release

```



\---



\## Authentication and Authorization



VenueFlow uses JWT authentication.



Supported roles:



```text

Administrator

Customer

```



Angular route guards and authentication state services protect role-specific routes.



Sensitive authentication values are not stored in source control.



\---



\## Core API Areas



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



\---



\## Health Check



```text

GET /api/health

```



Development URL:



```text

https://localhost:7080/api/health

```



\---



\## Important Business Rules



\- Events must start in the future.

\- Event end time must be later than start time.

\- Event capacity cannot exceed venue capacity.

\- Events cannot overlap at the same venue.

\- Customers must be eligible before creating bookings.

\- Only available seats can be reserved.

\- Only available parking slots can be reserved.

\- Pending booking holds can expire automatically.

\- Free bookings can be confirmed automatically.

\- Paid bookings are confirmed after successful payment.

\- Confirmed paid bookings cannot be cancelled because refund functionality is not implemented.

\- Seats and parking slots are released when eligible bookings are cancelled or expired.



\---



\## Git Workflow



Development is completed using feature branches.



Example:



```bash

git checkout develop

git pull origin develop

git checkout -b feature/your-feature-name

```



After completing changes:



```bash

git add .

git commit -m "feat: describe your change"

git push -u origin feature/your-feature-name

```



Create a Pull Request into:



```text

develop

```



\---



\## Security



\- Do not commit JWT signing keys.

\- Do not commit database passwords.

\- Do not commit real user passwords.

\- Use .NET User Secrets for backend development secrets.

\- Use secure environment variables in production.

\- Swagger is enabled only for Development.

\- Production CORS must use the deployed frontend URL.



\---



\## Final Verification



Frontend:



```bash

cd Frontend/event-parking-frontend

npm install

npm run build

```



Backend:



```bash

dotnet restore EventParkingReservationSystem.sln

dotnet build EventParkingReservationSystem.sln --configuration Release

dotnet test EventParkingReservationSystem.sln --configuration Release

```



After both applications are running, complete the full Customer and Administrator regression test.



\---



\## Application Name



```text

VenueFlow

```



VenueFlow provides a unified platform for events, seat reservations, parking reservations, bookings, payments, and notifications.



\---



\## Project Status



```text

Frontend Implementation       Complete

Backend Implementation        Complete

Production Configuration      Prepared

README Documentation          Complete

Full Regression Testing       Pending

```

