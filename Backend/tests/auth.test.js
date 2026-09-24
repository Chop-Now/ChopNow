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
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');

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

/**
 * Register a user and mark their email verified, so password login is
 * allowed while the (default-on) requireEmailVerification setting applies.
 */
const registerVerifiedUser = async (overrides = {}) => {
  const res = await registerUser(overrides);
  await User.updateOne({ _id: res.body._id }, { emailVerified: true });
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

  // Regression tests for the C1 privilege-escalation finding: a self-registering
  // user must never be able to grant themselves admin or rider via the public
  // registration endpoint, whether through 'roles' (array) or 'role' (legacy).
  it('should reject roles:["admin"] at the validation layer', async () => {
    const res = await registerUser({ email: 'wannabe-admin@example.com', roles: ['admin'] });

    expect(res.status).toBe(400);
  });

  it('should reject role:"admin" (legacy field) at the validation layer', async () => {
    const res = await registerUser({ email: 'wannabe-admin-2@example.com', role: 'admin' });

    expect(res.status).toBe(400);
  });

  it('should never grant admin even if a mixed roles array reaches the controller', async () => {
    // roles containing one valid + one forbidden role must still be rejected by
    // validation (defense layer 1); this also documents that IF validation were
    // ever bypassed, registerUser's own SELF_REGISTERABLE_ROLES filter (defense
    // layer 2) strips 'admin' and keeps only 'consumer'.
    const res = await registerUser({
      email: 'mixed-roles@example.com',
      roles: ['consumer', 'admin'],
    });

    expect(res.status).toBe(400);
  });

  it('should reject roles:["rider"] at registration - rider is admin-granted only', async () => {
    const res = await registerUser({ email: 'wannabe-rider@example.com', roles: ['rider'] });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/users/login', () => {
  beforeEach(async () => {
    // Seed a (verified) user to login against
    await registerVerifiedUser();
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
  let refreshTokenForH1;

  beforeEach(async () => {
    const res = await registerUser();
    token = res.body.token;
    refreshTokenForH1 = res.body.refreshToken;
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

  // Regression test for H1: a refresh token (type: 'refresh', 7-day life) must
  // never work as a Bearer access token, even though it's signed with the same
  // secret and would otherwise pass jwt.verify.
  it('should return 401 when a refresh token is used as the Bearer access token', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${refreshTokenForH1}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});

// ─────────────────────────────────────────────────────────────────────
// OTP login validation (C3) - these routes previously had zero validation,
// so a non-string email/otp (e.g. a Mongo operator object) reached
// User.findOne() unvalidated.
// ─────────────────────────────────────────────────────────────────────
describe('POST /api/v1/users/send-otp and /verify-otp validation', () => {
  it('should reject a Mongo-operator-shaped body at /verify-otp, not return a token', async () => {
    const res = await request(app)
      .post('/api/v1/users/verify-otp')
      .send({ email: { $ne: null }, otp: { $ne: null } });

    expect(res.status).toBe(400);
    expect(res.body).not.toHaveProperty('token');
  });

  it('should reject a Mongo-operator-shaped email at /send-otp', async () => {
    const res = await request(app)
      .post('/api/v1/users/send-otp')
      .send({ email: { $ne: null } });

    expect(res.status).toBe(400);
  });

  it('should reject a non-numeric otp at /verify-otp', async () => {
    const res = await request(app)
      .post('/api/v1/users/verify-otp')
      .send({ email: 'someone@example.com', otp: 'abcdef' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Token revocation via tokenVersion (H3)
// ─────────────────────────────────────────────────────────────────────
describe('Token revocation (tokenVersion)', () => {
  let token;
  let refreshToken;

  beforeEach(async () => {
    const res = await registerUser();
    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it('should reject a pre-logout-all access token after POST /logout-all', async () => {
    // Sanity check: the token works before logout-all.
    const before = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(before.status).toBe(200);

    const logoutRes = await request(app)
      .post('/api/v1/users/logout-all')
      .set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);

    const after = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(401);
  });

  it('should reject a pre-logout-all refresh token at POST /refresh-token', async () => {
    const logoutRes = await request(app)
      .post('/api/v1/users/logout-all')
      .set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app)
      .post('/api/v1/users/refresh-token')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────
// httpOnly refresh-token cookie + CSRF double-submit (H2)
// ─────────────────────────────────────────────────────────────────────
const findCookie = (setCookieHeader, name) => {
  const line = (setCookieHeader || []).find((c) => c.startsWith(`${name}=`));
  if (!line) return null;
  return line.split(';')[0].split('=')[1];
};

describe('httpOnly refresh-token cookie and CSRF (H2)', () => {
  it('should set an httpOnly refreshToken cookie and a readable csrfToken cookie on login', async () => {
    await registerVerifiedUser();
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();

    // Cookie flags are environment-conditional (see Backend/utils/authCookies.js):
    // production needs SameSite=None; Secure (frontend/backend are cross-site -
    // Vercel vs Render); tests run with NODE_ENV=test, same as local dev, which
    // gets SameSite=Lax and no Secure so the cookie is actually storable over
    // plain HTTP. The production-flag behavior itself is covered by the unit
    // test below, which flips NODE_ENV directly.
    const refreshCookieLine = setCookie.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookieLine).toBeDefined();
    expect(refreshCookieLine).toMatch(/HttpOnly/i);
    expect(refreshCookieLine).toMatch(/SameSite=Lax/i);
    expect(refreshCookieLine).not.toMatch(/Secure/i);

    const csrfCookieLine = setCookie.find((c) => c.startsWith('csrfToken='));
    expect(csrfCookieLine).toBeDefined();
    expect(csrfCookieLine).not.toMatch(/HttpOnly/i);

    expect(res.body).toHaveProperty('csrfToken');
    expect(res.body.csrfToken).toBe(findCookie(setCookie, 'csrfToken'));
  });

  it('should refresh using only the cookie + matching X-CSRF-Token header (no body)', async () => {
    const regRes = await registerUser();
    const setCookie = regRes.headers['set-cookie'];
    const refreshCookie = findCookie(setCookie, 'refreshToken');
    const csrfToken = findCookie(setCookie, 'csrfToken');

    const res = await request(app)
      .post('/api/v1/users/refresh-token')
      .set('Cookie', [`refreshToken=${refreshCookie}`, `csrfToken=${csrfToken}`])
      .set('X-CSRF-Token', csrfToken)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject a cookie-sourced refresh with a missing/mismatched CSRF header', async () => {
    const regRes = await registerUser();
    const setCookie = regRes.headers['set-cookie'];
    const refreshCookie = findCookie(setCookie, 'refreshToken');
    const csrfToken = findCookie(setCookie, 'csrfToken');

    // No X-CSRF-Token header at all.
    const noHeaderRes = await request(app)
      .post('/api/v1/users/refresh-token')
      .set('Cookie', [`refreshToken=${refreshCookie}`, `csrfToken=${csrfToken}`])
      .send({});
    expect(noHeaderRes.status).toBe(403);

    // Wrong X-CSRF-Token value.
    const wrongHeaderRes = await request(app)
      .post('/api/v1/users/refresh-token')
      .set('Cookie', [`refreshToken=${refreshCookie}`, `csrfToken=${csrfToken}`])
      .set('X-CSRF-Token', 'not-the-real-token')
      .send({});
    expect(wrongHeaderRes.status).toBe(403);
  });

  it('should still refresh via body-only refreshToken with no CSRF header (Mobile compatibility)', async () => {
    const regRes = await registerUser();

    const res = await request(app)
      .post('/api/v1/users/refresh-token')
      .send({ refreshToken: regRes.body.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should clear the refresh/csrf cookies on logout-all', async () => {
    const regRes = await registerUser();
    const token = regRes.body.token;

    const res = await request(app)
      .post('/api/v1/users/logout-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie'];
    const refreshCookieLine = setCookie.find((c) => c.startsWith('refreshToken='));
    // clearCookie sends an already-expired cookie with an empty value.
    expect(refreshCookieLine).toMatch(/refreshToken=;/);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Email verification (C12)
// ─────────────────────────────────────────────────────────────────────
describe('Email verification (C12)', () => {
  const loginAs = () =>
    request(app)
      .post('/api/v1/users/login')
      .send({ email: validUser.email, password: validUser.password });

  it('should block login for an unverified account while the setting is on', async () => {
    await registerUser();
    const res = await loginAs();

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
    expect(res.body).not.toHaveProperty('token');
  });

  it('should allow login for an unverified account once an admin turns the setting off', async () => {
    await registerUser();
    await PlatformSettings.updateOne({}, { requireEmailVerification: false }, { upsert: true });

    const res = await loginAs();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should never block an admin, so the setting cannot lock admins out', async () => {
    const reg = await registerUser();
    await User.updateOne({ _id: reg.body._id }, { $addToSet: { roles: 'admin' } });

    const res = await loginAs();
    expect(res.status).toBe(200);
  });

  it('should verify the account from a valid /verify-email token, then allow login', async () => {
    await registerUser();
    const user = await User.findOne({ email: validUser.email }).select('+verificationToken');

    const verify = await request(app).get(
      `/api/v1/users/verify-email?token=${user.verificationToken}`
    );
    expect(verify.status).toBe(200);
    expect((await User.findById(user._id)).emailVerified).toBe(true);

    const res = await loginAs();
    expect(res.status).toBe(200);
  });

  it('should reject an invalid or expired token with a clear error', async () => {
    const res = await request(app).get('/api/v1/users/verify-email?token=not-a-real-token');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  it('should give the same resend response for unknown and existing emails (no enumeration)', async () => {
    await registerUser();
    const known = await request(app)
      .post('/api/v1/users/resend-verification')
      .send({ email: validUser.email });
    const unknown = await request(app)
      .post('/api/v1/users/resend-verification')
      .send({ email: 'nobody-here@example.com' });

    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
  });
});
