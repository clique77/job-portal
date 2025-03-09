import User, { IUser } from '../../models/User';
import { IUserRepository, UserCreateData } from './UserRepository';

export class UserMongoDBRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async create(userData: UserCreateData): Promise<IUser> {
    const user = new User(userData);
    return user.save();``
  }

  async findAll(skip: number, limit: number): Promise<IUser[]> {
    return User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async count(): Promise<number> {
    return User.countDocuments();
  }
}
