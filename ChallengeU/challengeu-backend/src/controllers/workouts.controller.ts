import { Request, Response } from 'express';
import Workout from '../models/workout.model';

class WorkoutsController {
    async createWorkout(req: Request, res: Response) {
        try {
            const { userId, username, calories, date, imageUrl } = req.body;
            const workout = new Workout({ userId, username, calories, date, imageUrl });
            await workout.save();
            res.status(201).json(workout);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAllWorkouts(req: Request, res: Response) {
        try {
            const workouts = await Workout.find().sort({ date: -1 }).limit(100);
            res.status(200).json(workouts);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getWorkoutById(req: Request, res: Response) {
        try {
            const workout = await Workout.findById(req.params.id);
            if (!workout) return res.status(404).json({ message: 'Workout not found' });
            res.status(200).json(workout);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async celebrateWorkout(req: Request, res: Response) {
        try {
            const workout = await Workout.findByIdAndUpdate(
                req.params.id,
                { $inc: { likes: 1 } },
                { new: true }
            );
            if (!workout) return res.status(404).json({ message: 'Workout not found' });
            res.status(200).json(workout);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async uncelebrateWorkout(req: Request, res: Response) {
        try {
            const workout = await Workout.findByIdAndUpdate(
                req.params.id,
                { $inc: { likes: -1 } },
                { new: true }
            );
            if (!workout) return res.status(404).json({ message: 'Workout not found' });
            res.status(200).json(workout);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new WorkoutsController();
