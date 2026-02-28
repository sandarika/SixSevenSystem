// src/types/index.d.ts

// Define the User type
export interface User {
    id: string;
    username: string;
    email: string;
    password?: string; // Optional for security reasons
    createdAt: Date;
    updatedAt: Date;
}

// Define the Event type
export interface Event {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    participants: User[];
    createdAt: Date;
    updatedAt: Date;
}

// Define the JWT Payload type
export interface JwtPayload {
    id: string;
    username: string;
    email: string;
}