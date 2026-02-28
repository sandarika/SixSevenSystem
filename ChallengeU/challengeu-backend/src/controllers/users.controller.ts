import { Request, Response } from 'express';
import UserService from '../services/user.service';

class UsersController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async getUserProfile(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.id;
            const userProfile = await this.userService.getUserById(userId);
            return res.status(200).json(userProfile);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching user profile', error });
        }
    }

    public async updateUserProfile(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.id;
            const updatedData = req.body;
            const updatedUser = await this.userService.updateUser(userId, updatedData);
            return res.status(200).json(updatedUser);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating user profile', error });
        }
    }

    public async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.id;
            await this.userService.deleteUser(userId);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting user', error });
        }
    }
}

export default UsersController;