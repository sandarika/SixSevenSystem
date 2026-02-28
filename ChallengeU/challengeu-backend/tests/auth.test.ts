import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary
import { User } from '../src/models/user.model'; // Adjust the path as necessary
import { connect, disconnect } from '../src/config/database'; // Adjust the path as necessary

describe('Auth Controller', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnect();
  });

  describe('POST /auth/login', () => {
    it('should return 200 and a token for valid credentials', async () => {
      const user = {
        username: 'testuser',
        password: 'testpassword',
      };

      // Create a user for testing
      await User.create(user);

      const response = await request(app)
        .post('/auth/login')
        .send(user);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('POST /auth/register', () => {
    it('should return 201 for successful registration', async () => {
      const newUser = {
        username: 'newuser',
        password: 'newpassword',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should return 400 for duplicate username', async () => {
      const duplicateUser = {
        username: 'newuser',
        password: 'anotherpassword',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(duplicateUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Username already exists');
    });
  });
});