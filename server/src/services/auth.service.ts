import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../database/models/User';
import config from '../config';
import mongoose from 'mongoose';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email: data.email})

    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = new User(data);
    await newUser.save();

    const token = this.generateToken(newUser);

    return {
      user: {
        id: newUser._id instanceof mongoose.Types.ObjectId
        ? newUser._id.toString()
        : String(newUser._id),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id instanceof mongoose.Types.ObjectId
        ? user._id.toString()
        : String(user._id),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async getUserById(userId: string): Promise<Omit<IUser, 'password'> | null> {
    const user = await User.findById(userId).select('-password');
    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: Omit<IUser, 'password'>[], total: number}> {
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    return { users, total };
  }

  private generateToken(user: IUser): string {
    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }
}

export default new AuthService();
