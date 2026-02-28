import express from 'express';
import { json, urlencoded } from 'body-parser';
import { createServer } from 'http';
import cors from 'cors';
import { connectToDatabase } from './config/database';
import { setupRoutes } from './routes/index';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Connect to the database
connectToDatabase();

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

export default server;