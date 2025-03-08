import { IUser } from "../../data/models/User";

export interface ITokenService {
  generateToken(user: IUser): string;
  verifyToken(token: string): any;
  decodeToken(token: string): any;
}
