/**
 * Auth Endpoint Tests
 *
 * Covers:
 *   POST /api/v1/users/register
 *   POST /api/v1/users/login
 *   POST /api/v1/users/refresh-token
 *   GET  /api/v1/users/profile
 */
const request = require('supertest');
const app = require('./app');

// ── Helpers ──────────────────────────────────────────────────────────
const validUser = {
  email: 'test@example.com',
  password: 'Password1',
  firstName: 'Test',
  lastName: 'User',
};

/**
 * Register a user and return the supertest response.
 */
const registerUser = async (overrides = {}) => {
  const res = await request(app)
    .post('/api/v1/users/register')
    .send({ ...validUser, ...overrides });
  return res;
};

// ─────────────────────────────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/users/register', () => {
  it('should register a new user and return 201 with tokens', async () => {
    const res = await registerUser();

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', validUser.email);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('firstName', validUser.firstName);
    expect(res.body).toHaveProperty('lastName', validUser.lastName);
    expect(res.body).toHaveProperty('roles');
    expect(res.body.roles).toContain('consumer');
    // passwordHash must never leak
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('should return 400 when required fields are missing', async () => {
    // Missing password and names
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({ email: 'missing@fields.com' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/users/register')
      .send({ password: 'Password1', firstName: 'No', lastName: 'Email' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 for duplicate email registration', async () => {
    // First registration succeeds
    await registerUser();

    // Second registration with the same email should fail
    const res = await registerUser();

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/already exists|duplicate/i);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/users/login', () => {
  beforeEach(async () => {
    // Seed a user to login against
    await registerUser();
  });

  it('should login with valid credentials and return 200 with token', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', validUser.email);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app).post('/api/v1/users/login').send({ password: 'Password1' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app).post('/api/v1/users/login').send({ email: validUser.email });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/users/refresh-token', () => {
  let refreshToken;

  beforeEach(async () => {
    const res = await registerUser();
    refreshToken = res.body.refreshToken;
  });

  it('should return 200 with new tokens when given a valid refresh token', async () => {
    const res = await request(app).post('/api/v1/users/refresh-token').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(typeof res.body.token).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
  });

  it('should return 401 when given an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/users/refresh-token')
      .send({ refreshToken: 'this.is.not.valid' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 when refresh token is missing', async () => {
    const res = await request(app).post('/api/v1/users/refresh-token').send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Profile (authenticated)
// ─────────────────────────────────────────────────────────────────────
describe('GET /api/v1/users/profile', () => {
  let token;

  beforeEach(async () => {
    const res = await registerUser();
    token = res.body.token;
  });

  it('should return 200 with user data when given a valid auth header', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', validUser.email);
    expect(res.body).toHaveProperty('firstName', validUser.firstName);
    expect(res.body).toHaveProperty('lastName', validUser.lastName);
    // Sensitive fields must be stripped by the toJSON transform
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body).not.toHaveProperty('verificationToken');
    expect(res.body).not.toHaveProperty('otpCode');
  });

  it('should return 401 when no auth header is provided', async () => {
    const res = await request(app).get('/api/v1/users/profile');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 401 when auth token is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
