import express from 'express';
import mongoose from 'mongoose';
import config from './config';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.server.port || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});