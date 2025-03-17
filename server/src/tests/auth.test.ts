import { build } from '../app';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import { FastifyInstance } from 'fastify';

describe('Authentication Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    app = await build();
    // No need to listen on a port when using inject()
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 20000);

  test('Should register a new user', async () => {
    const uniqueEmail = `employer${Date.now()}@example.com`;

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        email: uniqueEmail,
        password: 'securepassword123',
        name: 'Test Employer',
        role: 'employer'
      }
    });

    console.log("Registration response:", response.statusCode, JSON.parse(response.body));
    expect(response.statusCode).toBe(200);

    const responseBody = JSON.parse(response.body);
    expect(responseBody.user).toBeDefined();
    expect(responseBody.user.email).toBe(uniqueEmail);
  }, 30000);

  test('Should login with registered credentials', async () => {
    const email = `logintest${Date.now()}@example.com`;
    const password = 'securepassword123';

    // First register a user
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        email: email,
        password: password,
        name: 'Login Test User',
        role: 'employer'
      }
    });

    // Then try to login
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        email: email,
        password: password
      }
    });

    console.log("Login response:", loginResponse.statusCode, JSON.parse(loginResponse.body));
    expect(loginResponse.statusCode).toBe(200);

    const responseBody = JSON.parse(loginResponse.body);
    expect(responseBody.token).toBeDefined();
  }, 30000);
});
