import { FastifyReply } from 'fastify';

export class CookieService {
  private COOKIE_NAME = 'token';
  private COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

  constructor(cookieName = 'token', maxAge = 7 * 24 * 60 * 60 * 1000) {
    this.COOKIE_NAME = cookieName;
    this.COOKIE_MAX_AGE = maxAge;
  }

  setAuthCookie(reply: FastifyReply, token: string): void {
    reply.setCookie(this.COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.COOKIE_MAX_AGE,
    });
  }

  clearAuthCookie(reply: FastifyReply): void {
    reply.clearCookie(this.COOKIE_NAME, { path: '/' });
  }
}

export const cookieService = new CookieService();
export default cookieService;
