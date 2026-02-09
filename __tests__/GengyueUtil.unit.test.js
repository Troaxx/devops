/**
 * Backend Unit Tests for GengyueUtil.js
 * Tests for loginStudent, getStudentById, and updateScores functions
 */

const path = require('path');

// Mock fs promises before requiring the module
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();

jest.mock('fs', () => ({
  promises: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
}));

const { loginStudent, getStudentById, updateScores } = require('../utils/GengyueUtil');

describe('GengyueUtil - Backend Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockStudentsData;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock students data
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

  // ==================== loginStudent Tests ====================
  describe('loginStudent', () => {
    test('should successfully login with valid student ID', async () => {
      mockReq.body = { id: '2403800d' };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      await loginStudent(mockReq, mockRes);

      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('students.json'),
        'utf8'
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful!',
        student: mockStudentsData.students[0],
      });
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should return 400 error when student ID is not provided', async () => {
      mockReq.body = {};

      await loginStudent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Student ID is required.',
      });
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    test('should return 400 error when student ID is empty string', async () => {
      mockReq.body = { id: '' };

      await loginStudent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Student ID is required.',
      });
    });

    test('should return 404 error when student ID is not found', async () => {
      mockReq.body = { id: '9999999z' };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      await loginStudent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Student ID not found. Please check your ID and try again.',
      });
    });

    test('should return 500 error when database read fails', async () => {
      mockReq.body = { id: '2403800d' };
      const error = new Error('Database read error');
      mockReadFile.mockRejectedValue(error);

      await loginStudent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to login. Please try again.',
        error: error.message,
      });
    });

    test('should handle malformed JSON data', async () => {
      mockReq.body = { id: '2403800d' };
      mockReadFile.mockResolvedValue('invalid json');

      await loginStudent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Failed to login. Please try again.',
        })
      );
    });
  });

  // ==================== getStudentById Tests ====================
  describe('getStudentById', () => {
    test('should successfully retrieve student by ID', async () => {
      mockReq.params = { id: '2403800d' };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      await getStudentById(mockReq, mockRes);

      expect(mockReadFile).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        student: mockStudentsData.students[0],
      });
    });

    test('should return 404 when student ID not found', async () => {
      mockReq.params = { id: '9999999z' };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      await getStudentById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Student not found.',
      });
    });

    test('should return 500 error when database read fails', async () => {
      mockReq.params = { id: '2403800d' };
      const error = new Error('Read error');
      mockReadFile.mockRejectedValue(error);

      await getStudentById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve student data',
        error: error.message,
      });
    });
  });

  // ==================== updateScores Tests ====================
  describe('updateScores', () => {
    test('should successfully update all scores with valid data', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 1300,
        blitz: 1250,
        bullet: 1200,
      };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      await updateScores(mockReq, mockRes);

      expect(mockReadFile).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Scores updated successfully!',
          student: expect.objectContaining({
            id: '2403800d',
            rapid: 1300,
            blitz: 1250,
            bullet: 1200,
          }),
          changes: expect.objectContaining({
            rapid: { old: 1200, new: 1300 },
            blitz: { old: 1150, new: 1250 },
            bullet: { old: 1100, new: 1200 },
          }),
        })
      );
    });

    test('should return 400 error when rapid score is missing', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        blitz: 1250,
        bullet: 1200,
      };

      await updateScores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All rating fields (Rapid, Blitz, Bullet) are required.',
      });
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    test('should return 400 error when blitz score is missing', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 1300,
        bullet: 1200,
      };

      await updateScores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All rating fields (Rapid, Blitz, Bullet) are required.',
      });
    });

    test('should return 400 error when bullet score is missing', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 1300,
        blitz: 1250,
      };

      await updateScores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All rating fields (Rapid, Blitz, Bullet) are required.',
      });
    });

    test('should return 400 error when rapid score is below 0', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: -100,
        blitz: 1250,
        bullet: 1200,
      };

      await updateScores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid scores. All ratings must be between 0 and 3000.',
      });
    });

    test('should return 400 error when rapid score is above 3000', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 3500,
        blitz: 1250,
        bullet: 1200,
      };

      await updateScores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid scores. All ratings must be between 0 and 3000.',
      });
    });

    test('should accept boundary value of 0 for all scores', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 0,
        blitz: 0,
        bullet: 0,
      };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      await updateScores(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          student: expect.objectContaining({
            rapid: 0,
            blitz: 0,
            bullet: 0,
          }),
        })
      );
    });

    test('should accept boundary value of 3000 for all scores', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 3000,
        blitz: 3000,
        bullet: 3000,
      };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      await updateScores(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          student: expect.objectContaining({
            rapid: 3000,
            blitz: 3000,
            bullet: 3000,
          }),
        })
      );
    });

    test('should return 404 error when student ID not found during update', async () => {
      mockReq.params = { id: '9999999z' };
      mockReq.body = {
        rapid: 1300,
        blitz: 1250,
        bullet: 1200,
      };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));

      await updateScores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Student ID not found. Cannot update scores.',
      });
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    test('should return 500 error when database write fails', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 1300,
        blitz: 1250,
        bullet: 1200,
      };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      const error = new Error('Write error');
      mockWriteFile.mockRejectedValue(error);

      await updateScores(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update scores. Please try again.',
        error: error.message,
      });
    });

    test('should update updatedAt timestamp when updating scores', async () => {
      mockReq.params = { id: '2403800d' };
      mockReq.body = {
        rapid: 1300,
        blitz: 1250,
        bullet: 1200,
      };
      mockReadFile.mockResolvedValue(JSON.stringify(mockStudentsData));
      mockWriteFile.mockResolvedValue();

      await updateScores(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          student: expect.objectContaining({
            updatedAt: expect.any(String),
          }),
        })
      );
    });
  });
});
