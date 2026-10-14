# ft_Transcendance Backend

This is the backend service for the ft_Transcendance project. It provides the application server, authentication flow, session management, MongoDB models, and the routes used by the web app.

## Overview

The backend is built with:
- Node.js
- Express
- MongoDB + Mongoose
- EJS for server-rendered views
- Cookie/session-based authentication
- dotenv for environment configuration

## Project structure

```text
backend/
├── src/
│   ├── main.js
│   ├── controllers/
│   ├── models/
│   │   └── Schemas/
│   ├── routes/
│   │   ├── get_routes/
│   │   └── post_routes/
│   └── views/
├── package.json
├── README.MD
└── .env
```

## Prerequisites

Before running the app, make sure you have:
- Node.js installed
- MongoDB running locally or a reachable MongoDB instance
- npm installed

## Environment variables

Create a `.env` file in the `backend` directory with the following values:

```env
SESSION_SECRET=your_session_secret
MONGO_URL=mongodb://127.0.0.1:27017/ft_transcendence
PORT=3000
```

Notes:
- `SESSION_SECRET` is used for Express session security.
- `MONGO_URL` should point to your Mongo database.
- `PORT` is the port the backend listens on.

## Installation

From the backend directory:

```bash
npm install
```

## Running the server

Development mode:

```bash
npm run devStart
```

Or directly:

```bash
node src/main.js
```

The server will start at:

```text
http://localhost:3000
```

## Main routes

### Authentication
- `GET /login` → renders the login page
- `POST /login` → authenticates the user
- `GET /signup` → renders the signup page
- `POST /signup` → creates a new user

### Dashboard and app pages
- `GET /dashboard` → home/dashboard page
- `GET /MyGroups` → list of user groups
- `GET /Friends` → friends page
- `GET /notifications` → notifications page
- `GET /CreateGroup` → group creation page
- `POST /CreateGroup` → creates a new group

### Expenses and settlements
- `POST /createExpense` → creates a new expense
- `GET /getExpenses` → retrieves expenses
- `POST /createSettlement` → creates a settlement record

## Session behavior

The app uses Express sessions and stores session data in MongoDB via `connect-mongo`. Authenticated routes are protected by the middleware in `src/controllers/middleware.js`.

## Notes

This project is still under active development, and some routes or logic may still evolve as the application is refined.

## Troubleshooting

If the backend does not start:
1. Verify MongoDB is running.
2. Check that the `.env` file exists and contains valid values.
3. Ensure dependencies were installed correctly with `npm install`.
4. Confirm the port is not already in use.

## License

ISC
