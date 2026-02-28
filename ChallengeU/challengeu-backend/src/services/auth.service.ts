import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { config } from '../config';

export class AuthService {
    async register(userData: { email: string; password: string; }): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
            email: userData.email,
            password: hashedPassword,
        });
        return await user.save();
    }

    async login(email: string, password: string): Promise<string | null> {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
            return token;
        }
        return null;
    }

    async verifyToken(token: string): Promise<any> {
        try {
            return jwt.verify(token, config.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}