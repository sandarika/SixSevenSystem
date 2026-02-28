import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';

const router = Router();
const eventsController = new EventsController();

// Define routes for event management
router.post('/', eventsController.createEvent);
router.get('/', eventsController.getAllEvents);
router.get('/:id', eventsController.getEventById);
router.put('/:id', eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

export default router;