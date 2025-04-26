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

  async updateProfile(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true, select: '-password' }
    );
  }

  async updatePassword(id: string, hashedPassword: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true, select: '-password' }
    );
  }

  async updateProfilePicture(id: string, picturePath: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { $set: { profilePicture: picturePath } },
      { new: true, select: '-password' }
    );
  }
}
