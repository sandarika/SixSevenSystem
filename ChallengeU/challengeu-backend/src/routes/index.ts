import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import eventsRoutes from './events.routes';
import workoutsRoutes from './workouts.routes';

const router = Router();

const setupRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/events', eventsRoutes);
    app.use('/api/workouts', workoutsRoutes);
};

export default setupRoutes;
export { setupRoutes };