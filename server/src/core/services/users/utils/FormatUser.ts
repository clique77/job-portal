import { IUser } from "../../../../data/models/User";
import mongoose from 'mongoose';

export class FormatUser {
  execute(user: IUser) {
    return {
      id: user._id instanceof mongoose.Types.ObjectId
        ? user._id.toString()
        : String(user._id),
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}
