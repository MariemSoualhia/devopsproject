const request = require('supertest');
const app = require('../index'); // Change this path according to your project structure

describe('Authentication API tests', () => {
  let userToken;

  it('should register a new user successfully from POST /api/register', async () => {
    const userData = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/register')
      .send(userData);

    expect(response.status).toBe(201); // Assuming successful registration returns 201
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should not register an existing user from POST /api/register', async () => {
    const userData = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/register')
      .send(userData);

    expect(response.status).toBe(400); // Assuming attempting to re-register returns 400
    expect(response.body.message).toBe('Email already exists');
  });

  it('should log in an existing user from POST /api/login', async () => {
    const credentials = {
      email: 'johndoe@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/login')
      .send(credentials);

    expect(response.status).toBe(200);    
    userToken = response.body.token;
  });

  it('should not log in with incorrect credentials from POST /api/login', async () => {
    const credentials = {
      email: 'johndoe@example.com',
      password: 'wrongpassword', // Incorrect password
    };

    const response = await request(app)
      .post('/api/login')
      .send(credentials);

    expect(response.status).toBe(422); // Assuming incorrect credentials return 422
    // Add an expectation based on your API response for incorrect login
  });

  it('should not get user profile without authentication from GET /api/profile', async () => {
    const response = await request(app)
      .get('/api/profile');

    expect(response.status).toBe(401); // Assuming unauthorized access returns 401
    // Add an expectation based on your API response for unauthorized access to user profile
  });

  it('should log out a user from POST /api/logout', async () => {
    const response = await request(app)
      .post('/api/logout')
      .set('Cookie', [`token=${userToken}`]);

    expect(response.status).toBe(200);
    expect(response.body).toBe(true);
  });
});
