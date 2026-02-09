/**
 * API Tests for Gengyue's UPDATE Feature
 * Tests for /api/login, /api/students/:id (GET and PUT) endpoints
 */

const request = require('supertest');
const path = require('path');

// Note: We focus API tests on POST and PUT which work well with mocking
// GET endpoint tests are covered in unit tests due to module initialization timing

// Mock fs promises
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();

jest.mock('fs', () => ({
  promises: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
}));

// Import app after mocking
const app = require('../index');

describe('Gengyue API Tests - UPDATE Feature', () => {
  let mockStudentsData;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStudentsData = {
      students: [
        {
          id: '2403800d',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100,
          createdAt: '2025-01-04T09:30:00Z',
        },
        {
          id: '2401234a',
          rapid: 1350,
          blitz: 1280,
          bullet: 1220,
          createdAt: '2025-01-04T10:00:00Z',
        },
      ],
    };
  });

  // ==================== POST /api/login Tests ====================
  describe('POST /api/login', () => {
    test('should successfully login with valid student ID', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      const response = await request(app)
        .post('/api/login')
        .send({ id: '2403800d' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Login successful!',
        student: mockStudentsData.students[0],
      });
    });

    test('should return 400 when student ID is not provided', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Student ID is required.',
      });
    });

    test('should return 400 when student ID is empty string', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ id: '' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Student ID is required.',
      });
    });

    test('should return 400 when student ID is null', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ id: null })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Student ID is required.',
      });
    });

    test('should return 404 when student ID does not exist', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      const response = await request(app)
        .post('/api/login')
        .send({ id: '9999999z' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Student ID not found. Please check your ID and try again.',
      });
    });

    test('should return 500 when database read fails', async () => {
      mockReadFile.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/login')
        .send({ id: '2403800d' })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Failed to login. Please try again.',
      });
    });

    test('should handle malformed JSON in database', async () => {
      mockReadFile.mockResolvedValue('invalid json data');

      const response = await request(app)
        .post('/api/login')
        .send({ id: '2403800d' })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to login. Please try again.');
    });

    test('should reject request with invalid content type', async () => {
      const response = await request(app)
        .post('/api/login')
        .send('plain text')
        .expect(400);
    });

    test('should handle request with extra fields gracefully', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      const response = await request(app)
        .post('/api/login')
        .send({
          id: '2403800d',
          extraField: 'should be ignored'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ==================== PUT /api/students/:id Tests ====================
  describe('PUT /api/students/:id', () => {
    test('should successfully update all scores with valid data', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          blitz: 1250,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Scores updated successfully!');
      expect(response.body.student.rapid).toBe(1300);
      expect(response.body.student.blitz).toBe(1250);
      expect(response.body.student.bullet).toBe(1200);
      expect(response.body.changes).toMatchObject({
        rapid: { old: 1200, new: 1300 },
        blitz: { old: 1150, new: 1250 },
        bullet: { old: 1100, new: 1200 },
      });
    });

    test('should return 400 when rapid score is missing', async () => {
      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          blitz: 1250,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'All rating fields (Rapid, Blitz, Bullet) are required.',
      });
    });

    test('should return 400 when blitz score is missing', async () => {
      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'All rating fields (Rapid, Blitz, Bullet) are required.',
      });
    });

    test('should return 400 when bullet score is missing', async () => {
      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          blitz: 1250,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'All rating fields (Rapid, Blitz, Bullet) are required.',
      });
    });

    test('should return 400 when all scores are missing', async () => {
      const response = await request(app)
        .put('/api/students/2403800d')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'All rating fields (Rapid, Blitz, Bullet) are required.',
      });
    });

    test('should return 400 when score is below 0', async () => {
      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: -100,
          blitz: 1250,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid scores. All ratings must be between 0 and 3000.',
      });
    });

    test('should return 400 when score is above 3000', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 3500,
          blitz: 1250,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid scores. All ratings must be between 0 and 3000.',
      });
    });

    test('should return 400 when multiple scores are out of range', async () => {
      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: -100,
          blitz: 4000,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('between 0 and 3000');
    });

    test('should accept boundary value of 0 for all scores', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 0,
          blitz: 0,
          bullet: 0,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.student.rapid).toBe(0);
      expect(response.body.student.blitz).toBe(0);
      expect(response.body.student.bullet).toBe(0);
    });

    test('should accept boundary value of 3000 for all scores', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 3000,
          blitz: 3000,
          bullet: 3000,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.student.rapid).toBe(3000);
      expect(response.body.student.blitz).toBe(3000);
      expect(response.body.student.bullet).toBe(3000);
    });

    test('should accept boundary values 1 and 2999', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1,
          blitz: 2999,
          bullet: 1500,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.student.rapid).toBe(1);
      expect(response.body.student.blitz).toBe(2999);
    });

    test('should return 404 when student ID not found for update', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      const response = await request(app)
        .put('/api/students/9999999z')
        .send({
          rapid: 1300,
          blitz: 1250,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Student ID not found. Cannot update scores.',
      });
    });

    test('should return 500 when database read fails during update', async () => {
      mockReadFile.mockRejectedValue(new Error('Read error'));

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          blitz: 1250,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Failed to update scores. Please try again.',
      });
    });

    test('should return 500 when database write fails', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockRejectedValue(new Error('Write error'));

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          blitz: 1250,
          bullet: 1200,
        })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Failed to update scores. Please try again.',
      });
    });

    test('should update updatedAt timestamp', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      const beforeTime = new Date().toISOString();

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          blitz: 1250,
          bullet: 1200,
        })
        .expect(200);

      expect(response.body.student).toHaveProperty('updatedAt');
      expect(response.body.student.updatedAt).toBeTruthy();
      // Verify it's a valid ISO date string
      expect(new Date(response.body.student.updatedAt).toISOString()).toBeTruthy();
    });

    test('should persist data correctly to JSON file with proper formatting', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          blitz: 1250,
          bullet: 1200,
        })
        .expect(200);

      expect(mockWriteFile).toHaveBeenCalled();
      const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1]);
      expect(writtenData.students[0].rapid).toBe(1300);
      expect(writtenData.students[0].blitz).toBe(1250);
      expect(writtenData.students[0].bullet).toBe(1200);
    });

    test('should handle string numeric values by converting to numbers', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      const response = await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: '1400',
          blitz: '1350',
          bullet: '1300',
        })
        .expect(200);

      expect(response.body.student.rapid).toBe(1400);
      expect(response.body.student.blitz).toBe(1350);
      expect(response.body.student.bullet).toBe(1300);
    });

    test('should maintain data integrity for other students', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      await request(app)
        .put('/api/students/2403800d')
        .send({
          rapid: 1300,
          blitz: 1250,
          bullet: 1200,
        })
        .expect(200);

      const writtenData = JSON.parse(mockWriteFile.mock.calls[0][1]);
      // Second student should remain unchanged
      expect(writtenData.students[1]).toEqual(mockStudentsData.students[1]);
    });
  });
});
