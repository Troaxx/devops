const { test, expect } = require('@playwright/test');

test.describe('Create Frontend Tests - Daniella', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Create Account")');
    await page.waitForSelector('#create-section.active');
  });

  test('should display create form with all required fields', async ({ page }) => {
    await expect(page.locator('#student-id')).toBeVisible();
    await expect(page.locator('#rapid-score')).toBeVisible();
    await expect(page.locator('#blitz-score')).toBeVisible();
    await expect(page.locator('#bullet-score')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error message for empty student ID', async ({ page }) => {
    await page.fill('#rapid-score', '1200');
    await page.fill('#blitz-score', '1150');
    await page.fill('#bullet-score', '1100');
    await page.click('button[type="submit"]');

    const message = page.locator('#create-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Please enter a student ID');
    await expect(message).toHaveClass(/error/);
  });

  test('should show error message for invalid ID format', async ({ page }) => {
    await page.fill('#student-id', 'invalid-id');
    await page.fill('#rapid-score', '1200');
    await page.fill('#blitz-score', '1150');
    await page.fill('#bullet-score', '1100');
    await page.click('button[type="submit"]');

    const message = page.locator('#create-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Invalid ID format');
    await expect(message).toHaveClass(/error/);
  });

  test('should show error message for missing rating fields', async ({ page }) => {
    await page.fill('#student-id', '2403880d');
    await page.fill('#rapid-score', '1200');
    await page.click('button[type="submit"]');

    const message = page.locator('#create-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('Please fill in all rating fields');
    await expect(message).toHaveClass(/error/);
  });

  test('should successfully create student with valid data', async ({ page }) => {
    const testId = `240${Math.floor(Math.random() * 10000)}a`;

    await page.fill('#student-id', testId);
    await page.fill('#rapid-score', '1200');
    await page.fill('#blitz-score', '1150');
    await page.fill('#bullet-score', '1100');

    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/students') && response.request().method() === 'POST'
    );

    await page.click('button[type="submit"]');
    await responsePromise;

    const message = page.locator('#create-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('successfully');
    await expect(message).toHaveClass(/success/);

    await expect(page.locator('#student-id')).toHaveValue('');
  });

  test('should show error message for duplicate student ID', async ({ page }) => {
    const testId = `240${Math.floor(Math.random() * 10000)}a`;

    await page.fill('#student-id', testId);
    await page.fill('#rapid-score', '1200');
    await page.fill('#blitz-score', '1150');
    await page.fill('#bullet-score', '1100');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.fill('#student-id', testId);
    await page.fill('#rapid-score', '1300');
    await page.fill('#blitz-score', '1250');
    await page.fill('#bullet-score', '1200');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const message = page.locator('#create-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('already exists');
    await expect(message).toHaveClass(/error/);
  });

  test('should validate ID format pattern (7 digits + letter a-e)', async ({ page }) => {
    const invalidIds = ['1234567', '12345678', '1234567z', 'abcdefgh'];

    for (const invalidId of invalidIds) {
      await page.fill('#student-id', invalidId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      const message = page.locator('#create-message');
      await expect(message).toContainText('Invalid ID format');

      await page.fill('#student-id', '');
    }
  });

  test('should accept valid ID format', async ({ page }) => {
    const validIds = ['2403880a', '2403880b', '2403880c', '2403880d', '2403880e'];

    for (const validId of validIds) {
      await page.fill('#student-id', validId);
      await page.fill('#rapid-score', '1200');
      await page.fill('#blitz-score', '1150');
      await page.fill('#bullet-score', '1100');

      const responsePromise = page.waitForResponse(response =>
        response.url().includes('/api/students') && response.request().method() === 'POST'
      );

      await page.click('button[type="submit"]');
      await responsePromise;
      await page.waitForTimeout(500);

      const message = page.locator('#create-message');
      const messageText = await message.textContent();

      if (messageText.includes('already exists')) {
        continue;
      }

      await expect(message).toContainText('successfully');
    }
  });

  test('should reset form after successful creation', async ({ page }) => {
    const testId = `240${Math.floor(Math.random() * 10000)}a`;

    await page.fill('#student-id', testId);
    await page.fill('#rapid-score', '1200');
    await page.fill('#blitz-score', '1150');
    await page.fill('#bullet-score', '1100');

    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/students') && response.request().method() === 'POST'
    );

    await page.click('button[type="submit"]');
    await responsePromise;
    await page.waitForTimeout(500);

    await expect(page.locator('#student-id')).toHaveValue('');
    await expect(page.locator('#rapid-score')).toHaveValue('');
    await expect(page.locator('#blitz-score')).toHaveValue('');
    await expect(page.locator('#bullet-score')).toHaveValue('');
  });

  test('should auto-hide success message after 5 seconds', async ({ page }) => {
    const testId = `240${Math.floor(Math.random() * 10000)}a`;

    await page.fill('#student-id', testId);
    await page.fill('#rapid-score', '1200');
    await page.fill('#blitz-score', '1150');
    await page.fill('#bullet-score', '1100');

    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/students') && response.request().method() === 'POST'
    );

    await page.click('button[type="submit"]');
    await responsePromise;

    const message = page.locator('#create-message');
    await expect(message).toBeVisible();
    await expect(message).toHaveClass(/success/);

    await page.waitForTimeout(6000);
    await expect(message).not.toBeVisible();
  });
});

