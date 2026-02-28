import request from 'supertest';
import app from '../src/app'; // Adjust the path if necessary
import { User } from '../src/models/user.model';

describe('User Management', () => {
  let userId: string;

  beforeAll(async () => {
    // Create a test user
    const response = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      });
    userId = response.body._id;
  });

  afterAll(async () => {
    // Clean up the test user
    await User.findByIdAndDelete(userId);
  });

  it('should fetch user profile', async () => {
    const response = await request(app).get(`/api/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
    expect(response.body).toHaveProperty('email', 'testuser@example.com');
  });

  it('should update user information', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({ username: 'updateduser' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'updateduser');
  });

  it('should delete user', async () => {
    const response = await request(app).delete(`/api/users/${userId}`);
    expect(response.status).toBe(204);
  });
});