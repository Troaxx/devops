const { test, expect } = require('@playwright/test');

test.describe('Create API Tests - Daniella', () => {
  test('POST /api/students should create a new student with valid data', async ({ request }) => {
    const response = await request.post('/api/students', {
      data: {
        id: '2409999a',
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.student.id).toBe('2409999a');
    expect(body.student.rapid).toBe(1200);
    expect(body.student.blitz).toBe(1150);
    expect(body.student.bullet).toBe(1100);
    expect(body.student.createdAt).toBeDefined();
  });

  test('POST /api/students should return 400 for missing required fields', async ({ request }) => {
    const response = await request.post('/api/students', {
      data: {
        id: '2409999b'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Missing required fields');
  });

  test('POST /api/students should return 400 for invalid ID format', async ({ request }) => {
    const response = await request.post('/api/students', {
      data: {
        id: 'invalid-id',
        rapid: 1200,
        blitz: 1150,
        bullet: 1100
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Invalid ID format');
  });

  test('POST /api/students should return 400 for scores out of range', async ({ request }) => {
    const response = await request.post('/api/students', {
      data: {
        id: '2409999c',
        rapid: 3500,
        blitz: 1150,
        bullet: 1100
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Invalid scores');
  });

  test('POST /api/students should return 400 for negative scores', async ({ request }) => {
    const response = await request.post('/api/students', {
      data: {
        id: '2409999d',
        rapid: -100,
        blitz: 1150,
        bullet: 1100
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Invalid scores');
  });

  test('POST /api/students should return 409 for duplicate student ID', async ({ request }) => {
    const studentData = {
      id: '2409999e',
      rapid: 1200,
      blitz: 1150,
      bullet: 1100
    };

    await request.post('/api/students', { data: studentData });

    const response = await request.post('/api/students', {
      data: studentData
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('already exists');
  });

  test('POST /api/students should handle boundary values (0 and 3000)', async ({ request }) => {
    const response = await request.post('/api/students', {
      data: {
        id: '2409999f',
        rapid: 0,
        blitz: 1500,
        bullet: 3000
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.student.rapid).toBe(0);
    expect(body.student.bullet).toBe(3000);
  });

  test('POST /api/students should parse string numbers correctly', async ({ request }) => {
    const response = await request.post('/api/students', {
      data: {
        id: '2409999g',
        rapid: '1200',
        blitz: '1150',
        bullet: '1100'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(typeof body.student.rapid).toBe('number');
    expect(typeof body.student.blitz).toBe('number');
    expect(typeof body.student.bullet).toBe('number');
  });
});

