const fs = require('fs').promises;
const { addMember } = require('../utils/DaniellaUtil');
// Mock the 'fs' module so we don't interact with the real file system.
// Instead, we simulate how readFile and writeFile should behave.
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  }
}));
describe('Unit Tests for Utils', () => {
  // Reset mocks before each test to avoid "leaking" state between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it ('addMember should add a member', async () => {
    const req = {
      body: {
        id: '2403880d',
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      }
    };
    const res = {
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

    await CreateStudentUtil.createStudent(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.student.id).toBe(testId);
    expect(res.responseData.student.rapid).toBe(1200);
    expect(res.responseData.student.blitz).toBe(1150);
    expect(res.responseData.student.bullet).toBe(1100);
    expect(res.responseData.student.createdAt).toBeDefined();

    const fileData = await fs.readFile(DB_PATH, 'utf8');
    const students = JSON.parse(fileData);
    expect(students.students.length).toBe(1);
    expect(students.students[0].id).toBe(testId);
    expect(students.students[0].rapid).toBe(1200);
    expect(students.students[0].blitz).toBe(1150);
    expect(students.students[0].bullet).toBe(1100);
  });
});

const DB_PATH = path.join(__dirname, '../../../utils/students.json');
const BACKUP_PATH = path.join(__dirname, '../../../utils/students.backup.json');

test.describe('DaniellaUtil - Backend Unit Tests', () => {
  let originalData;

  test.beforeEach(async () => {
    try {
      originalData = await fs.readFile(DB_PATH, 'utf8');
    } catch (error) {
      originalData = JSON.stringify({ students: [] }, null, 2);
      await fs.writeFile(DB_PATH, originalData);
    }
    await fs.writeFile(BACKUP_PATH, originalData);
    await fs.writeFile(DB_PATH, JSON.stringify({ students: [] }, null, 2));
  });

  test.afterEach(async () => {
    if (originalData) {
      try {
        await fs.writeFile(DB_PATH, originalData);
      } catch (error) {
      }
    }
    try {
      await fs.unlink(BACKUP_PATH);
    } catch (error) {
    }
  });

  test('should validate missing required fields', async () => {
    const req = {
      body: {}
    };
    const res = {
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

    await CreateStudentUtil.createStudent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.responseData.success).toBe(false);
    expect(res.responseData.message).toContain('Missing required fields');
  });

  test('should validate ID format', async () => {
    const req = {
      body: {
        id: 'invalid-id',
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      }
    };
    const res = {
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

    await CreateStudentUtil.createStudent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.responseData.success).toBe(false);
    expect(res.responseData.message).toContain('Invalid ID format');
  });

  test('should validate score ranges', async () => {
    const req = {
      body: {
        id: '2403880d',
        rapid: 3500,
        blitz: 1150,
        bullet: 1100
      }
    };
    const res = {
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

    await CreateStudentUtil.createStudent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.responseData.success).toBe(false);
    expect(res.responseData.message).toContain('Invalid scores');
  });

  test('should validate duplicate student ID', async () => {
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

    await fs.writeFile(DB_PATH, JSON.stringify(existingStudents, null, 2));

    const req = {
      body: {
        id: '2403880d',
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      }
    };
    const res = {
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

    await CreateStudentUtil.createStudent(req, res);

    expect(res.statusCode).toBe(409);
    expect(res.responseData.success).toBe(false);
    expect(res.responseData.message).toContain('already exists');
  });

  test('should create student successfully and write to JSON file', async () => {
    const testId = '2409999a';
    const req = {
      body: {
        id: testId,
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      }
    };
    const res = {
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

    await CreateStudentUtil.createStudent(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.student.id).toBe(testId);
    expect(res.responseData.student.rapid).toBe(1200);
    expect(res.responseData.student.blitz).toBe(1150);
    expect(res.responseData.student.bullet).toBe(1100);
    expect(res.responseData.student.createdAt).toBeDefined();

    const fileData = await fs.readFile(DB_PATH, 'utf8');
    const students = JSON.parse(fileData);
    expect(students.students.length).toBe(1);
    expect(students.students[0].id).toBe(testId);
    expect(students.students[0].rapid).toBe(1200);
    expect(students.students[0].blitz).toBe(1150);
    expect(students.students[0].bullet).toBe(1100);
  });

  test('should handle file read errors gracefully', async () => {
    try {
      await fs.unlink(DB_PATH);
    } catch (error) {
    }

    const req = {
      body: {
        id: '2403880d',
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      }
    };
    const res = {
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

    await CreateStudentUtil.createStudent(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.responseData.success).toBe(false);
  });
});
