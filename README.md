# Login Project

A full-stack authentication application built with React, Node.js, Express, and MySQL.

This project was developed to practice full-stack web development, REST APIs, database integration, and user authentication.

## Features

- User registration with input validation
- User login with email and password
- Password hashing using bcrypt
- JWT-based authentication
- Protected API endpoint for authenticated users
- Password reset functionality
- MySQL database integration
- React frontend with routing

## Technologies

**Frontend**
- React
- JavaScript
- Vite
- React Router

**Backend**
- Node.js
- Express
- MySQL (mysql2)
- bcrypt
- JSON Web Tokens (JWT)
- dotenv
- CORS

## Project Structure

```text
login-project/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── test.http
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── LoginSignUp/
│   │   └── ProtectedRoute/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- MySQL

### 1. Clone the repository

```bash
git clone https://github.com/smikander/login-project.git
cd login-project
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory.

```env
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key
```

Replace the placeholder values with your own database credentials and a securely generated JWT secret.

Do not commit the `.env` file to GitHub.

### 5. Set up the database

Create a MySQL database and configure the required tables.

The backend uses a `users` table to store user accounts and a `password_reset_tokens` table to manage password reset requests.

**Note:** The database schema is not currently included as an SQL setup script in the repository. The required tables must be configured before running the application.

### 6. Start the backend

From the `backend` directory:

```bash
node server.js
```

The backend runs at:

`http://localhost:3000`

### 7. Start the frontend

Open another terminal in the project root:

```bash
npm run dev
```

Vite displays the local development URL in the terminal.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check backend availability |
| GET | `/db-test` | Test database connectivity |
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user and return a JWT |
| GET | `/me` | Access authenticated user information |
| POST | `/forgot-password` | Request a password reset |
| POST | `/reset-password` | Reset a password using a valid token |

The `/me` endpoint requires a valid JWT in the Authorization header.

## Authentication and Security

The backend implements several authentication-related security measures:

- Passwords are hashed using bcrypt before being stored.
- Database queries use parameterized values.
- Registration input is validated.
- JWTs are used to authenticate requests to protected endpoints.
- Password reset tokens are generated using cryptographically secure random bytes.
- Only SHA-256 hashes of password reset tokens are stored in the database.
- Password reset tokens expire after 15 minutes and are invalidated after use.

These measures are part of a learning project and should not be interpreted as a complete production security assessment.

## Limitations

This application is a learning project and is not intended for production use without further development and security testing.

The password reset functionality is implemented for local testing. Instead of sending a reset link by email, the backend prints the link to the console.

The project also requires manual MySQL database configuration.

## Possible Future Improvements

- Add automated backend and frontend tests
- Provide an SQL database initialization script
- Implement email delivery for password reset links
- Improve error handling and user feedback
- Review and strengthen security for production environments

## Project Status

This project is currently a completed learning exercise. Further improvements may be added in the future.

## Author

[smikander](https://github.com/smikander)
