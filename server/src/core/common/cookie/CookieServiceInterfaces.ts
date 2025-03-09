import { FastifyReply } from "fastify";

export interface ICookieService {
  setAuthCookie(reply: FastifyReply, token: string): void;
  clearAuthCookie(reply: FastifyReply): void;
}
