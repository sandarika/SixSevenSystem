import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import eventsRoutes from './events.routes';

const router = Router();

const setupRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/events', eventsRoutes);
};

export default setupRoutes;