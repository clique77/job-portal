import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser } from '../../../../data/models/User';
import config from '../../../../config';

export class TokenService {
  private readonly jwtSecret: string;
  private readonly expiresIn: SignOptions['expiresIn'] = '7d';

  constructor() {
    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    this.jwtSecret = config.jwtSecret;
  }

  generateToken(user: IUser): string {
    const payload = { id: user._id, role: user.role };
    const secret = this.jwtSecret as Secret;
    const options: SignOptions = { expiresIn: this.expiresIn };

    return jwt.sign(payload, secret, options);
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

export default new TokenService();
