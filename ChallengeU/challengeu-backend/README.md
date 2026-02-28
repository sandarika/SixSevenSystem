# ChallengeU Backend

This is the backend for the ChallengeU application, designed to support the ChallengeU mobile app for UNL students. The backend is built using Node.js, Express, and MongoDB, providing a RESTful API for user authentication, event management, and user data handling.

## Project Structure

The project is organized into several directories and files, each serving a specific purpose:

```
├── src
│   ├── index.ts             # Entry point of the application
│   ├── app.ts               # Express application setup
│   ├── controllers          # Controllers for handling requests
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   └── events.controller.ts
│   ├── routes               # Route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   └── events.routes.ts
│   ├── models               # Mongoose models
│   │   ├── user.model.ts
│   │   └── event.model.ts
│   ├── services             # Business logic services
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── middleware           # Middleware functions
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── config               # Configuration files
│   │   ├── index.ts
│   │   └── database.ts
│   ├── utils                # Utility functions
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── types                # TypeScript types
│       └── index.d.ts
├── tests                    # Unit tests
│   ├── auth.test.ts
│   └── users.test.ts
├── scripts                  # Scripts for development
│   └── start.sh
├── package.json             # NPM dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── nodemon.json             # Nodemon configuration
├── jest.config.ts           # Jest configuration for testing
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── Dockerfile               # Dockerfile for containerization
└── docker-compose.yml       # Docker Compose configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd challengeu-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values.

### Running the Application

1. Start the application:
   ```bash
   npm run dev
   ```

2. The server will run on `http://localhost:5000` (or the port specified in your environment variables).

### Testing

To run the tests, use:
```bash
npm test
```

## API Documentation

Refer to the individual route files for detailed API documentation on authentication, user management, and event handling.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.