import { UserRole } from "../../../../data/models/User";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isEmailVerified?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
}

export interface IAuthService {
  register(data: RegisterData): Promise<AuthResponse>;
  login(data: LoginData): Promise<AuthResponse>;
  validateToken(token: string): any;
  verifyEmail(token: string): Promise<boolean>;
  resendVerificationEmail(userId: string): Promise<void>;
}
