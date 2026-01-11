const CreateStudentUtil = require('../../../utils/DaniellaUtil');

// Mock the fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const fs = require('fs').promises;

describe('DaniellaUtil - Backend Unit Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      statusCode: null,
      responseData: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.responseData = data;
        return this;
      }
    };
  });

  describe('Test Suite 1: Input Validation Logic', () => {
    test('should return 400 for missing required fields (empty body)', async () => {
      mockReq = { body: {} };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Missing required fields');
    });

    test('should return 400 for missing id field', async () => {
      mockReq = {
        body: {
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Missing required fields');
    });

    test('should return 400 for missing rapid score', async () => {
      mockReq = {
        body: {
          id: '2403880d',
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Missing required fields');
    });

    test('should return 400 for invalid ID format (too short)', async () => {
      mockReq = {
        body: {
          id: '123456a',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Invalid ID format');
    });

    test('should return 400 for invalid ID format (wrong letter suffix)', async () => {
      mockReq = {
        body: {
          id: '2403880z',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Invalid ID format');
    });

    test('should return 400 for invalid ID format (no letter suffix)', async () => {
      mockReq = {
        body: {
          id: '24038801',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Invalid ID format');
    });

    test('should return 400 for scores above 3000', async () => {
      mockReq = {
        body: {
          id: '2403880d',
          rapid: 3500,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Invalid scores');
    });

    test('should return 400 for negative scores', async () => {
      mockReq = {
        body: {
          id: '2403880d',
          rapid: -100,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Invalid scores');
    });

    test('should return 400 for blitz score out of range', async () => {
      mockReq = {
        body: {
          id: '2403880d',
          rapid: 1200,
          blitz: 5000,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Invalid scores');
    });

    test('should return 400 for bullet score out of range', async () => {
      mockReq = {
        body: {
          id: '2403880d',
          rapid: 1200,
          blitz: 1150,
          bullet: -50
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('Invalid scores');
    });


    test('should return 409 for duplicate student ID', async () => {
      const existingStudents = {
        students: [
          {
            id: '2403880d',
            rapid: 1200,
            blitz: 1150,
            bullet: 1100,
            createdAt: '2025-01-01T00:00:00Z'
          }
        ]
      };

      fs.readFile.mockResolvedValue(JSON.stringify(existingStudents));

      mockReq = {
        body: {
          id: '2403880d',
          rapid: 1300,
          blitz: 1250,
          bullet: 1200
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(409);
      expect(mockRes.responseData.success).toBe(false);
      expect(mockRes.responseData.message).toContain('already exists');
    });
  });

  describe('Test Suite 2: Data Processing & Success Logic', () => {
    test('should create student successfully with valid data', async () => {
      const existingStudents = { students: [] };
      fs.readFile.mockResolvedValue(JSON.stringify(existingStudents));
      fs.writeFile.mockResolvedValue(undefined);

      mockReq = {
        body: {
          id: '2409999a',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.responseData.success).toBe(true);
      expect(mockRes.responseData.student.id).toBe('2409999a');
      expect(mockRes.responseData.student.rapid).toBe(1200);
      expect(mockRes.responseData.student.blitz).toBe(1150);
      expect(mockRes.responseData.student.bullet).toBe(1100);
      expect(mockRes.responseData.student.createdAt).toBeDefined();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('should handle boundary value 0 for scores', async () => {
      const existingStudents = { students: [] };
      fs.readFile.mockResolvedValue(JSON.stringify(existingStudents));
      fs.writeFile.mockResolvedValue(undefined);

      mockReq = {
        body: {
          id: '2409999b',
          rapid: 0,
          blitz: 0,
          bullet: 0
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.responseData.success).toBe(true);
      expect(mockRes.responseData.student.rapid).toBe(0);
      expect(mockRes.responseData.student.blitz).toBe(0);
      expect(mockRes.responseData.student.bullet).toBe(0);
    });

    test('should handle boundary value 3000 for scores', async () => {
      const existingStudents = { students: [] };
      fs.readFile.mockResolvedValue(JSON.stringify(existingStudents));
      fs.writeFile.mockResolvedValue(undefined);

      mockReq = {
        body: {
          id: '2409999c',
          rapid: 3000,
          blitz: 3000,
          bullet: 3000
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.responseData.success).toBe(true);
      expect(mockRes.responseData.student.rapid).toBe(3000);
      expect(mockRes.responseData.student.blitz).toBe(3000);
      expect(mockRes.responseData.student.bullet).toBe(3000);
    });

    test('should parse string numbers correctly', async () => {
      const existingStudents = { students: [] };
      fs.readFile.mockResolvedValue(JSON.stringify(existingStudents));
      fs.writeFile.mockResolvedValue(undefined);

      mockReq = {
        body: {
          id: '2409999d',
          rapid: '1200',
          blitz: '1150',
          bullet: '1100'
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.responseData.success).toBe(true);
      expect(typeof mockRes.responseData.student.rapid).toBe('number');
      expect(typeof mockRes.responseData.student.blitz).toBe('number');
      expect(typeof mockRes.responseData.student.bullet).toBe('number');
    });

    test('should accept all valid ID suffixes (a-e)', async () => {
      const validSuffixes = ['a', 'b', 'c', 'd', 'e'];

      for (const suffix of validSuffixes) {
        const existingStudents = { students: [] };
        fs.readFile.mockResolvedValue(JSON.stringify(existingStudents));
        fs.writeFile.mockResolvedValue(undefined);

        mockReq = {
          body: {
            id: `2403880${suffix}`,
            rapid: 1200,
            blitz: 1150,
            bullet: 1100
          }
        };

        await CreateStudentUtil.createStudent(mockReq, mockRes);

        expect(mockRes.statusCode).toBe(201);
        expect(mockRes.responseData.success).toBe(true);
      }
    });
  });

  describe('Test Suite 3: System Error & Exception Handling', () => {
    test('should return 500 when file read fails', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      mockReq = {
        body: {
          id: '2403880d',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData.success).toBe(false);
    });

    test('should return 500 when file write fails', async () => {
      const existingStudents = { students: [] };
      fs.readFile.mockResolvedValue(JSON.stringify(existingStudents));
      fs.writeFile.mockRejectedValue(new Error('Write permission denied'));

      mockReq = {
        body: {
          id: '2403880d',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData.success).toBe(false);
    });

    test('should return 500 when JSON parsing fails', async () => {
      fs.readFile.mockResolvedValue('invalid json');

      mockReq = {
        body: {
          id: '2403880d',
          rapid: 1200,
          blitz: 1150,
          bullet: 1100
        }
      };

      await CreateStudentUtil.createStudent(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.responseData.success).toBe(false);
    });
  });
});
