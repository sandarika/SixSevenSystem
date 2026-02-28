import { User } from '../models/user.model';

export class UserService {
    async createUser(userData: any) {
        const user = new User(userData);
        return await user.save();
    }

    async getUserById(userId: string) {
        return await User.findById(userId);
    }

    async updateUser(userId: string, updateData: any) {
        return await User.findByIdAndUpdate(userId, updateData, { new: true });
    }

    async deleteUser(userId: string) {
        return await User.findByIdAndDelete(userId);
    }

    async getAllUsers() {
        return await User.find();
    }
}