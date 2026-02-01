const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('../routes/userRoutes');
const { errorHandler } = require('../middleware/errorHandler');
const User = require('../models/User');

// Mock Mongoose and Models
jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    connection: { readyState: 1 },
    Schema: class {
        constructor() {
            this.methods = {};
            this.statics = {};
        }
        index() { }
        pre() { }
        post() { }
    },
    model: jest.fn(),
    Types: { ObjectId: jest.fn() }
}));

jest.mock('../models/User', () => ({
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
}));

// Mock other utils
jest.mock('../utils/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../utils/cloudinaryUpload', () => ({
    uploadToCloudinary: jest.fn().mockResolvedValue({ secure_url: 'http://example.com/image.jpg' })
}));

jest.mock('bcrypt', () => ({
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true)
}));

let app;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_12345';
    process.env.NODE_ENV = 'test';

    app = express();
    app.use(express.json());

    // Mock request ID
    app.use((req, res, next) => {
        req.id = 'test-req-id';
        next();
    });

    app.use('/api/users', userRoutes);
    app.use(errorHandler);
});

describe('Auth Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user', async () => {
        // Mock User.findOne to return null (user doesn't exist)
        User.findOne.mockResolvedValue(null);
        // Mock User.create to return a user object
        User.create.mockResolvedValue({
            _id: 'mock_user_id',
            email: 'test@example.com',
            role: 'consumer',
            firstName: 'John',
            lastName: 'Doe',
            emailVerified: false
        });

        const res = await request(app)
            .post('/api/users/register')
            .send({
                email: 'test@example.com',
                password: 'Password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'consumer'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });



    it('should login the user', async () => {
        User.findOne.mockResolvedValue({
            _id: 'mock_user_id',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            role: 'consumer',
            status: 'active'
        });

        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: 'test@example.com',
                password: 'Password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
