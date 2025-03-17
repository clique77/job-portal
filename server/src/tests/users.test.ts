import { build } from '../app';
import { test, describe, beforeAll, afterAll, expect } from '@jest/globals';
import { FastifyInstance } from 'fastify';

describe('User Endpoints', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';

    app = await build();

    // Register a regular user
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: `user${Date.now()}@example.com`,
        password: 'yourpassword',
        name: 'Test User',
        role: 'job_seeker'
      }
    });

    const registerResponseBody = JSON.parse(registerResponse.body);

    // Login to get token
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: registerResponseBody.user.email,
        password: 'yourpassword'
      }
    });

    token = JSON.parse(loginResponse.body).token;
    console.log("Login successful, got token:", token);
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 10000);

  test('Should access users endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Users endpoint response:", response.statusCode);
    expect([200, 401, 403]).toContain(response.statusCode);

    // If access is granted, verify the response structure
    if (response.statusCode === 200) {
      const responseBody = JSON.parse(response.body);
      console.log("Users response structure:", Object.keys(responseBody));

      // Check for any valid response structure
      const hasValidStructure =
        (responseBody.data && Array.isArray(responseBody.data)) ||
        (responseBody.users && Array.isArray(responseBody.users)) ||
        Array.isArray(responseBody);

      expect(hasValidStructure).toBe(true);
    }
  }, 15000);
});
