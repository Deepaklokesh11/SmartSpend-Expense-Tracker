# SmartSpend

SmartSpend is a personal finance app for tracking income and expenses, organizing transactions by category, and viewing totals in one place. It includes a React frontend and a Spring Boot API with account registration, sign-in, and per-user transaction records.

## Features

- Create an account and sign in
- Record income and expenses with a category, date, and optional description
- View transaction history and income, expense, and net totals
- Secure accounts with hashed passwords and JWT-based authentication

## Tech stack

- Frontend: React 19 and Vite
- Backend: Java 21 and Spring Boot
- Database: MySQL

## Getting started

### Prerequisites

- Node.js and npm
- Java 21
- MySQL

### Configure the database and API

Create a MySQL database named `smart_spend`. The backend reads its connection settings from environment variables. Defaults are shown below; set a strong JWT secret before starting the API.

```text
DB_URL=jdbc:mysql://localhost:3306/smart_spend
DB_USERNAME=root
DB_PASSWORD=your-database-password
JWT_SECRET=your-long-random-secret
```

Run the backend from the `Backend` directory:

```bash
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run`.

### Start the frontend

In a second terminal, run:

```bash
cd Frontend
npm install
npm run dev
```

Open the local URL printed by Vite. During development, Vite proxies `/api` requests to the backend at `http://localhost:8080`.

## Available frontend scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint
