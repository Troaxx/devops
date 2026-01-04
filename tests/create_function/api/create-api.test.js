const request = require('supertest');
const express = require('express');
const CreateStudentUtil = require('../../../utils/DaniellaUtil');
const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../../../utils/students.json');

// Create Express app for testing
const app = express();
app.use(express.json());
app.post('/api/students', CreateStudentUtil.createStudent);

describe('Create API Tests - Daniella (Jest + Supertest)', () => {
  let originalData;

  beforeAll(async () => {
    // Backup original data
    try {
      originalData = await fs.readFile(DB_PATH, 'utf8');
    } catch (error) {
      originalData = JSON.stringify({ students: [] }, null, 2);
    }
  });

  beforeEach(async () => {
    // Reset to empty students before each test
    await fs.writeFile(DB_PATH, JSON.stringify({ students: [] }, null, 2));
  });

  afterAll(async () => {
    // Restore original data
    if (originalData) {
      await fs.writeFile(DB_PATH, originalData);
    }
  });

  describe('POST /api/students - Success Cases', () => {
    test('should create a new student with valid data (201)', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2409999a',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.student.id).toBe('2409999a');
      expect(response.body.student.rapid).toBe(1200);
      expect(response.body.student.blitz).toBe(1150);
      expect(response.body.student.bullet).toBe(1100);
      expect(response.body.student.createdAt).toBeDefined();
    });

    test('should handle boundary values (0 and 3000)', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2409999b',
          rapid: 0,
          blitz: 1500,
          bullet: 3000
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.student.rapid).toBe(0);
      expect(response.body.student.bullet).toBe(3000);
    });

    test('should parse string numbers correctly', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2409999c',
          rapid: '1200',
          blitz: '1150',
          bullet: '1100'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.student.rapid).toBe('number');
      expect(typeof response.body.student.blitz).toBe('number');
      expect(typeof response.body.student.bullet).toBe('number');
    });
  });

  describe('POST /api/students - Validation Errors (400)', () => {
    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2409999d'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    test('should return 400 for empty body', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    test('should return 400 for invalid ID format (too short)', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '123456a',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid ID format');
    });

    test('should return 400 for invalid ID format (wrong suffix)', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2409999z',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid ID format');
    });

    test('should return 400 for scores above 3000', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2409999e',
          rapid: 3500,
          blitz: 1150,
          bullet: 1100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid scores');
    });

    test('should return 400 for negative scores', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2408001a',
          rapid: -100,
          blitz: 1150,
          bullet: 1100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid scores');
    });

    test('should return 400 for blitz score out of range', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2408002b',
          rapid: 1200,
          blitz: 5000,
          bullet: 1100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid scores');
    });

    test('should return 400 for bullet score out of range', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2408003c',
          rapid: 1200,
          blitz: 1150,
          bullet: -50
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid scores');
    });
  });

  describe('POST /api/students - Duplicate Detection (409)', () => {
    test('should return 409 for duplicate student ID', async () => {
      const studentData = {
        id: '2408004d',
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      };

      // Create first student
      await request(app)
        .post('/api/students')
        .send(studentData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/students')
        .send(studentData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/students - Valid ID Formats', () => {
    test('should accept ID with suffix "a"', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2403880a',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('should accept ID with suffix "e"', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          id: '2403880e',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
