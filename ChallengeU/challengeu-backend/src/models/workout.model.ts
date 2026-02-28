import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkout extends Document {
    userId?: string;
    username: string;
    calories: number;
    date: Date;
    likes: number;
    imageUrl?: string;
}

const WorkoutSchema: Schema = new Schema({
    userId: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    calories: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    likes: {
        type: Number,
        default: 0,
    },
    imageUrl: {
        type: String,
    },
});

const Workout = mongoose.model<IWorkout>('Workout', WorkoutSchema);

export default Workout;
